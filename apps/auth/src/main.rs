mod database;
mod routes;
mod services;
mod types;

use actix_web::{web, App, HttpServer};
use dotenv::dotenv;
use std::env;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenv().ok();
    let port: u16 = env::var("AUTH_PORT")
        .unwrap_or_else(|_| "3000".into())
        .parse()
        .unwrap();

    HttpServer::new(|| {
        App::new()
            .app_data(web::Data::new(database::create_pool()))
            .configure(routes::auth::configure)
            .configure(routes::consent::configure)
            .configure(routes::user::configure)
    })
    .bind(("0.0.0.0", port))?
    .run()
    .await
}
