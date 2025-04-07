use serde::{Deserialize, Serialize};
use serde_json::Value;

#[derive(Deserialize)]
pub struct LoginQuery {
    pub login_challenge: String,
}

#[derive(Deserialize)]
pub struct ConsentQuery {
    pub consent_challenge: String,
}

#[derive(Serialize)]
pub struct LoginAcceptPayload {
    pub subject: String,
    pub remember: bool,
    pub remember_for: u32,
    pub acr: String,
    pub context: Value,
}

#[derive(Serialize)]
pub struct ConsentAcceptPayload {
    pub grant_scope: Vec<String>,
    pub grant_access_token_audience: Vec<String>,
    pub remember: bool,
    pub remember_for: u32,
    pub session: Value,
}

#[derive(Deserialize)]
pub struct HydraAcceptResponse {
    pub redirect_to: String,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct User {
    pub id: i32,
    pub email: String,
    pub password: String,
}
