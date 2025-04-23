use actix_web::{web, HttpResponse, Responder};
use bcrypt::{hash, verify, DEFAULT_COST};
use sea_orm::{ActiveModelTrait, ColumnTrait, DatabaseConnection, EntityTrait, QueryFilter, Set};
use uuid::Uuid;

use crate::entities::user;
use crate::jwt::{create_jwt, verify_jwt, Claims};
use crate::models::auth::*;

pub fn configure(cfg: &mut web::ServiceConfig) {
    cfg.service(web::scope("/login").route("", web::get().to(login)));
}

#[utoipa::path(
    post,
    path = "/auth/register",
    request_body = RegisterRequest,
    responses(
        (status = 200, description = "User registered"),
        (status = 500, description = "Hashing or Database error")
    ),
    tags = ["Auth"]
)]
pub async fn register(
    db: web::Data<DatabaseConnection>,
    data: web::Json<RegisterRequest>,
) -> impl Responder {
    let hashed = match hash(&data.password, DEFAULT_COST) {
        Ok(h) => h,
        Err(_) => return HttpResponse::InternalServerError().body("Hashing error"),
    };

    let new_user = user::ActiveModel {
        id: Set(Uuid::new_v4()),
        email: Set(data.email.clone()),
        hashed_password: Set(hashed),
        ..Default::default()
    };

    match new_user.insert(db.get_ref()).await {
        Ok(_) => HttpResponse::Ok().body("User registered"),
        Err(e) => {
            eprintln!("Failed to register user: {:?}", e);
            HttpResponse::InternalServerError().body("Database error")
        }
    }
}

#[utoipa::path(
    post,
    path = "/auth/login",
    request_body = LoginRequest,
    responses(
        (status = 200, description = "Login successful", body = TokenResponse),
        (status = 401, description = "Unauthorized"),
        (status = 500, description = "Database error")
    ),
    tags = ["Auth"]
)]
pub async fn login(
    db: web::Data<DatabaseConnection>,
    data: web::Json<LoginRequest>,
) -> impl Responder {
    let user_result = user::Entity::find()
        .filter(user::Column::Email.eq(data.email.clone()))
        .one(db.get_ref())
        .await;

    match user_result {
        Ok(Some(user)) => {
            if verify(&data.password, &user.hashed_password).unwrap_or(false) {
                let token = create_jwt(&user.id.to_string());
                HttpResponse::Ok().json(TokenResponse { token })
            } else {
                HttpResponse::Unauthorized().body("Invalid credentials")
            }
        }
        Ok(None) => HttpResponse::Unauthorized().body("User not found"),
        Err(_) => HttpResponse::InternalServerError().body("Database error"),
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
pub async fn validate_token(data: web::Json<ValidateRequest>) -> impl Responder {
    match verify_jwt(&data.token) {
        Ok(claims) => HttpResponse::Ok().json(claims.claims),
        Err(_) => HttpResponse::Unauthorized().body("Invalid token"),
    }
}

#[utoipa::path(
    post,
    path = "/auth/logout",
    request_body = ValidateRequest,
    responses(
        (status = 200, description = "Token invalidated (simulated)")
    ),
    tags = ["Auth"]
)]
pub async fn logout(_data: web::Json<ValidateRequest>) -> impl Responder {
    HttpResponse::Ok().body("Token invalidated (not really)")
}
