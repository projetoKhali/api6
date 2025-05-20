from db.mongo import initialize_mongo_database
from db.postgres import initialize_postgres_database
from db.pg_keys import initialize_keys_database


def initialize_databases():
    initialize_postgres_database()
    initialize_mongo_database()
    initialize_keys_database()
