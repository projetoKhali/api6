use actix_web::{web, HttpMessage, HttpRequest, HttpResponse, Responder};
use actix_web_httpauth::{extractors::bearer::BearerAuth, middleware::HttpAuthentication};
use askama::Template;
use base64::Engine;
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
        auth::{
            ExternalClientLoginResponse,
            LoginRequest, //
            PortabilityScreenQuery,
        },
        jwt::ClaimsSubject, //
        EntityType,
        UserPortability,
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
            create_jwt,
            validate_entity_type,
            validator_authorized_client,
            validator_external_client,
            verify_jwt, //
        },
    },
    templates::{
        LoginButtonTemplate,
        LoginFormTemplate, //
    },
};

pub fn configure(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/portability_button") //
            .wrap(HttpAuthentication::bearer(validator_external_client))
            .route("/button", web::get().to(button)),
    )
    .service(
        web::scope("/portability/screen") //
            .route("/", web::get().to(screen)),
    )
    .service(
        web::scope("/portability/auth")
            .wrap(HttpAuthentication::bearer(validator_external_client))
            .route("/authorize", web::post().to(authorize)),
    )
    .service(
        web::scope("/portability/data")
            .wrap(HttpAuthentication::bearer(validator_authorized_client))
            .route("/", web::get().to(portability)),
    );
}

#[utoipa::path(
    get,
    path = "/portability_button",
    responses(
        (status = 200, description = "Returns the portability button HTML"),
        (status = 500, description = "Database error")
    ),
    tags = ["Portability"]
)]

pub async fn button(req: HttpRequest, credentials: BearerAuth) -> impl Responder {
    let bytes = include_bytes!("../../assets/khali-logo.png");
    let logo_base64 = base64::engine::general_purpose::STANDARD.encode(bytes);

    let tmpl = LoginButtonTemplate {
        popup_url: format!(
            "{}/portability/screen/?token={}",
            req.app_data::<web::Data<crate::infra::types::Config>>()
                .unwrap()
                .get_app_url(),
            credentials.token(),
        ),
        logo_base64,
    };
    HttpResponse::Ok().content_type("text/html").body(
        tmpl.render()
            .unwrap_or_else(|_| "<h1>An error occurred</h1>".to_string()),
    )
}

#[utoipa::path(
    get,
    path = "/portability/screen",
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
    query: web::Query<PortabilityScreenQuery>,
) -> impl Responder {
    let token = &query.token;

    let claims = match verify_jwt(&token, &config.jwt_secret, &keys_client).await {
        Ok(token_data) => token_data.claims,
        Err(err) => {
            return handle_server_error_body("Invalid or expired token", err, &config, None)
        }
    };

    let client_id = match validate_entity_type(&claims, EntityType::ExternalClient).await {
        Ok(subject) => subject.id,
        Err(err) => return handle_server_error_body("Invalid token", err, &config, None),
    };

    dbg!(&client_id);

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
        auth_url: format!("{}/portability/auth/authorize", config.get_app_url()),
        client_name: external_client.name,
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
        Ok(decrypted_user) => HttpResponse::Ok().json(UserPortability {
            name: decrypted_user.name,
            login: decrypted_user.login,
            email: decrypted_user.email,
        }),
        Err(err) => handle_server_error_body("Parse error", err, &config, None),
    }
}
