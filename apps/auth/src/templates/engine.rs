use askama::Template;

#[derive(Template)]
#[template(path = "portability/authorization_button.html")]
pub struct LoginButtonTemplate {
    pub popup_url: String,
}

#[derive(Template)]
#[template(path = "portability/authorization_form.html")]
pub struct LoginFormTemplate {
    pub client_name: String,
    pub client_id: i64,
}
