use actix_web::{web, HttpResponse, Responder};
use actix_web_httpauth::middleware::HttpAuthentication;
use bcrypt::{hash, DEFAULT_COST};
use fernet::Fernet;
use sea_orm::prelude::Date;
use sea_orm::ActiveValue::{NotSet, Set};
use sea_orm::{ActiveModelTrait, EntityTrait, IntoActiveModel, PaginatorTrait, QuerySelect};

use crate::entities::user as user_entity;
use crate::infra::server::{DatabaseClientKeys, DatabaseClientPostgres};
use crate::models::{PaginatedRequest, PaginatedResponse, UserPublic, UserUpdate};
use crate::service::fernet::{
    decrypt_database_user, encrypt_field, get_user_key, GetUserKeyResult,
};
use crate::service::jwt::validator;

use super::common::{handle_server_error_body, ServerErrorType};

pub fn configure(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/users")
            .wrap(HttpAuthentication::bearer(validator))
            .route("/", web::post().to(get_users)), //
    )
    .service(
        web::scope("/user")
            .wrap(HttpAuthentication::bearer(validator))
            .route("/{id}", web::get().to(get_user))
            .route("/{id}", web::put().to(update_user))
            .route("/{id}", web::delete().to(delete_user)),
    );
}

#[utoipa::path(
    post,
    path = "/users/",
    request_body = PaginatedRequest,
    responses(
        (status = 200, description = "Users found", body = PaginatedResponse<UserPublic>),
        (status = 404, description = "Not Found"),
        (status = 400, description = "Invalid pagination parameters"),
        (status = 500, description = "Server error")
    ),
    tags = ["User"]
)]

async fn get_users(
    postgres_client: web::Data<DatabaseClientPostgres>,
    keys_client: web::Data<DatabaseClientKeys>,
    config: web::Data<crate::infra::types::Config>,
    pagination: web::Json<PaginatedRequest>,
) -> impl Responder {
    let page = pagination.page.unwrap_or(1).max(1);
    let size = pagination.size.unwrap_or(10).max(1);

    let offset = (page - 1) * size;
    let result = user_entity::Entity::find()
        .limit(size)
        .offset(Some(offset))
        .all(&postgres_client.client)
        .await;

    let raw_users = match result {
        Err(err) => return handle_server_error_body("Database Error", err, &config, None),
        Ok(raw_users) => raw_users,
    };

    let mut users_public = Vec::with_capacity(raw_users.len());

    for encrypted_user in raw_users {
        let user_decryption_key = match get_user_key(encrypted_user.id, &keys_client, &config).await
        {
            GetUserKeyResult::Ok(key) => key,
            GetUserKeyResult::Err(err) => return err,
        };

        users_public.push(
            match decrypt_database_user(&user_decryption_key, encrypted_user) {
                Ok(decrypted_user) => decrypted_user,
                Err(err) => return handle_server_error_body("Parse error", err, &config, None),
            },
        );
    }

    let total_users = user_entity::Entity::find()
        .count(&postgres_client.client)
        .await
        .unwrap_or(0);

    let total_pages = (total_users as f64 / size as f64).ceil() as u64;

    let users_page: PaginatedResponse<UserPublic> = PaginatedResponse {
        total: users_public.len() as u64,
        page,
        total_pages,
        items: users_public,
    };

    HttpResponse::Ok().json(users_page)
}

#[utoipa::path(
    get,
    path = "/user/{id}",
    params(
        ("id" = i64, Path, description = "User ID")
    ),
    responses(
        (status = 200, description = "User found", body = UserPublic),
        (status = 404, description = "User not found"),
        (status = 500, description = "Server error")
    ),
    tags = ["User"]
)]

