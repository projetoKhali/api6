use actix_web::{web, HttpResponse};

pub enum ServerErrorType {
    #[allow(dead_code)]
    NotFound,
    BadRequest,
    #[allow(dead_code)]
    Unauthorized,
    #[allow(dead_code)]
    Forbidden,
    #[allow(dead_code)]
    InternalServerError,
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
        Some(ServerErrorType::InternalServerError) => HttpResponse::InternalServerError(),
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
