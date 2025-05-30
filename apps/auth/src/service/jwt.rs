use crate::infra::types::Config;
use crate::models::{jwt::*, EntityType};
use actix_web::dev::ServiceRequest;
use actix_web::{http::header, HttpRequest};
use actix_web::{web, HttpMessage};
use actix_web_httpauth::extractors::bearer::BearerAuth;
use base64::Engine;
use jsonwebtoken::{
    decode, //
    encode,
    DecodingKey,
    EncodingKey,
    Header,
    TokenData,
    Validation,
};
use sea_orm::EntityTrait;
use sea_orm::{ActiveModelTrait, ActiveValue::Set, DatabaseConnection};
use sqlx::types::chrono::Utc;
use time::{Duration, OffsetDateTime};
use uuid::Uuid;

use crate::entities::revoked_token;

pub async fn validator(
    req: ServiceRequest,
    credentials: BearerAuth,
) -> Result<ServiceRequest, (actix_web::Error, ServiceRequest)> {
    let jwt_secret = match req.app_data::<web::Data<Config>>() {
        Some(data) => data.get_ref().jwt_secret.clone(),
        None => {
            return Err((
                actix_web::error::ErrorInternalServerError("JWT secret not configured"),
                req,
            ))
        }
    };

    let db = match req.app_data::<web::Data<DatabaseConnection>>() {
        Some(data) => data.get_ref().clone(),
        None => {
            return Err((
                actix_web::error::ErrorInternalServerError("Database connection not configured"),
                req,
            ))
        }
    };

    match verify_jwt(credentials.token(), &jwt_secret, &db).await {
        Ok(token_data) => {
            req.extensions_mut().insert(token_data.claims);
            Ok(req)
        }
        Err(_) => Err((
            actix_web::error::ErrorUnauthorized("Invalid or revoked token"),
            req,
        )),
    }
}

pub async fn verify_jwt(
    token: &str,
    jwt_secret: &str,
    db: &DatabaseConnection,
) -> Result<TokenData<Claims>, VerificationError> {
    let token_data = decode::<Claims>(
        token,
        &DecodingKey::from_secret(jwt_secret.as_bytes()),
        &Validation::default(),
    )?;

    let jti = &token_data.claims.jti;
    if revoked_token::Entity::find_by_id(jti.clone())
        .one(db)
        .await?
        .is_some()
    {
        return Err(VerificationError::Revoked);
    }

    token_data.claims.parse_subject()?;

    Ok(token_data)
}

pub fn create_jwt(entity_id: &str, entity_type: EntityType, jwt_secret: &str) -> String {
    let now = OffsetDateTime::now_utc();
    let exp = (now + Duration::hours(24)).unix_timestamp() as usize;

    let claims = Claims {
        sub: base64::engine::general_purpose::STANDARD.encode(
            format!(
                "{}:{}", //
                entity_type.to_string(),
                entity_id,
            )
            .as_bytes(),
        ),
        iat: now.unix_timestamp() as usize,
        exp,
        jti: Uuid::new_v4().to_string(),
    };

    encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(jwt_secret.as_bytes()),
    )
    .expect("Failed to create token")
}

pub fn extract_bearer(req: &HttpRequest) -> Result<&str, &'static str> {
    let hdr = req
        .headers()
        .get(header::AUTHORIZATION)
        .and_then(|h| h.to_str().ok())
        .ok_or("Missing or invalid Authorization header")?;
    hdr.strip_prefix("Bearer ").ok_or("Malformed Bearer token")
}

pub fn decode_claims(token: &str, jwt_secret: &str) -> Result<Claims, VerificationError> {
    let token_data = decode::<Claims>(
        token,
        &DecodingKey::from_secret(jwt_secret.as_bytes()),
        &Validation::default(),
    )?;

    token_data.claims.parse_subject()?;

    Ok(token_data.claims)
}

pub async fn revoke_token(
    token: &str,
    jwt_secret: &str,
    db: &DatabaseConnection,
) -> Result<(), VerificationError> {
    let token_data = decode_claims(token, jwt_secret)?;

    let jti = token_data.jti;

    let revoked = revoked_token::ActiveModel {
        jti: Set(jti),
        revoked_at: Set(Utc::now().naive_utc()),
    };

    revoked.insert(db).await?;

    Ok(())
}
