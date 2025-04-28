use crate::routes;
use actix_cors::Cors;
use actix_web::{dev::Server, web, App, HttpServer};
use utoipa_swagger_ui::SwaggerUi;

use utoipa::OpenApi;

use super::{config::Config, db};

pub async fn create_server(config: Config) -> std::io::Result<Server> {
    let server_port = config.server_port;

    let db_client_data = web::Data::new(db::create_seaorm_connection(&config.db).await);
    let config_data = web::Data::new(config);

    let server = HttpServer::new(move || {
        App::new()
            .wrap(actix_web::middleware::Logger::default())
            .wrap(Cors::permissive())
            .app_data(db_client_data.clone())
            .app_data(config_data.clone())
            .service(
                SwaggerUi::new("/docs/{_:.*}")
                    .url("/docs/openapi.json", crate::swagger::ApiDoc::openapi()),
            )
            .configure(routes::user)
            .configure(routes::auth)
    })
    .bind(("0.0.0.0", server_port))?;

    Ok(server.run())
}
