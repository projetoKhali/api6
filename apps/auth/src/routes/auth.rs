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
    DatabaseConnection,
    EntityTrait,
    NotSet,
    QueryFilter,
    Set,
};

use crate::{
    entities::user,
    jwt::*,
    models::{auth::*, jwt::Claims},
};

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
    db: web::Data<DatabaseConnection>,
    data: web::Json<RegisterRequest>,
) -> impl Responder {
    let hashed = match hash(&data.password, DEFAULT_COST) {
        Ok(h) => h,
        Err(_) => return HttpResponse::InternalServerError().body("Hashing error"),
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
    db: web::Data<DatabaseConnection>,
    config: web::Data<crate::infra::config::Config>,
    data: web::Json<LoginRequest>,
) -> impl Responder {
    let user_result = user::Entity::find()
        .filter(user::Column::Login.eq(data.login.clone()))
        .one(db.get_ref())
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
        Err(err) => HttpResponse::InternalServerError().body(format!(
            "Database error: {}",
            match &config.dev_mode {
                true => format!(": {:?}", err),
                false => "".to_string(),
            }
        )),
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
    db: web::Data<DatabaseConnection>,
    config: web::Data<crate::infra::config::Config>,
) -> impl Responder {
    match verify_jwt(&data.token, &config.jwt_secret, db.get_ref()).await {
        Ok(claims) => HttpResponse::Ok().json(claims.claims),
        Err(_) => HttpResponse::Unauthorized().body("Invalid token"),
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
    db: web::Data<DatabaseConnection>,
    cfg: web::Data<crate::infra::config::Config>,
) -> impl Responder {
    let token = match extract_bearer(&req) {
        Ok(t) => t,
        Err(msg) => return HttpResponse::BadRequest().body(msg),
    };

    if let Err(_) = revoke_token(token, &cfg.jwt_secret, db.get_ref()).await {
        return HttpResponse::InternalServerError().finish();
    }

    HttpResponse::Ok().body("Token invalidated")
}
