use crate::services::hydra::accept_consent;
use actix_web::{web, HttpResponse, Responder};
use reqwest::Client;
use serde_json::json;

use super::types::*;

pub fn configure(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/consent")
            .route("", web::get().to(consent_page))
            .route("", web::post().to(process_consent)),
    );
}

async fn consent_page(query: web::Query<ConsentQuery>) -> impl Responder {
    HttpResponse::Ok().body(format!(
        "<form method='post' action='/consent'>
            <input type='hidden' name='consent_challenge' value='{}'/>
            <button type='submit'>Consent</button>
        </form>",
        query.consent_challenge
    ))
}

async fn process_consent(form: web::Form<ConsentQuery>) -> impl Responder {
    let client = Client::new();
    match accept_consent(&form.consent_challenge, &client).await {
        Ok(redirect_url) => HttpResponse::Ok().json(json!({ "redirect_to": redirect_url })),
        Err(e) => HttpResponse::InternalServerError().body(e.to_string()),
    }
}
