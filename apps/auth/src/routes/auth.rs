use actix_web::{
    web, //
    HttpRequest,
    HttpResponse,
    Responder,
};
use bcrypt::{hash, verify, DEFAULT_COST};
use sea_orm::{
    ActiveModelTrait, //
    ColumnTrait,
    EntityTrait,
    NotSet,
    QueryFilter,
    Set,
};

use crate::{
    entities::user,
    infra::server::{
        DatabaseClientKeys,
        DatabaseClientPostgres, //
    },
    service::{
        fernet::*,
        jwt::*,
    },
    models::{
        auth::*,
        jwt::Claims, //
    }, //
};

use super::common::{handle_server_error_body, handle_server_error_string};

pub fn configure(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("")
            .route("/", web::post().to(login))
            .route("/register", web::post().to(register))
            .route("/validate", web::post().to(validate_token))
            .route("/logout", web::post().to(logout)),
    );
}

#[utoipa::path(
    post,
    path = "/register",
    request_body = RegisterRequest,
    responses(
        (status = 200, description = "User registered"),
        (status = 500, description = "Hashing or Database error")
    ),
    tags = ["Auth"]
)]

pub async fn register(
    postgres_client: web::Data<DatabaseClientPostgres>,
    config: web::Data<crate::infra::types::Config>,
    data: web::Json<RegisterRequest>,
) -> impl Responder {
    let hashed = match hash(&data.password, DEFAULT_COST) {
        Ok(h) => h,
        Err(err) => handle_server_error_string("Hashing error", err, &config),
    };

    let new_user = user::ActiveModel {
        id: NotSet,
        name: Set(data.name.clone()),
        login: Set(data.login.clone()),
        email: Set(data.email.clone()),
        password: Set(hashed),
        version_terms_agreement: Set(data.version_terms.clone()),
        permission_id: Set(data.permission_id),
        disabled_since: NotSet,
    };

    match new_user.insert(&postgres_client.client).await {
        Ok(_) => HttpResponse::Ok().body("User registered"),
        Err(err) => handle_server_error_body("Failed to register user: {:?}", err, &config, None),
    }
}

#[utoipa::path(
    post,
    path = "/login",
    request_body = LoginRequest,
    responses(
        (status = 200, description = "Login successful", body = TokenResponse),
        (status = 401, description = "Unauthorized"),
        (status = 500, description = "Database error")
    ),
    tags = ["Auth"]
)]

pub async fn login(
    postgres_client: web::Data<DatabaseClientPostgres>,
    config: web::Data<crate::infra::types::Config>,
    data: web::Json<LoginRequest>,
) -> impl Responder {
    let user_result = user::Entity::find()
        .filter(user::Column::Login.eq(data.login.clone()))
        .one(&postgres_client.client)
        .await;

    match user_result {
        Ok(Some(user)) => {
            if verify(&data.password, &user.password).unwrap_or(false) {
                let token = create_jwt(&user.id.to_string(), &config.jwt_secret);
                HttpResponse::Ok().json(TokenResponse { token })
            } else {
                HttpResponse::Unauthorized().body("Invalid credentials")
            }
        }
        Ok(None) => HttpResponse::Unauthorized().body("User not found"),
        Err(err) => handle_server_error_body("Database Error", err, &config, None),
    }
}

#[utoipa::path(
    post,
    path = "/validate",
    request_body = ValidateRequest,
    responses(
        (status = 200, description = "Token is valid", body = Claims),
        (status = 401, description = "Invalid token")
    ),
    tags = ["Auth"]
)]

pub async fn validate_token(
    data: web::Json<ValidateRequest>,
    keys_client: web::Data<DatabaseClientKeys>,
    config: web::Data<crate::infra::types::Config>,
) -> impl Responder {
    match verify_jwt(&data.token, &config.jwt_secret, &keys_client.client).await {
        Ok(claims) => HttpResponse::Ok().json(claims.claims),
        Err(err) => handle_server_error_body("Invalid token", err, &config, None),
    }
}

#[utoipa::path(
    post,
    path = "/logout",
    request_body = ValidateRequest,
    responses(
        (status = 200, description = "Token invalidated")
    ),
    tags = ["Auth"]
)]

pub async fn logout(
    req: HttpRequest,
    keys_client: web::Data<DatabaseClientPostgres>,
    config: web::Data<crate::infra::types::Config>,
) -> impl Responder {
    let token = match extract_bearer(&req) {
        Ok(t) => t,
        Err(msg) => return HttpResponse::BadRequest().body(msg),
    };

    match revoke_token(token, &config.jwt_secret, &keys_client.client).await {
        Ok(_) => HttpResponse::Ok().body("Token invalidated"),
        Err(err) => handle_server_error_body("Token Invalidation error", err, &config, None),
    }
}
