use dotenv::dotenv;
use std::env;
use tokio_postgres::NoTls;

use deadpool_postgres::{Config, ManagerConfig, Pool, RecyclingMethod};

pub fn create_pool() -> Pool {
    dotenv().ok();

    let mut cfg = Config::new();
    cfg.user = Some(env::var("POSTGRES_USER").unwrap_or_else(|_| "postgres".to_string()));
    cfg.password = Some(env::var("POSTGRES_PASS").unwrap_or_else(|_| "secret".to_string()));
    cfg.host = Some(env::var("POSTGRES_HOST").unwrap_or_else(|_| "localhost".to_string()));
    cfg.port = Some(
        env::var("POSTGRES_PORT")
            .unwrap_or_else(|_| "5432".to_string())
            .parse()
            .unwrap_or(5432),
    );
    cfg.dbname = Some(env::var("POSTGRES_DB").unwrap_or_else(|_| "api6_postgres".to_string()));
    cfg.manager = Some(ManagerConfig {
        recycling_method: RecyclingMethod::Fast,
    });

    cfg.create_pool(None, NoTls).expect("Failed to create pool")
}
