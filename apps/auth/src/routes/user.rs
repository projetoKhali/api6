use actix_web::{web, HttpResponse, Responder};

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

async fn create_user(
    client: web::Data<tokio_postgres::Client>,
    new_user: web::Json<User>,
) -> impl Responder {
    let stmt = client
        .prepare("INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id")
        .await
        .unwrap();

    match client
        .query_one(&stmt, &[&new_user.email, &new_user.password])
        .await
    {
        Ok(row) => {
            let id: i32 = row.get(0);
            HttpResponse::Created().json(User {
                id,
                email: new_user.email.clone(),
                password: new_user.password.clone(),
            })
        }
        Err(_) => HttpResponse::InternalServerError().finish(),
    }
}

async fn get_user(
    client: web::Data<tokio_postgres::Client>,
    user_id: web::Path<i32>,
) -> impl Responder {
    let stmt = client
        .prepare("SELECT id, email, password FROM users WHERE id = $1")
        .await
        .unwrap();

    match client.query_one(&stmt, &[&user_id.into_inner()]).await {
        Ok(row) => {
            let user = User {
                id: row.get(0),
                email: row.get(1),
                password: row.get(2),
            };
            HttpResponse::Ok().json(user)
        }
        Err(_) => HttpResponse::NotFound().finish(),
    }
}

async fn update_user(
    client: web::Data<tokio_postgres::Client>,
    user: web::Json<User>,
) -> impl Responder {
    let stmt = client
        .prepare("UPDATE users SET email = $1, password = $2 WHERE id = $3")
        .await
        .unwrap();

    match client
        .execute(&stmt, &[&user.email, &user.password, &user.id])
        .await
    {
        Ok(_) => HttpResponse::Ok().finish(),
        Err(_) => HttpResponse::InternalServerError().finish(),
    }
}

async fn delete_user(
    client: web::Data<tokio_postgres::Client>,
    user_id: web::Path<i32>,
) -> impl Responder {
    let stmt = client
        .prepare("DELETE FROM users WHERE id = $1")
        .await
        .unwrap();

    match client.execute(&stmt, &[&user_id.into_inner()]).await {
        Ok(_) => HttpResponse::Ok().finish(),
        Err(_) => HttpResponse::InternalServerError().finish(),
    }
}
