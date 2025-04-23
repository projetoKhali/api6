use std::env;

pub fn jwt_secret() -> String {
    env::var("JWT_SECRET").expect("JWT_SECRET must be set")
}
