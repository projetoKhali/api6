use crate::{
  routes,
  models,
  entities
};
use utoipa::OpenApi;

// Swagger Schema
#[derive(OpenApi)]
#[openapi(
    paths(
        // Authentication routes
        routes::auth::register,
        routes::auth::login,
        routes::auth::validate_token,
        routes::auth::logout,
        // User routes
        routes::user::get_users,
        routes::user::get_user,
        routes::user::update_user,
        routes::user::delete_user,
    ),
    components(schemas(
        // Authentication models
        models::auth::RegisterRequest,
        models::auth::LoginRequest,
        models::auth::LoginResponse,
        models::auth::ValidateRequest,
        // User models
        models::UserPublic,
        models::UserUpdate,
        // Entities
        entities::user::Model,
    )),
    tags(
        (name = "Auth", description = "Authentication endpoints"),
        (name = "User", description = "User management endpoints")
    )
)]

pub struct ApiDoc;
