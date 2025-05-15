use dotenv::dotenv;
use std::env;

pub struct DatabaseConfig {
    pub db_user: String,
    pub db_pass: String,
    pub db_host: String,
    pub db_port: u16,
    pub db_name: String,
}

pub struct Config {
    pub db: DatabaseConfig,
    pub server_port: u16,
    pub jwt_secret: String,
    pub dev_mode: bool,
}

pub fn setup() -> Config {
    dotenv().ok();

    Config {
        db: DatabaseConfig {
            db_user: env::var("DB_POSTGRES_USER").unwrap_or_else(|_| "postgres".to_string()),
            db_pass: env::var("DB_POSTGRES_PASS").unwrap_or_else(|_| "secret".to_string()),
            db_host: env::var("AUTH_DB_HOST").unwrap_or_else(|_| "localhost".to_string()),
            db_name: env::var("DB_POSTGRES_NAME").unwrap_or_else(|_| "api6_postgres".to_string()),
            db_port: env::var("DB_POSTGRES_PORT")
                .unwrap_or_else(|_| "5432".into())
                .parse()
                .unwrap(),
        },

        jwt_secret: env::var("AUTH_JWT_SECRET").expect("AUTH_JWT_SECRET must be set"),

        dev_mode: env::var("AUTH_DEV_MODE")
            .unwrap_or_else(|_| "false".into())
            .parse()
            .unwrap(),

        server_port: env::var("AUTH_APP_PORT")
            .unwrap_or_else(|_| "3000".into())
            .parse()
            .unwrap(),
    }
}
