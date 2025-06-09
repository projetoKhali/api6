use actix_web::{web, HttpResponse, Responder};
use actix_web_httpauth::middleware::HttpAuthentication;
use bcrypt::{hash, DEFAULT_COST};
use fernet::Fernet;
use sea_orm::prelude::Date;
use sea_orm::ActiveValue::{NotSet, Set};
use sea_orm::{
    ActiveModelTrait, //
    EntityTrait,
    IntoActiveModel,
    PaginatorTrait,
    QuerySelect,
};

use crate::entities::external_client as external_client_entity;
use crate::infra::server::{DatabaseClientKeys, DatabaseClientPostgres};
use crate::models::{
    EntityType, //
    ExternalClientPublic,
    ExternalClientUpdate,
    PaginatedRequest,
    PaginatedResponse,
};
use crate::service::fernet::{
    decrypt_database_external_client, //
    encrypt_field,
    get_entity_key,
    GetKeyResult,
};
use crate::service::jwt::validator;

use super::common::{handle_server_error_body, ServerErrorType};

pub fn configure(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/external_clients")
            .wrap(HttpAuthentication::bearer(validator))
            .route("/", web::post().to(get_external_clients)), //
    )
    .service(
        web::scope("/external_client")
            .wrap(HttpAuthentication::bearer(validator))
            .route("/{id}", web::get().to(get_external_client))
            .route("/{id}", web::put().to(update_external_client))
            .route("/{id}", web::delete().to(delete_external_client)),
    );
}

#[utoipa::path(
    post,
    path = "/external_clients/",
    request_body = PaginatedRequest,
    responses(
        (status = 200, description = "ExternalClients found", body = PaginatedResponse<ExternalClientPublic>),
        (status = 404, description = "Not Found"),
        (status = 400, description = "Invalid pagination parameters"),
        (status = 500, description = "Server error")
    ),
    tags = ["External Client"]
)]

async fn get_external_clients(
    postgres_client: web::Data<DatabaseClientPostgres>,
    keys_client: web::Data<DatabaseClientKeys>,
    config: web::Data<crate::infra::types::Config>,
    pagination: web::Json<PaginatedRequest>,
) -> impl Responder {
    let page = pagination.page.unwrap_or(1).max(1);
    let size = pagination.size.unwrap_or(10).max(1);

    let offset = (page - 1) * size;
    let result = external_client_entity::Entity::find()
        .limit(size)
        .offset(Some(offset))
        .all(&postgres_client.client)
        .await;

    let raw_external_clients = match result {
        Err(err) => return handle_server_error_body("Database Error", err, &config, None),
        Ok(raw_external_clients) => raw_external_clients,
    };

    let mut external_clients_public = Vec::with_capacity(raw_external_clients.len());

    for encrypted_external_client in raw_external_clients {
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

        external_clients_public.push(
            match decrypt_database_external_client(
                &external_client_decryption_key,
                encrypted_external_client,
            ) {
                Ok(decrypted_external_client) => decrypted_external_client,
                Err(err) => return handle_server_error_body("Parse error", err, &config, None),
            },
        );
    }

    let total_external_clients = external_client_entity::Entity::find()
        .count(&postgres_client.client)
        .await
        .unwrap_or(0);

    let total_pages = (total_external_clients as f64 / size as f64).ceil() as u64;

    let external_clients_page: PaginatedResponse<ExternalClientPublic> = PaginatedResponse {
        total: external_clients_public.len() as u64,
        page,
        total_pages,
        items: external_clients_public,
    };

    HttpResponse::Ok().json(external_clients_page)
}

#[utoipa::path(
    get,
    path = "/external_client/{id}",
    params(
        ("id" = i64, Path, description = "ExternalClient ID")
    ),
    responses(
        (status = 200, description = "ExternalClient found", body = ExternalClientPublic),
        (status = 404, description = "ExternalClient not found"),
        (status = 500, description = "Server error")
    ),
    tags = ["External Client"]
)]

