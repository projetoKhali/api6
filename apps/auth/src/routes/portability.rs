use actix_web::{web, HttpMessage, HttpRequest, HttpResponse, Responder};
use actix_web_httpauth::middleware::HttpAuthentication;
use askama::Template;
use bcrypt::verify;
use sea_orm::{ColumnTrait, EntityTrait, QueryFilter};

use crate::{
    entities::{
        external_client as external_client_entity,
        user as user_entity, //
    },
    infra::server::{
        DatabaseClientKeys,
        DatabaseClientPostgres, //
    },
    models::{
        auth::{ExternalClientLoginResponse, LoginRequest},
        jwt::ClaimsSubject,
        EntityType,
    },
    routes::common::{
        handle_server_error_body,
        CustomError, //
    },
    service::{
        fernet::{
            decrypt_database_external_client,
            decrypt_database_user,
            decrypt_field,
            get_entity_key,
            GetKeyResult, //
        },
        jwt::{
            create_jwt, //
            validator_authorized_client,
            validator_external_client,
        },
    },
    templates::engine::{LoginButtonTemplate, LoginFormTemplate},
};

pub fn configure(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/portability/button") //
            .route("/", web::get().to(button)),
    )
    .service(
        web::scope("/portability/auth")
            .wrap(HttpAuthentication::bearer(validator_external_client))
            .route("/screen", web::get().to(screen))
            .route("/authorize", web::post().to(authorize)),
    )
    .service(
        web::scope("/portability/data")
            .wrap(HttpAuthentication::bearer(validator_authorized_client))
            .route("/", web::post().to(portability)),
    );
}

#[utoipa::path(
    get,
    path = "/portability/button",
    responses(
        (status = 200, description = "Returns the portability button HTML"),
        (status = 500, description = "Database error")
    ),
    tags = ["Portability"]
)]

pub async fn button(req: HttpRequest) -> impl Responder {
    let client_id = match req.extensions().get::<ClaimsSubject>() {
        Some(subject) => subject.id.to_string(),
        None => return HttpResponse::Unauthorized().body("Unauthorized"),
    };

    let tmpl = LoginButtonTemplate {
        popup_url: format!("/login-form/{}", client_id),
    };
    HttpResponse::Ok().content_type("text/html").body(
        tmpl.render()
            .unwrap_or_else(|_| "<h1>An error occurred</h1>".to_string()),
    )
}

#[utoipa::path(
    get,
    path = "/portability/auth/screen",
    responses(
        (status = 200, description = "Returns the authorization screen HTML"),
        (status = 500, description = "Database error")
    ),
    tags = ["Portability"]
)]

pub async fn screen(
    postgres_client: web::Data<DatabaseClientPostgres>,
    keys_client: web::Data<DatabaseClientKeys>,
    config: web::Data<crate::infra::types::Config>,
    req: HttpRequest,
) -> impl Responder {
    let client_id = match req.extensions().get::<ClaimsSubject>() {
        Some(subject) => subject.id.to_string(),
        None => return HttpResponse::Unauthorized().body("Unauthorized"),
    };

    let external_client_result =
        external_client_entity::Entity::find_by_id(client_id.parse::<i64>().unwrap())
            .one(&postgres_client.client)
            .await;

    let encrypted_external_client = match external_client_result {
        Ok(Some(client)) => client,
        Ok(None) => return HttpResponse::NotFound().body("ExternalClient not found"),
        Err(err) => return handle_server_error_body("Database Error", err, &config, None),
    };

    if encrypted_external_client.disabled_since.is_some() {
        return HttpResponse::Unauthorized().body("Inactive external_client");
    }

    let external_client_decryption_key = match get_entity_key(
        encrypted_external_client.id,
        EntityType::ExternalClient,
        &keys_client,
        &config,
    )
    .await
    {
        GetKeyResult::Ok(key) => key,
        GetKeyResult::Err(err) => return err,
    };

    let external_client = match decrypt_database_external_client(
        &external_client_decryption_key,
        encrypted_external_client,
    ) {
        Ok(client) => client,
        Err(err) => return handle_server_error_body("Parse error", err, &config, None),
    };

    let tmpl = LoginFormTemplate {
        client_name: external_client.name,
        client_id: external_client.id,
    };
    HttpResponse::Ok().content_type("text/html").body(
        tmpl.render()
            .unwrap_or_else(|_| "<h1>An error occurred</h1>".to_string()),
    )
}

