use actix_web::{web, HttpResponse, Responder};
use sea_orm::prelude::Date;
use sea_orm::ActiveValue::{NotSet, Set};
use sea_orm::{ActiveModelTrait, DatabaseConnection, EntityTrait, IntoActiveModel, QuerySelect};
use bcrypt::{hash, DEFAULT_COST};

use crate::entities::user as user_entity;
use crate::models::{PaginatedRequest, PaginatedResponse, UserPublic, UserUpdate};

pub fn configure(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/user")
            .route("/", web::post().to(get_users))
            .route("/{id}", web::get().to(get_user))
            .route("/{id}", web::put().to(update_user))
            .route("/{id}", web::delete().to(delete_user)),
    );
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

async fn get_user(db: web::Data<DatabaseConnection>, user_id: web::Path<i64>) -> impl Responder {
    let result = user_entity::Entity::find_by_id(user_id.into_inner())
        .one(db.get_ref())
        .await;

    match result {
        Ok(Some(user)) => HttpResponse::Ok().json(UserPublic {
            id: user.id,
            name: user.name,
            login: user.login,
            email: user.email,
            version_terms: user.version_terms_agreement,
            permission_id: user.permission_id,
            disabled_since: match user.disabled_since {
                Some(dt) => Some(dt.format("%Y-%m-%d)").to_string()),
                None => None,
            },
        }),
        Ok(None) => HttpResponse::NotFound().finish(),
        Err(_) => HttpResponse::InternalServerError().finish(),
    }
}

#[utoipa::path(
    post,
    path = "/user",
    request_body = PaginatedRequest,
    responses(
        (status = 200, description = "Users found", body = PaginatedResponse<UserPublic>),
        (status = 500, description = "Server error")
    ),
    tags = ["User"]
)]

async fn get_users(
  db: web::Data<DatabaseConnection>,
  pagination: web::Json<PaginatedRequest>,
) -> impl Responder {
    let page = pagination.page.unwrap_or(1);
    let limit = pagination.limit.unwrap_or(10);

    let offset = (page - 1) * limit;
    let result = user_entity::Entity::find()
        .limit(limit)
        .offset(Some(offset))
        .all(db.get_ref())
        .await;

    match result {
        Ok(users) => {
            let users: Vec<UserPublic> = users
                .into_iter()
                .map(|user| UserPublic {
                    id: user.id,
                    name: user.name,
                    login: user.login,
                    email: user.email,
                    version_terms: user.version_terms_agreement,
                    permission_id: user.permission_id,
                    disabled_since: match user.disabled_since {
                        Some(dt) => Some(dt.format("%Y-%m-%d").to_string()),
                        None => None,
                    },
                })
                .collect();

            let users_page: PaginatedResponse<UserPublic> = PaginatedResponse {
                total: users.len() as u64,
                page,
                limit,
                items: users,
            };

            HttpResponse::Ok().json(users_page)
        }
        Err(_) => HttpResponse::InternalServerError().finish(),
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
    db: web::Data<DatabaseConnection>,
    user_id: web::Path<i64>,
    user_update: web::Json<UserUpdate>,
) -> impl Responder {
    let existing = user_entity::Entity::find_by_id(*user_id)
        .one(db.get_ref())
        .await;

    match existing {
        Ok(Some(model)) => {
            let mut update_model = model.into_active_model();

            update_model.disabled_since = match &user_update.disabled_since {
                Some(dt) => match dt {
                    Some(dt) => match Date::parse_from_str(&dt, "%Y-%m-%d") {
                        Ok(valid_update_date) => Set(Some(valid_update_date.into())),
                        Err(_) => return HttpResponse::BadRequest().body("Invalid disabled_since"),
                    },
                    None => Set(None),
                },
                None => NotSet,
            };

            update_model.name = match user_update.name {
                Some(ref name) => Set(name.clone()),
                None => NotSet,
            };
            update_model.login = match user_update.login {
                Some(ref login) => Set(login.clone()),
                None => NotSet,
            };
            update_model.email = match user_update.email {
                Some(ref email) => Set(email.clone()),
                None => NotSet,
            };
            update_model.version_terms_agreement = match user_update.version_terms {
                Some(ref version_terms) => Set(version_terms.clone()),
                None => NotSet,
            };
            update_model.permission_id = match user_update.permission_id {
                Some(permission_id) => Set(permission_id),
                None => NotSet,
            };
            update_model.password = match user_update.password {
                Some(ref password) => match hash(password, DEFAULT_COST) {
                    Ok(h) => Set(h),
                    Err(_) => return HttpResponse::InternalServerError().body("Hashing error"),
                },
                None => NotSet,
            };

            match update_model.update(db.get_ref()).await {
                Ok(_) => HttpResponse::Ok().finish(),
                Err(_) => HttpResponse::InternalServerError().finish(),
            }
        }
        Ok(None) => HttpResponse::NotFound().body("User not found"),
        Err(_) => HttpResponse::InternalServerError().finish(),
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

async fn delete_user(db: web::Data<DatabaseConnection>, user_id: web::Path<i64>) -> impl Responder {
    let result = user_entity::Entity::delete_by_id(user_id.into_inner())
        .exec(db.get_ref())
        .await;

    match result {
        Ok(_) => HttpResponse::Ok().finish(),
        Err(_) => HttpResponse::InternalServerError().finish(),
    }
}
