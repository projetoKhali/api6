from src.mongo import initialize_mongo_database
from src.postgres import initialize_postgres_database

def initialize_databases():
    initialize_postgres_database()
    initialize_mongo_database()
