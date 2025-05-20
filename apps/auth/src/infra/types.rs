use std::collections::HashMap;

pub struct DatabaseConfig {
    pub db_user: String,
    pub db_pass: String,
    pub db_host: String,
    pub db_port: u16,
    pub db_name: String,
}

pub struct Config {
    pub database_clients: HashMap<String, DatabaseConfig>,
    pub server_port: u16,
    pub jwt_secret: String,
    pub dev_mode: bool,
}

impl Config {
    pub fn get_database_config(&self, name: &str) -> &DatabaseConfig {
        match self.database_clients.get(name) {
            Some(config) => config,
            None => panic!("Database config not found for `{}`", name),
        }
    }
}

pub struct PresetField {
    pub field: String,
    pub default: String,
}

impl PresetField {
    pub fn new(field: &str, default: &str) -> Self {
        Self {
            field: field.to_string(),
            default: default.to_string(),
        }
    }
}

pub struct DatabasePreset {
    pub name: String,
    pub db_user: PresetField,
    pub db_pass: PresetField,
    pub db_host: PresetField,
    pub db_port: PresetField,
    pub db_name: PresetField,
}

impl DatabasePreset {
    pub fn create(&self) -> DatabaseConfig {
        DatabaseConfig {
            db_user: std::env::var(&self.db_user.field)
                .unwrap_or_else(|_| self.db_user.default.clone()),
            db_pass: std::env::var(&self.db_pass.field)
                .unwrap_or_else(|_| self.db_pass.default.clone()),
            db_host: std::env::var(&self.db_host.field)
                .unwrap_or_else(|_| self.db_host.default.clone()),
            db_port: std::env::var(&self.db_port.field)
                .unwrap_or_else(|_| self.db_port.default.clone())
                .parse()
                .unwrap(),
            db_name: std::env::var(&self.db_name.field)
                .unwrap_or_else(|_| self.db_name.default.clone()),
        }
    }
}
