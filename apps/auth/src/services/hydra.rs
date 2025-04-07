use super::types::{ConsentAcceptPayload, HydraAcceptResponse, LoginAcceptPayload};
use reqwest::Client;
use serde_json::json;
use std::env;

pub async fn accept_login(challenge: &str, client: &Client) -> Result<String, reqwest::Error> {
    let hydra_admin_url =
        env::var("AUTH_HYDRA_ADMIN_URL").unwrap_or_else(|_| "http://hydra:4445".into());

    let url = format!(
        "{}/oauth2/auth/requests/login/accept?login_challenge={}",
        hydra_admin_url, challenge
    );

    let payload = LoginAcceptPayload {
        login_challenge: challenge.into(),
        subject: "user@example.com".into(),
        remember: true,
        remember_for: 3600,
        acr: "0".into(),
        context: json!({}),
    };

    let response = client.put(&url).json(&payload).send().await?;
    let status = response.status();
    let text = response.text().await.unwrap_or_else(|e| {
        eprintln!("Failed to read response text: {}", e);
        String::new()
    });

    if !status.is_success() {
        eprintln!("Hydra returned non-success status: {}", status);
        eprintln!("Response body: {}", text);
        panic!("Hydra returned non-success status: {}", status);
    }

    let res_json: HydraAcceptResponse = match serde_json::from_str(&text) {
        Ok(json) => json,
        Err(e) => {
            eprintln!("Failed to parse JSON response: {}", e);
            eprintln!("Response body was: {}", text);
            panic!("Failed to parse JSON response: {}", e);
        }
    };

    Ok(res_json.redirect_to)
}

pub async fn accept_consent(challenge: &str, client: &Client) -> Result<String, reqwest::Error> {
    let hydra_admin_url =
        env::var("AUTH_HYDRA_ADMIN_URL").unwrap_or_else(|_| "http://hydra:4445".into());

    let url = format!(
        "{}/oauth2/auth/requests/consent/accept?consent_challenge={}",
        hydra_admin_url, challenge
    );

    let payload = ConsentAcceptPayload {
        grant_scope: vec!["openid".into(), "offline".into()],
        grant_access_token_audience: vec![],
        remember: true,
        remember_for: 3600,
        session: json!({ "id_token": {} }),
    };

    let response = client.put(&url).json(&payload).send().await?;
    let res_json: HydraAcceptResponse = response.json().await?;

    Ok(res_json.redirect_to)
}
