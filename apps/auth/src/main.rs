use actix_web::{get, post, web, App, HttpResponse, HttpServer, Responder};
use dotenv::dotenv;
use reqwest::Client;
use serde::{Deserialize, Serialize};
use serde_json::json;
use std::env;

#[derive(Deserialize)]
struct LoginQuery {
    login_challenge: String,
}

#[derive(Deserialize)]
struct ConsentQuery {
    consent_challenge: String,
}

#[derive(Serialize)]
struct LoginAcceptPayload {
    subject: String,
    remember: bool,
    remember_for: u32,
    acr: String,
    context: serde_json::Value,
}

#[derive(Serialize)]
struct ConsentAcceptPayload {
    grant_scope: Vec<String>,
    grant_access_token_audience: Vec<String>,
    remember: bool,
    remember_for: u32,
    session: serde_json::Value,
}

#[derive(Deserialize)]
struct HydraAcceptResponse {
    redirect_to: String,
}

async fn accept_login(challenge: &str, client: &Client) -> Result<String, reqwest::Error> {
    let hydra_admin_url =
        env::var("AUTH_HYDRA_ADMIN_URL").unwrap_or_else(|_| "http://localhost:4445".into());
    let url = format!(
        "{}/oauth2/auth/requests/login/accept?challenge={}",
        hydra_admin_url, challenge
    );
    let payload = LoginAcceptPayload {
        subject: "user@example.com".into(),
        remember: true,
        remember_for: 3600,
        acr: "0".into(),
        context: json!({}),
    };
    let response = client.post(&url).json(&payload).send().await?;
    let res_json: HydraAcceptResponse = response.json().await?;
    Ok(res_json.redirect_to)
}

async fn accept_consent(challenge: &str, client: &Client) -> Result<String, reqwest::Error> {
    let hydra_admin_url =
        env::var("AUTH_HYDRA_ADMIN_URL").unwrap_or_else(|_| "http://localhost:4445".into());
    let url = format!(
        "{}/oauth2/auth/requests/consent/accept?challenge={}",
        hydra_admin_url, challenge
    );
    let payload = ConsentAcceptPayload {
        grant_scope: vec!["openid".into(), "offline".into()],
        grant_access_token_audience: vec![],
        remember: true,
        remember_for: 3600,
        session: json!({ "id_token": {} }),
    };
    let response = client.post(&url).json(&payload).send().await?;
    let res_json: HydraAcceptResponse = response.json().await?;
    Ok(res_json.redirect_to)
}

#[get("/login")]
async fn login_page(query: web::Query<LoginQuery>) -> impl Responder {
    HttpResponse::Ok().body(format!(
        "<html>
            <body>
                <h1>Login</h1>
                <form action=\"/login\" method=\"post\">
                    <input type=\"hidden\" name=\"login_challenge\" value=\"{}\"/>
                    <button type=\"submit\">Login</button>
                </form>
            </body>
         </html>",
        query.login_challenge
    ))
}

#[post("/login")]
async fn process_login(form: web::Form<LoginQuery>) -> impl Responder {
    let client = Client::new();
    match accept_login(&form.login_challenge, &client).await {
        Ok(redirect_url) => HttpResponse::Ok().json(json!({ "redirect_to": redirect_url })),
        Err(e) => HttpResponse::InternalServerError().body(e.to_string()),
    }
}

#[get("/consent")]
async fn consent_page(query: web::Query<ConsentQuery>) -> impl Responder {
    HttpResponse::Ok().body(format!(
        "<html>
            <body>
                <h1>Consent</h1>
                <form action=\"/consent\" method=\"post\">
                    <input type=\"hidden\" name=\"consent_challenge\" value=\"{}\"/>
                    <button type=\"submit\">Consent</button>
                </form>
            </body>
         </html>",
        query.consent_challenge
    ))
}

#[post("/consent")]
async fn process_consent(form: web::Form<ConsentQuery>) -> impl Responder {
    let client = Client::new();
    match accept_consent(&form.consent_challenge, &client).await {
        Ok(redirect_url) => HttpResponse::Ok().json(json!({ "redirect_to": redirect_url })),
        Err(e) => HttpResponse::InternalServerError().body(e.to_string()),
    }
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenv().ok();
    let port: u16 = env::var("AUTH_PORT")
        .unwrap_or_else(|_| "3000".into())
        .parse()
        .unwrap();
    HttpServer::new(|| {
        App::new()
            .service(login_page)
            .service(process_login)
            .service(consent_page)
            .service(process_consent)
    })
    .bind(("0.0.0.0", port))?
    .run()
    .await
}
