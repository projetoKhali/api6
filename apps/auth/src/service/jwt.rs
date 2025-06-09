use crate::infra::server::DatabaseClientKeys;
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

async fn extract_claims(
    req: &ServiceRequest,
    credentials: &BearerAuth,
) -> Result<Claims, actix_web::Error> {
    let jwt_secret = req
        .app_data::<web::Data<Config>>()
        .ok_or_else(|| actix_web::error::ErrorInternalServerError("JWT secret not configured"))?
        .get_ref()
        .jwt_secret
        .clone();

    let keys_client = req
        .app_data::<web::Data<DatabaseClientKeys>>()
        .ok_or_else(|| {
            actix_web::error::ErrorInternalServerError("Database connection not configured")
        })?
        .get_ref();

    let token_data = verify_jwt(credentials.token(), &jwt_secret, &keys_client)
        .await
        .map_err(|_| actix_web::error::ErrorUnauthorized("Invalid or revoked token"))?;

    Ok(token_data.claims)
}

pub async fn validator(
    req: ServiceRequest,
    credentials: BearerAuth,
) -> Result<ServiceRequest, (actix_web::Error, ServiceRequest)> {
    let claims = match extract_claims(&req, &credentials).await {
        Ok(claims) => claims,
        Err(_) => {
            return Err((
                actix_web::error::ErrorUnauthorized("Error extracting claims"),
                req,
            ))
        } // Err(err) => return Err((err, req)),
    };

    req.extensions_mut().insert(claims);
    Ok(req)
}

pub async fn validate_entity_type(
    claims: &Claims,
    entity_type: EntityType,
) -> Result<ClaimsSubject, actix_web::Error> {
    let subject = claims
        .parse_subject()
        .map_err(|_| actix_web::error::ErrorUnauthorized("Invalid token subject"))?;

    if subject.entity_type != entity_type {
        return Err(actix_web::error::ErrorUnauthorized(
            "Invalid token entity type",
        ));
    }

    Ok(subject)
}

pub async fn validator_entity_type(
    req: ServiceRequest,
    credentials: BearerAuth,
    entity_type: EntityType,
) -> Result<ServiceRequest, (actix_web::Error, ServiceRequest)> {
    let claims = match extract_claims(&req, &credentials).await {
        Ok(claims) => claims,
        Err(_) => {
            return Err((
                actix_web::error::ErrorUnauthorized("Error extracting claims"),
                req,
            ));
        } // Err(err) => return Err((err, req)),
    };

    let subject = match validate_entity_type(&claims, entity_type).await {
        Ok(subject) => subject,
        Err(err) => return Err((err, req)),
    };

    req.extensions_mut().insert(subject);
    Ok(req)
}

pub async fn validator_user(
    req: ServiceRequest,
    credentials: BearerAuth,
) -> Result<ServiceRequest, (actix_web::Error, ServiceRequest)> {
    validator_entity_type(req, credentials, EntityType::User).await
}

pub async fn validator_external_client(
    req: ServiceRequest,
    credentials: BearerAuth,
) -> Result<ServiceRequest, (actix_web::Error, ServiceRequest)> {
    validator_entity_type(req, credentials, EntityType::ExternalClient).await
}

pub async fn validator_authorized_client(
    req: ServiceRequest,
    credentials: BearerAuth,
) -> Result<ServiceRequest, (actix_web::Error, ServiceRequest)> {
    validator_entity_type(req, credentials, EntityType::AuthorizedClient).await
}

pub async fn verify_jwt(
    token: &str,
    jwt_secret: &str,
    keys_client: &DatabaseClientKeys,
) -> Result<TokenData<Claims>, VerificationError> {
    let token_data = decode::<Claims>(
        token,
        &DecodingKey::from_secret(jwt_secret.as_bytes()),
        &Validation::default(),
    )?;

    let jti = &token_data.claims.jti;
    if revoked_token::Entity::find_by_id(jti.clone())
        .one(&keys_client.client)
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
