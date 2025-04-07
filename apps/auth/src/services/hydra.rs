use crate::types::{ConsentAcceptPayload, HydraAcceptResponse, LoginAcceptPayload};
use reqwest::Client;
use serde_json::json;
use std::env;

pub async fn accept_login(challenge: &str, client: &Client) -> Result<String, reqwest::Error> {
    let hydra_admin_url =
        env::var("AUTH_HYDRA_ADMIN_URL").unwrap_or_else(|_| "http://localhost:4445".into());

    let url = format!(
        "{}/oauth2/auth/requests/login/accept?challenge={}",
        hydra_admin_url, challenge
    );

    let payload = LoginAcceptPayload {
        subject: "user@example.com".into(),
        remember: true,
        remember_for: 3600,
        acr: "0".into(),
        context: json!({}),
    };

    let response = client.post(&url).json(&payload).send().await?;
    let res_json: HydraAcceptResponse = response.json().await?;

    Ok(res_json.redirect_to)
}

pub async fn accept_consent(challenge: &str, client: &Client) -> Result<String, reqwest::Error> {
    let hydra_admin_url =
        env::var("AUTH_HYDRA_ADMIN_URL").unwrap_or_else(|_| "http://localhost:4445".into());

    let url = format!(
        "{}/oauth2/auth/requests/consent/accept?challenge={}",
        hydra_admin_url, challenge
    );

    let payload = ConsentAcceptPayload {
        grant_scope: vec!["openid".into(), "offline".into()],
        grant_access_token_audience: vec![],
        remember: true,
        remember_for: 3600,
        session: json!({ "id_token": {} }),
    };

    let response = client.post(&url).json(&payload).send().await?;
    let res_json: HydraAcceptResponse = response.json().await?;

    Ok(res_json.redirect_to)
}
