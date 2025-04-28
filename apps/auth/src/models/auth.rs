use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

#[derive(Deserialize, ToSchema)]
pub struct RegisterRequest {
    pub name: String,
    pub login: String,
    pub email: String,
    pub password: String,
    pub version_terms: String,
    pub permission_id: Option<i64>,
}

#[derive(Deserialize, ToSchema)]
pub struct LoginRequest {
    pub login: String,
    pub password: String,
}

#[derive(Serialize, ToSchema)]
pub struct TokenResponse {
    pub token: String,
}

#[derive(Deserialize, ToSchema)]
pub struct ValidateRequest {
    pub token: String,
}
