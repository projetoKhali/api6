use jsonwebtoken::errors::Error as JwtError;
use serde::{Deserialize, Serialize};
use thiserror::Error;
use utoipa::ToSchema;

#[derive(Debug, Serialize, Deserialize, ToSchema)]
pub struct Claims {
    /// Subject (user ID or similar)
    pub sub: String,

    /// Expiration time as UNIX timestamp
    pub exp: usize,

    /// Issued-at time as UNIX timestamp (optional, but recommended)
    #[schema(example = 1711670000)]
    pub iat: usize,

    /// JWT ID – unique token identifier for revocation
    #[schema(example = "550e8400-e29b-41d4-a716-446655440000")]
    pub jti: String,
}

#[derive(Debug, Error)]
pub enum VerificationError {
    #[error("JWT error: {0}")]
    Jwt(#[from] JwtError),
    #[error("Token has been revoked")]
    Revoked,
    #[error("Database error: {0}")]
    Db(#[from] sea_orm::DbErr),
}
