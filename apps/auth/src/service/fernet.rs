use std::num::ParseIntError;

use fernet::Fernet;

use crate::{
    entities::user::Model as user_model, //
    models::UserPublic,
};

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
        permission_id: decrypt_field(&fernet, &user.permission_id.to_string()).parse()?,
        disabled_since: match user.disabled_since {
            Some(dt) => Some(decrypt_field(&fernet, &dt.format("%Y-%m-%d").to_string())),
            None => None,
        },
    })
}
