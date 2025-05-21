use dotenv::dotenv;
use std::{collections::HashMap, env};

use super::types::*;

pub fn setup() -> Config {
    dotenv().ok();

    let database_presets = [
        DatabasePreset {
            name: "postgres".to_string(),
            db_name: PresetField::new("DB_POSTGRES_NAME", "api6_postgres"),
            db_host: PresetField::new("AUTH_DB_POSTGRES_HOST", "localhost"),
            db_port: PresetField::new("DB_POSTGRES_PORT", "5432"),
            db_user: PresetField::new("DB_POSTGRES_USER", "postgres"),
            db_pass: PresetField::new("DB_POSTGRES_PASS", "secret"),
        },
        DatabasePreset {
            name: "keys".to_string(),
            db_name: PresetField::new("DB_KEYS_NAME", "api6_keys"),
            db_host: PresetField::new("AUTH_DB_KEYS_HOST", "localhost"),
            db_port: PresetField::new("DB_KEYS_PORT", "5433"),
            db_user: PresetField::new("DB_KEYS_USER", "postgres"),
            db_pass: PresetField::new("DB_KEYS_PASS", "secret"),
        },
    ];

    Config {
        database_clients: HashMap::from(
            database_presets.map(|preset| (preset.name.clone(), preset.create())),
        ),

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
