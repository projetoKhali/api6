mod infra;
mod models;
mod routes;
mod services;

use infra::server;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    server::create_server()?.await
}
