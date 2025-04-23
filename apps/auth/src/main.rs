mod entities;
mod infra;
mod jwt;
mod models;
mod routes;

use infra::server;
use utoipa::OpenApi;

#[derive(OpenApi)]
#[openapi(
    paths(
        routes::auth::register,
        routes::auth::login,
        routes::auth::validate_token,
        routes::auth::logout,
        routes::user::create_user,
        routes::user::get_user,
        routes::user::update_user,
        routes::user::delete_user,
    ),
    components(schemas(
        models::auth::RegisterRequest,
        models::auth::LoginRequest,
        models::auth::TokenResponse,
        models::auth::ValidateRequest,
        models::User
    )),
    tags(
        (name = "Auth", description = "Authentication endpoints"),
        (name = "User", description = "User management endpoints")
    )
)]

pub struct ApiDoc;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    server::create_server()?.await
}
