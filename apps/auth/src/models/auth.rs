use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

#[derive(Deserialize, ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct RegisterRequest {
    pub name: String,
    pub login: String,
    pub email: String,
    pub password: String,
    pub version_terms: String,
    pub permission_id: i64,
}

#[derive(Deserialize, ToSchema)]
pub struct LoginRequest {
    pub login: String,
    pub password: String,
}

#[derive(Serialize, ToSchema)]
pub struct LoginResponse {
    pub token: String,
    pub id: i64,
    pub permissions: Vec<String>,
}

#[derive(Deserialize, ToSchema)]
pub struct ValidateRequest {
    pub token: String,
}
