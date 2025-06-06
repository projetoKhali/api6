use base64::{engine::general_purpose::STANDARD, Engine as _};
use jsonwebtoken::errors::Error as JwtError;
use serde::{Deserialize, Serialize};
use std::str::FromStr;
use thiserror::Error;
use utoipa::ToSchema;

use super::EntityType;

#[derive(Debug, Serialize, Deserialize, ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct Claims {
    /// Subject (base64-encoded "entity_type:entity_id")
    pub sub: String,

    /// Expiration time as UNIX timestamp
    pub exp: usize,

    /// Issued-at time as UNIX timestamp
    #[schema(example = 1711670000)]
    pub iat: usize,

    /// JWT ID – unique token identifier for revocation
    #[schema(example = "550e8400-e29b-41d4-a716-446655440000")]
    pub jti: String,
}

pub struct ClaimsSubject {
    pub entity_type: EntityType,
    pub id: String,
}

impl Claims {
    pub fn parse_subject(&self) -> Result<ClaimsSubject, VerificationError> {
        let decoded = STANDARD
            .decode(&self.sub)
            .map_err(|_| VerificationError::InvalidSubjectFormat)?;

        let decoded_str =
            std::str::from_utf8(&decoded).map_err(|_| VerificationError::InvalidSubjectFormat)?;

        let parts: Vec<&str> = decoded_str.splitn(2, ':').collect();
        if parts.len() != 2 {
            return Err(VerificationError::InvalidSubjectFormat);
        }

        let entity_type = EntityType::from_str(parts[0])
            .map_err(|_| VerificationError::InvalidEntityType(parts[0].to_string()))?;

        Ok(ClaimsSubject {
            entity_type,
            id: parts[1].to_string(),
        })
    }
}

#[derive(Debug, Error)]
pub enum VerificationError {
    #[error("JWT error: {0}")]
    Jwt(#[from] JwtError),
    #[error("Token has been revoked")]
    Revoked,
    #[error("Database error: {0}")]
    Database(#[from] sea_orm::DbErr),

    #[error("Invalid subject format")]
    InvalidSubjectFormat,
    #[error("Invalid entity type `{0}` for subject")]
    InvalidEntityType(String),
}
