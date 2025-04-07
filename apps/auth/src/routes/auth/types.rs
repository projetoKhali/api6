use serde::Deserialize;

#[derive(Deserialize)]
pub struct LoginQuery {
    pub login_challenge: String,
}
