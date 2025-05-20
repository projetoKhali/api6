use sea_orm::{Database, DatabaseConnection};

use super::types::DatabaseConfig;

pub async fn create_seaorm_connection(config: &DatabaseConfig) -> DatabaseConnection {
    let db_url = format!(
      "postgres://{}:{}@{}:{}/{}",
      config.db_user,
      config.db_pass,
      config.db_host,
      config.db_port,
      config.db_name,
    );

    println!("Connecting to database at {}", db_url);

    match Database::connect(&db_url).await {
        Ok(connection) => {
            println!("Successfully connected");
            connection
        },
        Err(err) => {
            eprintln!("Failed to connect to database: {}", err);
            panic!("Failed to create SeaORM connection");
        }
    }
}

