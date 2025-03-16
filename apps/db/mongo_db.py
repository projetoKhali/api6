import os
from pymongo import MongoClient

class MongoDB:
    _client = None

    @classmethod
    def get_client(cls):
        if cls._client is None:
            mongo_url = os.getenv("MONGO_URL", "mongodb://mongo:secret@localhost:27017/")
            cls._client = MongoClient(mongo_url)
        return cls._client

    @classmethod
    def get_database(cls, db_name: str):
        client = cls.get_client()
        return client[db_name]

# Uso:
# from mongo_db import MongoDB
# db = MongoDB.get_database("meu_banco")
