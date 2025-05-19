use actix_web::{web, HttpResponse};

pub enum ErrorType {
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
    config: &web::Data<crate::infra::config::Config>,
    error_type_option: Option<ErrorType>,
) -> HttpResponse
where
    E: std::error::Error,
{
    let mut response = match error_type_option {
        Some(ErrorType::BadRequest) => HttpResponse::BadRequest(),
        Some(ErrorType::NotFound) => HttpResponse::NotFound(),
        Some(ErrorType::Unauthorized) => HttpResponse::Unauthorized(),
        Some(ErrorType::Forbidden) => HttpResponse::Forbidden(),
        Some(ErrorType::InternalServerError) => HttpResponse::InternalServerError(),
        None => HttpResponse::InternalServerError(),
    };

    response.body(handle_server_error_string(generic_text, err, config))
}

pub fn handle_server_error_string<E>(
    generic_text: &str,
    err: E,
    config: &web::Data<crate::infra::config::Config>,
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
