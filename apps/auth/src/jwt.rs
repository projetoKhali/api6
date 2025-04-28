use actix_web::{http::header, HttpRequest};
use jsonwebtoken::{
  decode,
  encode,
  DecodingKey,
  EncodingKey,
  Header,
  TokenData,
  Validation,
};
use sea_orm::EntityTrait;
use sea_orm::{
  ActiveModelTrait,
  ActiveValue::Set,
  DatabaseConnection,
};
use sqlx::types::chrono::Utc;
use time::{Duration, OffsetDateTime};
use uuid::Uuid;
use crate::models::jwt::*;

use crate::entities::revoked_token;

pub fn create_jwt(user_id: &str, jwt_secret: &str) -> String {
    let now = OffsetDateTime::now_utc();
    let exp = (now + Duration::hours(24)).unix_timestamp() as usize;

    let claims = Claims {
        sub: user_id.to_owned(),
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

pub fn verify_jwt(
    token: &str,
    jwt_secret: &String,
) -> Result<TokenData<Claims>, jsonwebtoken::errors::Error> {
    decode::<Claims>(
        token,
        &DecodingKey::from_secret(jwt_secret.as_ref()),
        &Validation::default(),
    )
}

pub fn extract_bearer(req: &HttpRequest) -> Result<&str, &'static str> {
    let hdr = req
        .headers()
        .get(header::AUTHORIZATION)
        .and_then(|h| h.to_str().ok())
        .ok_or("Missing or invalid Authorization header")?;
    hdr.strip_prefix("Bearer ").ok_or("Malformed Bearer token")
}

pub fn decode_claims(
    token: &str,
    secret: &str,
) -> Result<TokenData<Claims>, jsonwebtoken::errors::Error> {
    decode::<Claims>(
        token,
        &DecodingKey::from_secret(secret.as_ref()),
        &Validation::default(),
    )
}

pub async fn revoke_token(
    token: &str,
    secret: &str,
    db: &DatabaseConnection,
) -> Result<(), sea_orm::DbErr> {
    let data =
        decode_claims(token, secret).map_err(|_| sea_orm::DbErr::Custom("Invalid token".into()))?;
    let jti = data.claims.jti;

    let now = Utc::now().naive_utc();
    let am = revoked_token::ActiveModel {
        jti: Set(jti),
        revoked_at: Set(now),
    };
    am.insert(db).await.map(|_| ())
}
