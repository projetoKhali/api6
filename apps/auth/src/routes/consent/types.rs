use serde::Deserialize;

#[derive(Deserialize)]
pub struct ConsentQuery {
    pub consent_challenge: String,
}
