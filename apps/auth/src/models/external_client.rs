use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use utoipa::ToSchema;

#[derive(Debug, Serialize, Deserialize, FromRow, ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct ExternalClientPublic {
    pub id: i64,
    pub name: String,
    pub login: String,
    pub created_at: String,
    pub disabled_since: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct ExternalClientUpdate {
    pub name: Option<String>,
    pub login: Option<String>,
    pub password: Option<String>,
    pub disabled_since: Option<Option<String>>,
}
