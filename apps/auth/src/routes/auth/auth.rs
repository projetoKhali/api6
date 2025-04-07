use crate::services::hydra::accept_login;
use actix_web::{web, HttpResponse, Responder};
use reqwest::Client;
use serde_json::json;

use super::types::*;

pub fn configure(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/login")
            .route("", web::get().to(login_page))
            .route("", web::post().to(process_login)),
    );
}

async fn login_page(query: web::Query<LoginQuery>) -> impl Responder {
    HttpResponse::Ok().body(format!(
        "<form method='post' action='/login'>
            <input type='hidden' name='login_challenge' value='{}'/>
            <button type='submit'>Login</button>
        </form>",
        query.login_challenge
    ))
}

async fn process_login(form: web::Form<LoginQuery>) -> impl Responder {
    let client = Client::new();
    match accept_login(&form.login_challenge, &client).await {
        Ok(redirect_url) => HttpResponse::Ok().json(json!({ "redirect_to": redirect_url })),
        Err(e) => HttpResponse::InternalServerError().body(e.to_string()),
    }
}
