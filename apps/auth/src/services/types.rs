use serde::{Deserialize, Serialize};
use serde_json::Value;

#[derive(Serialize)]
pub struct LoginAcceptPayload {
    pub challenge: String,
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