async fn get_user(
    postgres_client: web::Data<DatabaseClientPostgres>,
    keys_client: web::Data<DatabaseClientKeys>,
    config: web::Data<crate::infra::types::Config>,
    user_id: web::Path<i64>,
) -> impl Responder {
    let result = user_entity::Entity::find_by_id(user_id.into_inner())
        .one(&postgres_client.client)
        .await;

    let encrypted_user = match result {
        Ok(Some(user)) => user,
        Ok(None) => {
            return handle_server_error_body(
                "Database Error",
                std::io::Error::new(
                    std::io::ErrorKind::NotFound,
                    "User not found in `users` table",
                ),
                &config,
                Some(ServerErrorType::NotFound),
            )
        }
        Err(err) => return handle_server_error_body("Database Error", err, &config, None),
    };

    let user_decryption_key = match get_user_key(encrypted_user.id, &keys_client, &config).await {
        GetUserKeyResult::Ok(key) => key,
        GetUserKeyResult::Err(err) => return err,
    };

    match decrypt_database_user(&user_decryption_key, encrypted_user) {
        Ok(decrypted_user) => HttpResponse::Ok().json(decrypted_user),
        Err(err) => return handle_server_error_body("Parse error", err, &config, None),
    }
}

#[utoipa::path(
    put,
    path = "/user/{id}",
    request_body = UserUpdate,
    params(
        ("id" = i64, Path, description = "User ID")
    ),
    responses(
        (status = 200, description = "User updated"),
        (status = 404, description = "User not found"),
        (status = 500, description = "Server error")
    ),
    tags = ["User"]
)]

async fn update_user(
    postgres_client: web::Data<DatabaseClientPostgres>,
    keys_client: web::Data<DatabaseClientKeys>,
    config: web::Data<crate::infra::types::Config>,
    user_id: web::Path<i64>,
    user_update: web::Json<UserUpdate>,
) -> impl Responder {
    let existing = user_entity::Entity::find_by_id(*user_id)
        .one(&postgres_client.client)
        .await;

    let mut user_update_model = match existing {
        Ok(Some(model)) => model.into_active_model(),
        Ok(None) => return HttpResponse::NotFound().body("User not found"),
        Err(err) => return handle_server_error_body("Database Error", err, &config, None),
    };

    let user_decryption_key = match get_user_key(*user_id, &keys_client, &config).await {
        GetUserKeyResult::Ok(key) => key,
        GetUserKeyResult::Err(err) => return err,
    };

    user_update_model.disabled_since = match &user_update.disabled_since {
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

    let fernet = Fernet::new(&user_decryption_key).unwrap();

    user_update_model.name = match user_update.name {
        Some(ref name) => Set(encrypt_field(&fernet, &name)),
        None => NotSet,
    };
    user_update_model.login = match user_update.login {
        Some(ref login) => Set(encrypt_field(&fernet, &login)),
        None => NotSet,
    };
    user_update_model.email = match user_update.email {
        Some(ref email) => Set(encrypt_field(&fernet, &email)),
        None => NotSet,
    };
    user_update_model.version_terms_agreement = match user_update.version_terms {
        Some(ref version_terms) => Set(encrypt_field(&fernet, &version_terms)),
        None => NotSet,
    };
    user_update_model.role_id = match user_update.role_id {
        Some(role_id) => Set(role_id),
        None => NotSet,
    };
    user_update_model.password = match user_update.password {
        Some(ref password) => match hash(password, DEFAULT_COST) {
            Ok(ref hashed_password) => Set(encrypt_field(&fernet, hashed_password)),
            Err(_) => return HttpResponse::InternalServerError().body("Hashing error"),
        },
        None => NotSet,
    };

    match user_update_model.update(&postgres_client.client).await {
        Ok(_) => HttpResponse::Ok().finish(),
        Err(err) => handle_server_error_body("Database Error", err, &config, None),
    }
}

#[utoipa::path(
    delete,
    path = "/user/{id}",
    params(
        ("id" = i64, Path, description = "User ID")
    ),
    responses(
        (status = 200, description = "User deleted"),
        (status = 500, description = "Server error")
    ),
    tags = ["User"]
)]

async fn delete_user(
    postgres_client: web::Data<DatabaseClientPostgres>,
    config: web::Data<crate::infra::types::Config>,
    user_id: web::Path<i64>,
) -> impl Responder {
    // TODO: use `disabled_since` field of `users` table
    // OR insert user into `deleted_users` table

    let result = user_entity::Entity::delete_by_id(user_id.into_inner())
        .exec(&postgres_client.client)
        .await;

    match result {
        Ok(_) => HttpResponse::Ok().finish(),
        Err(err) => handle_server_error_body("Database Error", err, &config, None),
    }
}
