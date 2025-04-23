use actix_web::{web, HttpResponse, Responder};
use sea_orm::{
    ActiveModelTrait, DatabaseConnection, EntityTrait, IntoActiveModel, Set
};
use uuid::Uuid;

use crate::entities::user as user_entity;
use crate::models::User;

pub fn configure(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/user")
            .route("/", web::post().to(create_user))
            .route("/{id}", web::get().to(get_user))
            .route("/{id}", web::put().to(update_user))
            .route("/{id}", web::delete().to(delete_user)),
    );
}

#[utoipa::path(
    post,
    path = "/user/",
    request_body = User,
    responses(
        (status = 201, description = "User created successfully", body = User),
        (status = 500, description = "Server error")
    ),
    tags = ["User"]
)]
async fn create_user(
    db: web::Data<DatabaseConnection>,
    new_user: web::Json<User>,
) -> impl Responder {
    let user = user_entity::ActiveModel {
        id: Set(new_user.id),
        email: Set(new_user.email.clone()),
        hashed_password: Set(new_user.hashed_password.clone()),
        ..Default::default()
    };

    match user.insert(db.get_ref()).await {
        Ok(saved_user) => HttpResponse::Created().json(User {
            id: saved_user.id,
            email: saved_user.email,
            hashed_password: saved_user.hashed_password,
        }),
        Err(_) => HttpResponse::InternalServerError().finish(),
    }
}
#[utoipa::path(
    get,
    path = "/user/{id}",
    params(
        ("id" = Uuid, Path, description = "User UUID")
    ),
    responses(
        (status = 200, description = "User found", body = User),
        (status = 404, description = "User not found"),
        (status = 500, description = "Server error")
    ),
    tags = ["User"]
)]
async fn get_user(db: web::Data<DatabaseConnection>, user_id: web::Path<Uuid>) -> impl Responder {
    let result = user_entity::Entity::find_by_id(user_id.into_inner())
        .one(db.get_ref())
        .await;

    match result {
        Ok(Some(user)) => HttpResponse::Ok().json(User {
            id: user.id,
            email: user.email,
            hashed_password: user.hashed_password,
        }),
        Ok(None) => HttpResponse::NotFound().finish(),
        Err(_) => HttpResponse::InternalServerError().finish(),
    }
}

#[utoipa::path(
    put,
    path = "/user/{id}",
    request_body = User,
    params(
        ("id" = Uuid, Path, description = "User UUID")
    ),
    responses(
        (status = 200, description = "User updated"),
        (status = 404, description = "User not found"),
        (status = 500, description = "Server error")
    ),
    tags = ["User"]
)]
async fn update_user(db: web::Data<DatabaseConnection>, user: web::Json<User>) -> impl Responder {
    let existing = user_entity::Entity::find_by_id(user.id)
        .one(db.get_ref())
        .await;

    match existing {
        Ok(Some(mut model)) => {
            model.email = user.email.clone();
            model.hashed_password = user.hashed_password.clone();

            // match user_entity::ActiveModel::update(db.get_ref()).await {
            match model.into_active_model().update(db.get_ref()).await {
                Ok(_) => HttpResponse::Ok().finish(),
                Err(_) => HttpResponse::InternalServerError().finish(),
            }
        }
        Ok(None) => HttpResponse::NotFound().finish(),
        Err(_) => HttpResponse::InternalServerError().finish(),
    }
}

#[utoipa::path(
    delete,
    path = "/user/{id}",
    params(
        ("id" = Uuid, Path, description = "User UUID")
    ),
    responses(
        (status = 200, description = "User deleted"),
        (status = 500, description = "Server error")
    ),
    tags = ["User"]
)]
async fn delete_user(
    db: web::Data<DatabaseConnection>,
    user_id: web::Path<Uuid>,
) -> impl Responder {
    let result = user_entity::Entity::delete_by_id(user_id.into_inner())
        .exec(db.get_ref())
        .await;

    match result {
        Ok(_) => HttpResponse::Ok().finish(),
        Err(_) => HttpResponse::InternalServerError().finish(),
    }
}
