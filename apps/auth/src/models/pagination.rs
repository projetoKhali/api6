use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

#[derive(Debug, Serialize, Deserialize, ToSchema)]
pub struct PaginatedRequest {
    pub page: Option<u64>,
    pub limit: Option<u64>,
}

#[derive(Debug, Serialize, Deserialize, ToSchema)]
pub struct PaginatedResponse<T> {
    pub total: u64,
    pub page: u64,
    pub total_pages: u64,
    pub items: Vec<T>,
}
