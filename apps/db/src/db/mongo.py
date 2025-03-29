import os
from dotenv import load_dotenv
from pymongo import MongoClient, ASCENDING

class MongoDB:
    _client = None

    @classmethod
    def get_client(cls):
        """Connect to MongoDB using environment variables."""
        if cls._client is not None:
            return cls._client

        load_dotenv()

        # Valores padrão - verifique se correspondem ao seu MongoDB
        mongo_user = os.getenv("MONGO_USER", "mongo")
        mongo_password = os.getenv("MONGO_PASSWORD", "secret")
        mongo_host = os.getenv("MONGO_HOST", "localhost")
        mongo_port = os.getenv("MONGO_PORT", "27017")
        auth_source = os.getenv("MONGO_AUTH_SOURCE", "admin")

        try:
            cls._client = MongoClient(
                host=f"mongodb://{mongo_user}:{mongo_password}@{mongo_host}:{mongo_port}/",
                authSource=auth_source,
                authMechanism="SCRAM-SHA-256",
                connectTimeoutMS=5000,
                serverSelectionTimeoutMS=5000
            )
            # Teste de conexão
            cls._client.admin.command('ping')
            print("[SUCCESS] Connected to MongoDB")
            return cls._client
        except Exception as e:
            print("[ERROR] MongoDB connection failed:", str(e))
            raise

    @classmethod
    def get_database(cls, db_name: str):
        """Get database reference"""
        if cls._client is None:
            cls.get_client()
        return cls._client[db_name]

# Uso:
# from mongo import MongoDB
# db = MongoDB.get_database("meu_banco")


def create_species_collection(db):
    species_validator = {
        "$jsonSchema": {
            "bsonType": "object",
            "required": [
                "scientific_name",
                "common_name",
            ],
            "properties": {
                "scientific_name": {
                    "bsonType": "string",
                    "description": "Nome científico da espécie",
                },
                "common_name": {
                    "bsonType": "string",
                    "description": "Nome popular da espécie",
                },
            },
        }
    }
    try:
        db.create_collection("species_collection", validator=species_validator)
        print("Coleção 'species' criada com validador.")
    except Exception as e:
        print(f"Erro ao criar ou atualizar a coleção 'species': {e}")


def create_plots_collection(db):
    plots_validator = {
        "$jsonSchema": {
            "bsonType": "object",
            "required": ["area", "state", "country"],
            "properties": {
                "area": {
                    "bsonType": "double",
                    "description": "Área da propriedade",
                },
                "state": {"bsonType": "string", "description": "Estado da área"},
                "country": {"bsonType": "string", "description": "País da área"},
            },
        }
    }
    try:
        db.create_collection("plots_collection", validator=plots_validator)
        print("Coleção 'plots' criada com validador.")
    except Exception as e:
        print(f"Erro ao criar ou atualizar a coleção 'plots': {e}")


def create_yield_collection(db):
    yield_validator = {
        "$jsonSchema": {
            "bsonType": "object",
            "required": [
                "crop",
                "crop_year",
                "season",
                "state",
                "area",
                "production",
                "annual_rainfall",
                "fertilizer",
                "pesticide",
                "yield",
            ],
            "properties": {
                "crop": {
                    "bsonType": "string",
                    "description": "Nome da cultura cultivada",
                },
                "crop_year": {
                    "bsonType": "int",
                    "description": "Ano em que a safra foi cultivada",
                },
                "season": {
                    "bsonType": "string",
                    "enum": ["Whole Year", "Spring", "Autumn", "Summer", "Winter"],
                    "description": "Estação do ano",
                },
                "state": {"bsonType": "string", "description": "Estado"},
                "area": {
                    "bsonType": "double",
                    "description": "A área total de terra (em hectares) cultivada para a cultura específica",
                },
                "production": {
                    "bsonType": "number",
                    "description": "Quantidade de cultura produzida",
                },
                "annual_rainfall": {
                    "bsonType": "double",
                    "description": "A precipitação anual recebida na região de cultivo (em mm)",
                },
                "fertilizer": {
                    "bsonType": "double",
                    "description": "A quantidade total de fertilizante usada na cultura (em quilogramas)",
                },
                "pesticide": {
                    "bsonType": "double",
                    "description": "A quantidade total de pesticida usado na cultura (em quilogramas)",
                },
                "yield": {
                    "bsonType": "double",
                    "description": "The calculated crop yield (production per unit area)",
                },
            },
        }
    }
    try:
        db.create_collection("yield_collection", validator=yield_validator)
        print("Coleção 'yield' criada com validador.")
    except Exception as e:
        print(f"Erro ao criar ou atualizar a coleção 'yield': {e}")


def create_indexes(db):
    try:
        db.species_collection.create_index(
            [("scientific_name", ASCENDING)], unique=True
        )
        db.plots_collection.create_index([("area", ASCENDING)])
        db.yield_collection.create_index([("production", ASCENDING)])
        print("📌 Índices criados com sucesso!")
    except Exception as e:
        print(f"Erro ao criar índices: {e}")


def restart_collections(db):
    db.species_collection.drop()
    db.plots_collection.drop()
    db.yield_collection.drop()
    create_species_collection(db)
    create_plots_collection(db)
    create_yield_collection(db)
    create_indexes(db)


def initialize_mongo_database():
    db = MongoDB.get_database("api6_mongo")
    if db is None:
        print("Erro ao conectar ao banco de dados.")
        return
    create_species_collection(db)
    create_plots_collection(db)
    create_yield_collection(db)
    create_indexes(db)
    # restart_collections(db)
