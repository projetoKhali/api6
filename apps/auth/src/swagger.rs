use crate::{entities, models, routes};
use utoipa::OpenApi;

// Swagger Schema
#[derive(OpenApi)]
#[openapi(
    paths(

        // User Authentication routes
        routes::auth::register,
        routes::auth::login,
        routes::auth::validate_token,
        routes::auth::logout,

        // User _RUD routes
        routes::user::get_users,
        routes::user::get_user,
        routes::user::update_user,
        routes::user::delete_user,

        // External Client Authentication routes
        routes::external_client_auth::external_client_register,
        routes::external_client_auth::external_client_login,
        routes::external_client_auth::external_client_validate_token,
        routes::external_client_auth::external_client_logout,

        // External Client _RUD routes
        routes::external_client::get_external_clients,
        routes::external_client::get_external_client,
        routes::external_client::update_external_client,
        routes::external_client::delete_external_client,

        // Portability routes
        routes::portability::button,
        routes::portability::screen,
        routes::portability::authorize,
        routes::portability::portability,
    ),
    components(schemas(

        // Authentication models
        models::auth::UserRegisterRequest,
        models::auth::ExternalClientRegisterRequest,

        models::auth::LoginRequest,

        models::auth::UserLoginResponse,
        models::auth::ExternalClientLoginResponse,

        models::auth::ValidateRequest,
        models::auth::PortabilityScreenQuery,

        // models
        models::UserPublic,
        models::UserUpdate,
        models::UserPortability,
        models::ExternalClientPublic,
        models::ExternalClientUpdate,


        // Entities
        entities::user::Model,
        entities::external_client::Model,

    )),
    tags(

        (name = "Auth", description = "Authentication endpoints"),
        (name = "User", description = "User management endpoints"),
        (name = "External Client", description = "External Client management endpoints"),
        (name = "External Client Auth", description = "External client authentication endpoints"),
        (name = "Portability", description = "Portability related endpoints"),

    )
)]

pub struct ApiDoc;
