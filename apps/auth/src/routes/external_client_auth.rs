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

use crate::{
    entities::{
        entity_key as keys_entity,
        external_client as external_client_entity, //
    },
    infra::server::{
        DatabaseClientKeys,
        DatabaseClientPostgres, //
    },
    models::{
        auth::*,
        jwt::Claims,
        EntityType, //
    },
    service::{
        fernet::*,
        jwt::*, //
    },
};

use super::common::{handle_server_error_body, handle_server_error_string, CustomError};

pub fn configure(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/client/auth")
            .route("/login", web::post().to(login))
            .route("/validate", web::post().to(validate_token))
            .route("/logout", web::post().to(logout)),
    )
    .service(
        web::scope("/client")
            .wrap(HttpAuthentication::bearer(validator))
            .route("/register", web::post().to(register)),
    );
}

#[utoipa::path(
    post,
    path = "/register",
    request_body = ExternalClientRegisterRequest,
    responses(
        (status = 200, description = "ExternalClient registered"),
        (status = 500, description = "Hashing or Database error")
    ),
    tags = ["Auth"]
)]

pub async fn register(
    postgres_client: web::Data<DatabaseClientPostgres>,
    keys_client: web::Data<DatabaseClientKeys>,
    config: web::Data<crate::infra::types::Config>,
    data: web::Json<ExternalClientRegisterRequest>,
) -> impl Responder {
    let hashed = match hash(&data.password, DEFAULT_COST) {
        Ok(h) => h,
        Err(err) => handle_server_error_string("Hashing error", err, &config),
    };

    let new_external_client_decryption_key = Fernet::generate_key();

    let fernet = Fernet::new(&new_external_client_decryption_key).unwrap();

    let new_external_client = external_client_entity::ActiveModel {
        name: Set(encrypt_field(&fernet, &data.name)),
        login: Set(encrypt_field(&fernet, &data.login)),
        password: Set(encrypt_field(&fernet, &hashed)),
        disabled_since: NotSet,
        ..Default::default()
    };

    let inserted_external_client = match new_external_client.insert(&postgres_client.client).await {
        Ok(inserted_external_client) => inserted_external_client,
        Err(err) => {
            return handle_server_error_body(
                "Failed to register external_client: {:?}",
                err,
                &config,
                None,
            )
        }
    };

    let new_external_client_key = keys_entity::ActiveModel {
        id: NotSet,
        entity_id: Set(inserted_external_client.id),
        entity_type: Set(EntityType::ExternalClient),
        key: Set(new_external_client_decryption_key.clone()),
    };

    match new_external_client_key.insert(&keys_client.client).await {
        Ok(_) => HttpResponse::Ok().body("ExternalClient registered"),
        Err(err) => {
            return handle_server_error_body(
                "Failed to register external_client key: {:?}",
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
        (status = 200, description = "Login successful", body = ExternalClientLoginResponse),
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
    let external_client_result = external_client_entity::Entity::find()
        .filter(external_client_entity::Column::Login.eq(data.login.clone()))
        .one(&postgres_client.client)
        .await;

    let external_client = match external_client_result {
        Ok(Some(external_client)) => external_client,
        Ok(None) => return HttpResponse::Unauthorized().body("ExternalClient not found"),
        Err(err) => return handle_server_error_body("Database Error", err, &config, None),
    };

    if external_client.disabled_since.is_some() {
        return HttpResponse::Unauthorized().body("Inactive external_client");
    }

    let external_client_decryption_key = match get_entity_key(
        external_client.id,
        EntityType::ExternalClient,
        &keys_client,
        &config,
    )
    .await
    {
        GetKeyResult::Ok(key) => key,
        GetKeyResult::Err(err) => return err,
    };

    let decrypted_password = match decrypt_field(
        &fernet::Fernet::new(&external_client_decryption_key).unwrap(),
        &external_client.password,
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

    if verify(&data.password, &decrypted_password).unwrap_or(false) {
        let token = create_jwt(
            &external_client.id.to_string(),
            EntityType::ExternalClient,
            &config.jwt_secret,
        );
        HttpResponse::Ok().json(ExternalClientLoginResponse { token })
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
