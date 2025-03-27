from db.mongo import initialize_mongo_database
from db.postgres import initialize_postgres_database


def initialize_databases():
    initialize_postgres_database()
    initialize_mongo_database()
