use actix_web::{web, HttpResponse};
use thiserror::Error;

use crate::service::fernet::DecryptionError;

#[derive(Debug, Error)]
pub enum CustomError {
    /// Missing decryption key for a given user ID
    #[error("Decryption key not found in `user_key` table for user ID {0}")]
    UserKeyNotFound(i64),
    #[error("Unsuccessful decryption of field `{0}`: {1}")]
    UnsuccessfulDecryption(String, #[source] DecryptionError),
}

pub enum ServerErrorType {
    #[allow(dead_code)]
    NotFound,
    BadRequest,
    #[allow(dead_code)]
    Unauthorized,
    #[allow(dead_code)]
    Forbidden,
}

pub fn handle_server_error_body<E>(
    generic_text: &str,
    err: E,
    config: &web::Data<crate::infra::types::Config>,
    error_type_option: Option<ServerErrorType>,
) -> HttpResponse
where
    E: std::error::Error,
{
    let mut response = match error_type_option {
        Some(ServerErrorType::BadRequest) => HttpResponse::BadRequest(),
        Some(ServerErrorType::NotFound) => HttpResponse::NotFound(),
        Some(ServerErrorType::Unauthorized) => HttpResponse::Unauthorized(),
        Some(ServerErrorType::Forbidden) => HttpResponse::Forbidden(),
        None => HttpResponse::InternalServerError(),
    };

    response.body(handle_server_error_string(generic_text, err, config))
}

pub fn handle_server_error_string<E>(
    generic_text: &str,
    err: E,
    config: &web::Data<crate::infra::types::Config>,
) -> String
where
    E: std::error::Error,
{
    format!(
        "{}{}",
        generic_text,
        match &config.dev_mode {
            true => {
                eprintln!("Error: {}: {:?}", generic_text, err);
                format!(": {:?}", err)
            }
            false => "".to_string(),
        }
    )
}
