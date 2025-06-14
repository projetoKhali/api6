use askama::Template;

#[derive(Template)]
#[template(path = "portability/authorization_button.html")]
pub struct LoginButtonTemplate {
    pub popup_url: String,
    pub logo_base64: String,
}

#[derive(Template)]
#[template(path = "portability/authorization_form.html")]
pub struct LoginFormTemplate {
    pub auth_url: String,
    pub client_name: String,
}
