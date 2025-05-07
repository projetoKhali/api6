use serde::Serialize;

#[derive(Serialize)]
pub struct ClientRegistration {
    pub client_id: String,
    pub client_secret: String,
    pub grant_types: Vec<String>,
    pub response_types: Vec<String>,
    pub scope: String,
    pub redirect_uris: Vec<String>,
}
