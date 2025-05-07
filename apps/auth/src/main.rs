mod infra;
mod jwt;

mod entities;
mod models;
mod routes;

mod swagger;

use infra::{config, server};

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    let config = config::setup();

    if config.dev_mode {
        std::env::set_var("RUST_LOG", "debug");
        env_logger::init();
    }

    let server = server::create_server(config).await?;

    server.await
}
