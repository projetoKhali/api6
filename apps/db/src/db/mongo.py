import os
from dotenv import load_dotenv
from pymongo import MongoClient, ASCENDING

class MongoDB:
    _client = None

    @classmethod
    def connect(cls):
        """Connect to MongoDB using environment variables."""
        if cls._client is not None:
            return cls._client

        load_dotenv()

        mongo_user = os.getenv("DB_MONGO_USER", "mongo")
        mongo_password = os.getenv("DB_MONGO_PASS", "secret")
        mongo_host = os.getenv("DB_MONGO_HOST", "localhost")
        mongo_port = os.getenv("DB_MONGO_PORT", "27017")
        mongo_db = os.getenv("DB_MONGO_NAME", "api6_mongo")

        mongo_url = f"mongodb://{mongo_user}:{mongo_password}@{mongo_host}:{mongo_port}/{mongo_db}?authSource=admin"

        cls._client = MongoClient(mongo_url)[mongo_db]
        return cls._client

    @classmethod
    def test(cls):
        """Test the connection to MongoDB."""
        db = cls.connect()
        db.command("ping")

# Uso:
# from mongo import MongoDB
# db = MongoDB.connect()


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
        raise Exception(
            f"Erro ao criar ou atualizar a coleção 'species': {e}") from e


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
        raise Exception(
            f"Erro ao criar ou atualizar a coleção 'plots': {e}") from e


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
        raise Exception(
            f"Erro ao criar ou atualizar a coleção 'yield': {e}") from e

def create_terms_of_use_collection(db):
    terms_validator = {
        "$jsonSchema": {
            "bsonType": "object",
            "required": ["text", "status", "topics"],
            "properties": {
                "text": {
                    "bsonType": "string",
                    "description": "Texto completo dos termos de uso",
                },
                "status": {
                    "bsonType": "string",
                    "enum": ["ativo", "inativo"],
                    "description": "Status do termo de uso",
                },
                "version": {
                    "bsonType": "string",
                    "description": "Versão do termo de uso",
                },
                    },
                "topics": {
                    "bsonType": "array",
                    "description": "Lista de tópicos incluídos nos termos",
                    "items": {
                        "bsonType": "object",
                        "required": ["description", "status", "required"],
                        "properties": {
                            "description": {
                                "bsonType": "string",
                                "description": "Descrição do tópico",
                            },
                            "status": {
                                "bsonType": "string",
                                "enum": ["ativo", "inativo"],
                                "description": "Status do tópico",
                            },
                            "required": {
                                "bsonType": "bool",
                                "description": "Se o tópico é obrigatório",
                            },
                        },
                    },
                },
            },
        }
    try:
        db.create_collection("terms_of_use_collection", validator=terms_validator)
        print("Coleção 'terms_of_use_collection' criada com validador.")
    except Exception as e:
        raise Exception(
            f"Erro ao criar a coleção 'terms_of_use_collection': {e}"
        ) from e

def create_user_acceptance_collection(db):
    acceptance_validator = {
        "$jsonSchema": {
            "bsonType": "object",
            "required": ["user_id", "topics"],
            "properties": {
                "user_id": {
                    "bsonType": "string",
                    "description": "Identificador do usuário",
                },
                "topics": {
                    "bsonType": "array",
                    "description": "Lista de tópicos aceitos pelo usuário",
                    "items": {
                        "bsonType": "object",
                        "required": ["description", "status", "accepted"],
                        "properties": {
                            "description": {
                                "bsonType": "string",
                                "description": "Descrição do tópico",
                            },
                            "status": {
                                "bsonType": "string",
                                "enum": ["ativo", "inativo"],
                                "description": "Status do tópico",
                            },
                            "accepted": {
                                "bsonType": "bool",
                                "description": "Se o usuário aceitou o tópico",
                            },
                        },
                    },
                },
            },
        }
    }
    try:
        db.create_collection("user_acceptance_collection", validator=acceptance_validator)
        print("Coleção 'user_acceptance_collection' criada com validador.")
    except Exception as e:
        raise Exception(
            f"Erro ao criar a coleção 'user_acceptance_collection': {e}"
        ) from e


def create_indexes(db):
    try:
        db.species_collection.create_index(
            [("scientific_name", ASCENDING)], unique=True
        )
        db.plots_collection.create_index([("area", ASCENDING)])
        db.yield_collection.create_index([("production", ASCENDING)])
        print("📌 Índices criados com sucesso!")
    except Exception as e:
        raise Exception(f"Erro ao criar índices: {e}") from e


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
    create_terms_of_use_collection(db)
    create_user_acceptance_collection(db)
    create_indexes(db)

