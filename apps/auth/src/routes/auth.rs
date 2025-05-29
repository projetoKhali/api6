use actix_web::{
    web, //
    HttpRequest,
    HttpResponse,
    Responder,
};
use actix_web_httpauth::middleware::HttpAuthentication;
use bcrypt::{hash, verify, DEFAULT_COST};
use fernet::Fernet;
use sea_orm::{
    ActiveModelTrait, //
    ColumnTrait,
    EntityTrait,
    NotSet,
    QueryFilter,
    Set,
};
use sea_query::Query;

use crate::{
    entities::{
        keys as keys_entity,
        permission as permission_entity,
        role_permission as role_permission_entity,
        user as user_entity, //
    },
    infra::server::{
        DatabaseClientKeys,
        DatabaseClientPostgres, //
    },
    models::{
        auth::*,
        jwt::Claims, //
    },
    service::{
        fernet::*,
        jwt::*, //
    },
};

use super::common::{handle_server_error_body, handle_server_error_string, CustomError};

pub fn configure(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/auth")
            .route("/login", web::post().to(login))
            .route("/validate", web::post().to(validate_token))
            .route("/logout", web::post().to(logout)),
    )
    .service(
        web::scope("")
            .wrap(HttpAuthentication::bearer(validator))
            .route("/register", web::post().to(register)),
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
    keys_client: web::Data<DatabaseClientKeys>,
    config: web::Data<crate::infra::types::Config>,
    data: web::Json<RegisterRequest>,
) -> impl Responder {
    let hashed = match hash(&data.password, DEFAULT_COST) {
        Ok(h) => h,
        Err(err) => handle_server_error_string("Hashing error", err, &config),
    };

    let new_user_decryption_key = Fernet::generate_key();

    let fernet = Fernet::new(&new_user_decryption_key).unwrap();

    let new_user = user_entity::ActiveModel {
        id: NotSet,
        name: Set(encrypt_field(&fernet, &data.name)),
        login: Set(encrypt_field(&fernet, &data.login)),
        email: Set(encrypt_field(&fernet, &data.email)),
        password: Set(encrypt_field(&fernet, &hashed)),
        version_terms_agreement: Set(encrypt_field(&fernet, &data.version_terms)),
        role_id: Set(data.role_id),
        disabled_since: NotSet,
    };

    let inserted_user = match new_user.insert(&postgres_client.client).await {
        Ok(inserted_user) => inserted_user,
        Err(err) => {
            return handle_server_error_body("Failed to register user: {:?}", err, &config, None)
        }
    };

    let new_user_key = keys_entity::ActiveModel {
        id: Set(inserted_user.id),
        key: Set(new_user_decryption_key.clone()),
    };

    match new_user_key.insert(&keys_client.client).await {
        Ok(_) => HttpResponse::Ok().body("User registered"),
        Err(err) => {
            return handle_server_error_body(
                "Failed to register user key: {:?}",
                err,
                &config,
                None,
            )
        }
    }
}

#[utoipa::path(
    post,
    path = "/auth/login",
    request_body = LoginRequest,
    responses(
        (status = 200, description = "Login successful", body = LoginResponse),
        (status = 401, description = "Unauthorized"),
        (status = 500, description = "Database error")
    ),
    tags = ["Auth"]
)]

pub async fn login(
    postgres_client: web::Data<DatabaseClientPostgres>,
    keys_client: web::Data<DatabaseClientKeys>,
    config: web::Data<crate::infra::types::Config>,
    data: web::Json<LoginRequest>,
) -> impl Responder {
    let user_result = user_entity::Entity::find()
        .filter(user_entity::Column::Login.eq(data.login.clone()))
        .one(&postgres_client.client)
        .await;

    let user = match user_result {
        Ok(Some(user)) => user,
        Ok(None) => return HttpResponse::Unauthorized().body("User not found"),
        Err(err) => return handle_server_error_body("Database Error", err, &config, None),
    };

    if user.disabled_since.is_some() {
        return HttpResponse::Unauthorized().body("Inactive user");
    }

    let user_decryption_key = match get_user_key(user.id, &keys_client, &config).await {
        GetKeyResult::Ok(key) => key,
        GetKeyResult::Err(err) => return err,
    };

    let decrypted_password = match decrypt_field(
        &fernet::Fernet::new(&user_decryption_key).unwrap(),
        &user.password,
    ) {
        Ok(p) => p,
        Err(err) => {
            return handle_server_error_body(
                "Decryption error",
                CustomError::UnsuccessfulDecryption("password".to_string(), err),
                &config,
                None,
            );
        }
    };

    let permissions = match permission_entity::Entity::find()
        .filter(
            permission_entity::Column::Id.in_subquery(
                Query::select()
                    .column(role_permission_entity::Column::PermissionId)
                    .from(role_permission_entity::Entity)
                    .and_where(role_permission_entity::Column::RoleId.eq(user.role_id))
                    .to_owned(),
            ),
        )
        .all(&postgres_client.client)
        .await
    {
        Ok(permissions) => permissions.into_iter().map(|p| p.name).collect(),
        Err(err) => return handle_server_error_body("Database Error", err, &config, None),
    };

    if verify(&data.password, &decrypted_password).unwrap_or(false) {
        let token = create_jwt(&user.id.to_string(), &config.jwt_secret);
        HttpResponse::Ok().json(LoginResponse {
            token,
            id: user.id,
            permissions,
        })
    } else {
        HttpResponse::Unauthorized().body("Invalid credentials")
    }
}

#[utoipa::path(
    post,
    path = "/auth/validate",
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
    path = "/auth/logout",
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
