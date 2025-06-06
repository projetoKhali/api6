use base64::{engine::general_purpose, Engine as _};
use fernet::Fernet;

use actix_web::{web, HttpResponse};

use sea_orm::{ColumnTrait, EntityTrait, QueryFilter};
use thiserror::Error;

use crate::{
    entities::{
        entity_key as keys_entity, //
        external_client::Model as external_client_model,
        user::Model as user_model,
    },
    models::{
        EntityType, //
        ExternalClientPublic,
        UserPublic,
    },
    routes::common::{
        handle_server_error_body, //
        CustomError,
        ServerErrorType,
    },
};

pub enum GetKeyResult {
    Ok(String),
    Err(HttpResponse),
}

pub async fn get_entity_key(
    entity_id: i64,
    entity_type: EntityType,
    keys_client: &web::Data<crate::infra::server::DatabaseClientKeys>,
    config: &web::Data<crate::infra::types::Config>,
) -> GetKeyResult {
    let entity_key_result = keys_entity::Entity::find()
        .filter(keys_entity::Column::EntityId.eq(entity_id))
        .filter(keys_entity::Column::EntityType.eq(entity_type))
        .one(&keys_client.client)
        .await;

    match entity_key_result {
        Err(err) => GetKeyResult::Err(handle_server_error_body(
            "Database Error",
            err,
            &config,
            None,
        )),
        Ok(None) => GetKeyResult::Err(handle_server_error_body(
            "Database Error",
            CustomError::EntityKeyNotFound(entity_type, entity_id),
            &config,
            Some(ServerErrorType::NotFound),
        )),
        Ok(Some(entity_key)) => GetKeyResult::Ok(entity_key.key),
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

    Ok(UserPublic {
        id: user.id,
        name,
        login: user.login,
        email,
        version_terms,
        role_id: user.role_id,
        disabled_since: match user.disabled_since {
            Some(dt) => Some(dt.format("%Y-%m-%d").to_string()),
            None => None,
        },
    })
}

pub fn decrypt_database_external_client(
    external_client_decryption_key: &str,
    external_client: external_client_model,
) -> Result<ExternalClientPublic, CustomError> {
    let fernet = Fernet::new(&external_client_decryption_key).unwrap();

    let name = decrypt_field(&fernet, &external_client.name)
        .map_err(|err| CustomError::UnsuccessfulDecryption("name".to_string(), err))?;

    let login = decrypt_field(&fernet, &external_client.login)
        .map_err(|err| CustomError::UnsuccessfulDecryption("login".to_string(), err))?;

    Ok(ExternalClientPublic {
        id: external_client.id,
        name,
        login,
        created_at: external_client.created_at.format("%Y-%m-%d").to_string(),
        disabled_since: match external_client.disabled_since {
            Some(dt) => Some(dt.format("%Y-%m-%d").to_string()),
            None => None,
        },
    })
}
