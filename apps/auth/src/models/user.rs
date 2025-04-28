use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use utoipa::ToSchema;

#[derive(Debug, Serialize, Deserialize, FromRow, ToSchema)]
pub struct UserPublic {
    pub id: i64,
    pub name: String,
    pub login: String,
    pub email: String,
    pub version_terms: String,
    pub permission_id: Option<i64>,
    pub disabled_since: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, ToSchema)]
pub struct UserUpdate {
    pub name: Option<String>,
    pub login: Option<String>,
    pub email: Option<String>,
    pub version_terms: Option<String>,
    pub permission_id: Option<Option<i64>>,
    pub disabled_since: Option<Option<String>>,
}
