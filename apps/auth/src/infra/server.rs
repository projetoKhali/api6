use crate::{routes, ApiDoc};
use actix_web::{dev::Server, web, App, HttpServer};
use utoipa_swagger_ui::SwaggerUi;

use dotenv::dotenv;
use std::env;
use utoipa::OpenApi;

use super::db;

pub fn create_server() -> std::io::Result<Server> {
    dotenv().ok();

    let port: u16 = env::var("AUTH_PORT")
        .unwrap_or_else(|_| "3000".into())
        .parse()
        .unwrap();

    let server = HttpServer::new(|| {
        App::new()
            .app_data(web::Data::new(db::create_seaorm_connection()))
            .service(SwaggerUi::new("/docs/{_:.*}").url("/docs/openapi.json", ApiDoc::openapi()))
            .configure(routes::auth)
            .configure(routes::user)
    })
    .bind(("0.0.0.0", port))?;

    println!("Server listening at http://localhost:{}", port);

    Ok(server.run())
}
