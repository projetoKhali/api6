use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

#[derive(Deserialize, ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct UserRegisterRequest {
    pub name: String,
    pub login: String,
    pub email: String,
    pub password: String,
    pub version_terms: String,
    pub role_id: i64,
}

#[derive(Deserialize, ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct ExternalClientRegisterRequest {
    pub name: String,
    pub login: String,
    pub password: String,
}

#[derive(Deserialize, ToSchema)]
pub struct LoginRequest {
    pub login: String,
    pub password: String,
}

#[derive(Serialize, ToSchema)]
pub struct UserLoginResponse {
    pub token: String,
    pub id: i64,
    pub permissions: Vec<String>,
}

#[derive(Serialize, ToSchema)]
pub struct ExternalClientLoginResponse {
    pub token: String,
}

#[derive(Deserialize, ToSchema)]
pub struct ValidateRequest {
    pub token: String,
}

#[derive(Debug, Serialize, Deserialize, ToSchema)]
pub struct PortabilityScreenQuery {
    pub token: String,
}