#[utoipa::path(
    post,
    path = "/portability/auth/authorize",
    request_body = LoginRequest,
    responses(
        (status = 200, description = "Authorization successful", body = ExternalClientLoginResponse),
        (status = 401, description = "Unauthorized"),
        (status = 500, description = "Database error")
    ),
    tags = ["Portability"]
)]

pub async fn authorize(
    postgres_client: web::Data<DatabaseClientPostgres>,
    keys_client: web::Data<DatabaseClientKeys>,
    config: web::Data<crate::infra::types::Config>,
    data: web::Json<LoginRequest>,
    req: HttpRequest,
) -> impl Responder {
    let client_id = match req.extensions().get::<ClaimsSubject>() {
        Some(subject) => subject.id.to_string(),
        None => return HttpResponse::Unauthorized().body("Unauthorized"),
    };

    let external_client_result =
        external_client_entity::Entity::find_by_id(client_id.parse::<i64>().unwrap())
            .one(&postgres_client.client)
            .await;

    let external_client = match external_client_result {
        Ok(Some(client)) => client,
        Ok(None) => return HttpResponse::NotFound().body("ExternalClient not found"),
        Err(err) => return handle_server_error_body("Database Error", err, &config, None),
    };

    if external_client.disabled_since.is_some() {
        return HttpResponse::Unauthorized().body("Inactive external_client");
    }

    if data.login.is_empty() || data.password.is_empty() {
        return HttpResponse::Unauthorized().body("Login and password are required");
    }

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

    let user_decryption_key =
        match get_entity_key(user.id, EntityType::User, &keys_client, &config).await {
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

    if verify(&data.password, &decrypted_password).unwrap_or(false) {
        let token = create_jwt(
            format!("{}-{}", external_client.id, user.id,).as_str(),
            EntityType::AuthorizedClient,
            &config.jwt_secret,
        );
        HttpResponse::Ok().json(ExternalClientLoginResponse { token })
    } else {
        HttpResponse::Unauthorized().body("Invalid credentials")
    }
}

#[utoipa::path(
    post,
    path = "/portability/data",
    request_body = String,
    responses(
        (status = 200, description = "Data portability successful"),
        (status = 401, description = "Unauthorized"),
        (status = 500, description = "Database error")
    ),
    tags = ["Portability"]
)]

pub async fn portability(
    postgres_client: web::Data<DatabaseClientPostgres>,
    keys_client: web::Data<DatabaseClientKeys>,
    config: web::Data<crate::infra::types::Config>,
    req: HttpRequest,
) -> impl Responder {
    let authorized_client_id = match req.extensions().get::<ClaimsSubject>() {
        Some(subject) => subject.id.to_string(),
        None => return HttpResponse::Unauthorized().body("Unauthorized"),
    };

    let (external_client_id, user_id) = match authorized_client_id.split_once('-') {
        Some((client_id, user_id)) => (client_id.to_string(), user_id.to_string()),
        None => return HttpResponse::Unauthorized().body("Invalid token format"),
    };

    let external_client_result =
        external_client_entity::Entity::find_by_id(external_client_id.parse::<i64>().unwrap())
            .one(&postgres_client.client)
            .await;

    let external_client = match external_client_result {
        Ok(Some(client)) => client,
        Ok(None) => return HttpResponse::NotFound().body("ExternalClient not found"),
        Err(err) => return handle_server_error_body("Database Error", err, &config, None),
    };

    if external_client.disabled_since.is_some() {
        return HttpResponse::Unauthorized().body("Inactive external_client");
    }

    let user_result = user_entity::Entity::find_by_id(user_id.parse::<i64>().unwrap())
        .one(&postgres_client.client)
        .await;

    let encrypted_user = match user_result {
        Ok(Some(user)) => user,
        Ok(None) => return HttpResponse::NotFound().body("User not found"),
        Err(err) => return handle_server_error_body("Database Error", err, &config, None),
    };

    if encrypted_user.disabled_since.is_some() {
        return HttpResponse::Unauthorized().body("Inactive user");
    }

    let user_decryption_key =
        match get_entity_key(encrypted_user.id, EntityType::User, &keys_client, &config).await {
            GetKeyResult::Ok(key) => key,
            GetKeyResult::Err(err) => return err,
        };

    match decrypt_database_user(&user_decryption_key, encrypted_user) {
        Ok(decrypted_user) => HttpResponse::Ok().json(decrypted_user),
        Err(err) => handle_server_error_body("Parse error", err, &config, None),
    }
}
