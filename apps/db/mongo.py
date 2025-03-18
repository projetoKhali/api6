import os
from dotenv import load_dotenv
from pymongo import ASCENDING, MongoClient


class MongoDB:
    _client = None

    @classmethod
    def get_client(cls):
        """Connect to MongoDB using environment variables."""
        if cls._client is not None:
            return

        load_dotenv()

        mongo_user = os.getenv("MONGO_USER", "mongodb")
        mongo_password = os.getenv("MONGO_PASSWORD", "secret")
        mongo_host = os.getenv("MONGO_HOST", "localhost")
        mongo_port = os.getenv("MONGO_PORT", "27017")
        mongo_db = os.getenv("MONGO_DB", "api6_mongo")

        mongo_url = f"mongodb://{mongo_user}:{mongo_password}@{mongo_host}:{mongo_port}/{mongo_db}"

        cls._client = MongoClient(mongo_url)
        return cls._client

    @classmethod
    def get_database(cls, db_name: str):
        client = cls.get_client()
        return client[db_name]

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
                "growth_time",
                "water_requirement",
                "unit_of_measurement_for_planting",
                "unit_of_measurement_for_harvest",
                "unit_of_measurement_for_loss"
            ],
            "properties": {
                "scientific_name": {
                    "bsonType": "string",
                    "description": "Nome científico da espécie"
                },
                "common_name": {
                    "bsonType": "string",
                    "description": "Nome popular da espécie"
                },
                "growth_time": {
                    "bsonType": "object",
                    "required": ["unit_of_measure", "value"],
                    "properties": {
                        "unit_of_measure": {
                            "bsonType": "string",
                            "description": "Unidade de medida (meses, anos)"
                        },
                        "value": {
                            "bsonType": "int",
                            "description": "Valor numérico do tempo de crescimento"
                        }
                    }
                },
                "water_requirement": {
                    "bsonType": "double",
                    "description": "Quantidade de água necessária para a espécie"
                },
                "unit_of_measurement_for_planting": {
                    "bsonType": "string",
                    "description": "Unidade de medida para plantio"
                },
                "unit_of_measurement_for_harvest": {
                    "bsonType": "string",
                    "description": "Unidade de medida para colheita"
                },
                "unit_of_measurement_for_loss": {
                    "bsonType": "string",
                    "description": "Unidade de medida para perdas"
                }
            }
        }
    }
    try:
        db.create_collection("species", validator=species_validator)
        print("Coleção 'species' criada com validador.")
    except Exception as e:
        print(f"Erro ao criar ou atualizar a coleção 'species': {e}")


def create_plots_collection(db):
    plots_validator = {
        "$jsonSchema": {
            "bsonType": "object",
            "required": ["area", "coordinates", "city", "state", "country"],
            "properties": {
                "area": {
                    "bsonType": "object",
                    "required": ["unit_of_measure", "value"],
                    "properties": {
                        "unit_of_measure": {
                            "bsonType": "string",
                            "description": "Unidade de medida (m², km², ha)"
                        },
                        "value": {
                            "bsonType": "double",
                            "description": "Valor numérico da área"
                        }
                    }
                },
                "coordinates": {
                    "bsonType": "array",
                    "minItems": 2,
                    "maxItems": 2,
                    "items": {
                        "bsonType": "double"
                    },
                    "description": "Coordenadas geográficas no formato [longitude, latitude]"
                },
                "city": {
                    "bsonType": "string",
                    "description": "Cidade da área"
                },
                "state": {
                    "bsonType": "string",
                    "description": "Estado da área"
                },
                "country": {
                    "bsonType": "string",
                    "description": "País da área"
                }
            }
        }
    }
    try:
        db.create_collection("plots", validator=plots_validator)
        print("Coleção 'plots' criada com validador.")
    except Exception as e:
        print(f"Erro ao criar ou atualizar a coleção 'plots': {e}")


def create_events_collection(db):
    climate_schema = {
        "bsonType": "object",
        "required": ["day", "temperature", "humidity", "wind", "rain", "rain_probability"],
        "properties": {
            "day": {
                "bsonType": "date",
                "description": "Data no formato ISODate"
            },
            "temperature": {
                "bsonType": "object",
                "required": ["min", "med", "max"],
                "properties": {
                    "min": {"bsonType": "double"},
                    "med": {"bsonType": "double"},
                    "max": {"bsonType": "double"}
                }
            },
            "humidity": {"bsonType": "double"},
            "wind": {"bsonType": "double"},
            "rain": {"bsonType": "double"},
            "rain_probability": {"bsonType": "double"}
        }
    }

    planting_schema = {
        "bsonType": "object",
        "required": ["species_id", "plot_id", "type", "climate", "planted_area", "planted_quantity", "observations"],
        "properties": {
            "species_id": {"bsonType": "objectId"},
            "plot_id": {"bsonType": "objectId"},
            "type": {"enum": ["planting"]},
            "climate": climate_schema,
            "planted_area": {
                "bsonType": "object",
                "required": ["unit_of_measure", "value"],
                "properties": {
                    "unit_of_measure": {"bsonType": "string"},
                    "value": {"bsonType": "double"}
                }
            },
            "planted_quantity": {"bsonType": "double"},
            "observations": {"bsonType": "string"}
        }
    }

    maintenance_schema = {
        "bsonType": "object",
        "required": ["planting_id", "species_id", "plot_id", "type", "climate", "dead_plants", "fertilizer", "pesticide", "observations"],
        "properties": {
            "planting_id": {"bsonType": "objectId"},
            "species_id": {"bsonType": "objectId"},
            "plot_id": {"bsonType": "objectId"},
            "type": {"enum": ["maintenance"]},
            "climate": climate_schema,
            "dead_plants": {"bsonType": "int"},
            "fertilizer": {"bsonType": "double"},
            "pesticide": {"bsonType": "double"},
            "observations": {"bsonType": "string"}
        }
    }

    harvest_schema = {
        "bsonType": "object",
        "required": ["planting_id", "species_id", "plot_id", "type", "climate", "price", "harvested_quantity", "losses", "observations"],
        "properties": {
            "planting_id": {"bsonType": "objectId"},
            "species_id": {"bsonType": "objectId"},
            "plot_id": {"bsonType": "objectId"},
            "type": {"enum": ["harvest"]},
            "climate": climate_schema,
            "price": {"bsonType": "double"},
            "harvested_quantity": {"bsonType": "double"},
            "losses": {"bsonType": "double"},
            "observations": {"bsonType": "string"}
        }
    }

    # Utilizando 'oneOf' para aceitar os três tipos de evento
    events_validator = {
        "$jsonSchema": {
            "bsonType": "object",
            "oneOf": [
                planting_schema,
                maintenance_schema,
                harvest_schema
            ]
        }
    }
    try:
        db.create_collection("events", validator=events_validator)
        print("Coleção 'events' criada com validador.")
    except Exception as e:
        print(f"Erro ao criar ou atualizar a coleção 'events': {e}")


def create_indexes(db):
    try:
        db.species.create_index([("scientific_name", ASCENDING)], unique=True)
        db.plots.create_index([("coordinates", ASCENDING)])
        db.events.create_index([("climate.day", ASCENDING)])
        print("📌 Índices criados com sucesso!")
    except Exception as e:
        print(f"Erro ao criar índices: {e}")


def main():
    db = MongoDB.get_database("reforestation")
    if db is not None:
        create_species_collection(db)
        create_plots_collection(db)
        create_events_collection(db)
        create_indexes(db)


if __name__ == "__main__":
    main()
