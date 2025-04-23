use sea_orm::{Database, DatabaseConnection};
use std::env;
use dotenv::dotenv;

pub async fn create_seaorm_connection() -> DatabaseConnection {
    dotenv().ok();

    let user = env::var("POSTGRES_USER").unwrap_or_else(|_| "postgres".to_string());
    let password = env::var("POSTGRES_PASS").unwrap_or_else(|_| "secret".to_string());
    let host = env::var("POSTGRES_HOST").unwrap_or_else(|_| "localhost".to_string());
    let port = env::var("POSTGRES_PORT").unwrap_or_else(|_| "5432".to_string());
    let dbname = env::var("POSTGRES_DB").unwrap_or_else(|_| "api6_postgres".to_string());

    let db_url = format!("postgres://{}:{}@{}:{}/{}", user, password, host, port, dbname);

    Database::connect(&db_url)
        .await
        .expect("Failed to create SeaORM connection")
}

