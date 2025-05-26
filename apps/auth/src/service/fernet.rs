use base64::{engine::general_purpose, Engine as _};
use fernet::Fernet;

use actix_web::{web, HttpResponse};

use sea_orm::EntityTrait;
use thiserror::Error;

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
            None,
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
    general_purpose::STANDARD.encode(ciphertext)
}

#[derive(Debug, Error)]
pub enum DecryptionError {
    #[error("Unsuccessful decoding of value `{0}`: {1}")]
    UnsuccessfulDecoding(String, #[source] base64::DecodeError),
    #[error("Unsuccessful decryption of value `{0}`: {1}")]
    UnsuccessfulDecryption(String, #[source] fernet::DecryptionError),
    #[error("Unsuccessful utf8 conversion of decrypted value `{0}`: {1}")]
    UnsuccessfulUtf8Conversion(String, #[source] std::string::FromUtf8Error),
}

pub fn decrypt_field(f: &Fernet, value: &str) -> Result<String, DecryptionError> {
    let decoded = general_purpose::STANDARD
        .decode(value)
        .map_err(|err| DecryptionError::UnsuccessfulDecoding(value.to_string(), err))?;
    let decoded_utf8 = String::from_utf8(decoded)
        .map_err(|err| DecryptionError::UnsuccessfulUtf8Conversion(value.to_string(), err))?;
    let plaintext = f
        .decrypt(&decoded_utf8)
        .map_err(|err| DecryptionError::UnsuccessfulDecryption(value.to_string(), err))?;
    Ok(String::from_utf8(plaintext)
        .map_err(|err| DecryptionError::UnsuccessfulUtf8Conversion(value.to_string(), err))?)
}

pub fn decrypt_database_user(
    user_decryption_key: &str,
    user: user_model,
) -> Result<UserPublic, CustomError> {
    let fernet = Fernet::new(&user_decryption_key).unwrap();

    let name = decrypt_field(&fernet, &user.name)
        .map_err(|err| CustomError::UnsuccessfulDecryption("name".to_string(), err))?;

    let email = decrypt_field(&fernet, &user.email)
        .map_err(|err| CustomError::UnsuccessfulDecryption("email".to_string(), err))?;

    let version_terms = decrypt_field(&fernet, &user.version_terms_agreement).map_err(|err| {
        CustomError::UnsuccessfulDecryption("version_terms_agreement".to_string(), err)
    })?;

    let disabled_since = match user.disabled_since {
        Some(dt) => Some(
            decrypt_field(&fernet, &dt.format("%Y-%m-%d").to_string()).map_err(|err| {
                CustomError::UnsuccessfulDecryption("disabled_since".to_string(), err)
            })?,
        ),
        None => None,
    };

    Ok(UserPublic {
        id: user.id,
        name,
        login: user.login,
        email,
        version_terms,
        permission_id: user.permission_id,
        disabled_since,
    })
}