async fn get_external_client(
    postgres_client: web::Data<DatabaseClientPostgres>,
    keys_client: web::Data<DatabaseClientKeys>,
    config: web::Data<crate::infra::types::Config>,
    external_client_id: web::Path<i64>,
) -> impl Responder {
    let external_client_id = external_client_id.into_inner();

    let result = external_client_entity::Entity::find_by_id(external_client_id)
        .one(&postgres_client.client)
        .await;

    let encrypted_external_client = match result {
        Ok(Some(external_client)) => external_client,
        Ok(None) => {
            return handle_server_error_body(
                "Database Error",
                super::common::CustomError::ExternalClientNotFound(external_client_id),
                &config,
                Some(ServerErrorType::NotFound),
            )
        }
        Err(err) => return handle_server_error_body("Database Error", err, &config, None),
    };

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

    match decrypt_database_external_client(
        &external_client_decryption_key,
        encrypted_external_client,
    ) {
        Ok(decrypted_external_client) => HttpResponse::Ok().json(decrypted_external_client),
        Err(err) => return handle_server_error_body("Parse error", err, &config, None),
    }
}

#[utoipa::path(
    put,
    path = "/external_client/{id}",
    request_body = ExternalClientUpdate,
    params(
        ("id" = i64, Path, description = "ExternalClient ID")
    ),
    responses(
        (status = 200, description = "ExternalClient updated"),
        (status = 404, description = "ExternalClient not found"),
        (status = 500, description = "Server error")
    ),
    tags = ["External Client"]
)]

async fn update_external_client(
    postgres_client: web::Data<DatabaseClientPostgres>,
    keys_client: web::Data<DatabaseClientKeys>,
    config: web::Data<crate::infra::types::Config>,
    external_client_id: web::Path<i64>,
    external_client_update: web::Json<ExternalClientUpdate>,
) -> impl Responder {
    let existing = external_client_entity::Entity::find_by_id(*external_client_id)
        .one(&postgres_client.client)
        .await;

    let mut external_client_update_model = match existing {
        Ok(Some(model)) => model.into_active_model(),
        Ok(None) => return HttpResponse::NotFound().body("ExternalClient not found"),
        Err(err) => return handle_server_error_body("Database Error", err, &config, None),
    };

    let external_client_decryption_key = match get_entity_key(
        *external_client_id,
        EntityType::ExternalClient,
        &keys_client,
        &config,
    )
    .await
    {
        GetKeyResult::Ok(key) => key,
        GetKeyResult::Err(err) => return err,
    };

    external_client_update_model.disabled_since = match &external_client_update.disabled_since {
        Some(dt) => match dt {
            Some(dt) => match Date::parse_from_str(&dt, "%Y-%m-%d") {
                Ok(valid_update_date) => Set(Some(valid_update_date.into())),
                Err(err) => {
                    return handle_server_error_body(
                        "Parse error",
                        err,
                        &config,
                        Some(ServerErrorType::BadRequest),
                    )
                }
            },
            None => Set(None),
        },
        None => NotSet,
    };

    let fernet = Fernet::new(&external_client_decryption_key).unwrap();

    external_client_update_model.name = match external_client_update.name {
        Some(ref name) => Set(encrypt_field(&fernet, &name)),
        None => NotSet,
    };
    external_client_update_model.login = match external_client_update.login {
        Some(ref login) => Set(encrypt_field(&fernet, &login)),
        None => NotSet,
    };
    external_client_update_model.password = match external_client_update.password {
        Some(ref password) => match hash(password, DEFAULT_COST) {
            Ok(ref hashed_password) => Set(encrypt_field(&fernet, hashed_password)),
            Err(_) => return HttpResponse::InternalServerError().body("Hashing error"),
        },
        None => NotSet,
    };

    match external_client_update_model
        .update(&postgres_client.client)
        .await
    {
        Ok(_) => HttpResponse::Ok().finish(),
        Err(err) => handle_server_error_body("Database Error", err, &config, None),
    }
}

#[utoipa::path(
    delete,
    path = "/external_client/{id}",
    params(
        ("id" = i64, Path, description = "ExternalClient ID")
    ),
    responses(
        (status = 200, description = "ExternalClient deleted"),
        (status = 500, description = "Server error")
    ),
    tags = ["External Client"]
)]

async fn delete_external_client(
    postgres_client: web::Data<DatabaseClientPostgres>,
    config: web::Data<crate::infra::types::Config>,
    external_client_id: web::Path<i64>,
) -> impl Responder {
    // TODO: use `disabled_since` field of `external_clients` table

    let result = external_client_entity::Entity::delete_by_id(external_client_id.into_inner())
        .exec(&postgres_client.client)
        .await;

    match result {
        Ok(_) => HttpResponse::Ok().finish(),
        Err(err) => handle_server_error_body("Database Error", err, &config, None),
    }
}
