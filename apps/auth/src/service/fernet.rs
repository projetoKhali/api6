use std::num::ParseIntError;

use actix_web::{web, HttpResponse};
use fernet::Fernet;

use sea_orm::EntityTrait;

use crate::{
    entities::{
        keys as keys_entity, //
        user::Model as user_model,
    },
    models::UserPublic,
    routes::common::{
        handle_server_error_body, //
        CustomError,
        ServerErrorType,
    },
};

pub enum GetUserKeyResult {
    Ok(String),
    Err(HttpResponse),
}

pub async fn get_user_key(
    user_id: i64,
    keys_client: &web::Data<crate::infra::server::DatabaseClientKeys>,
    config: &web::Data<crate::infra::types::Config>,
) -> GetUserKeyResult {
    let user_key_result = keys_entity::Entity::find_by_id(user_id)
        .one(&keys_client.client)
        .await;

    match user_key_result {
        Err(err) => GetUserKeyResult::Err(handle_server_error_body(
            "Database Error",
            err,
            &config,
            Some(ServerErrorType::InternalServerError),
        )),
        Ok(None) => GetUserKeyResult::Err(handle_server_error_body(
            "Database Error",
            CustomError::UserKeyNotFound(user_id),
            &config,
            Some(ServerErrorType::NotFound),
        )),
        Ok(Some(user_key)) => GetUserKeyResult::Ok(user_key.key),
    }
}

pub fn encrypt_field(f: &Fernet, value: &str) -> String {
    let ciphertext = f.encrypt(value.as_bytes());
    String::from_utf8(ciphertext.into_bytes()).expect("UTF-8 encode error")
}

pub fn decrypt_field(f: &Fernet, value: &str) -> String {
    let plaintext = f.decrypt(value).expect("Fernet decryption error");
    String::from_utf8(plaintext).expect("UTF-8 decode error")
}

pub fn decrypt_database_user(
    user_decryption_key: &str,
    user: user_model,
) -> Result<UserPublic, ParseIntError> {
    let fernet = Fernet::new(&user_decryption_key).unwrap();

    Ok(UserPublic {
        id: user.id,
        name: decrypt_field(&fernet, &user.name),
        login: user.login,
        email: decrypt_field(&fernet, &user.email),
        version_terms: decrypt_field(&fernet, &user.version_terms_agreement),
        permission_id: user.permission_id,
        disabled_since: match user.disabled_since {
            Some(dt) => Some(decrypt_field(&fernet, &dt.format("%Y-%m-%d").to_string())),
            None => None,
        },
    })
}
