use sea_orm::entity::prelude::*;

use crate::models::EntityType;

#[derive(Clone, Debug, DeriveEntityModel)]
#[sea_orm(table_name = "entity_key")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = true)]
    pub id: i64,
    pub entity_id: i64,
    pub entity_type: EntityType,
    pub key: String,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}
