use crate::routes;
use actix_web::{dev::Server, web, App, HttpServer};

use dotenv::dotenv;
use std::env;

use super::database;

pub fn create_server() -> std::io::Result<Server> {
    dotenv().ok();
    let port: u16 = env::var("AUTH_PORT")
        .unwrap_or_else(|_| "3000".into())
        .parse()
        .unwrap();

    Ok(HttpServer::new(|| {
        App::new()
            .app_data(web::Data::new(database::create_pool()))
            .configure(routes::auth::configure)
            .configure(routes::consent::configure)
            .configure(routes::user::configure)
    })
    .bind(("0.0.0.0", port))?
    .run())
}
