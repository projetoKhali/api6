import os
from pymongo import ASCENDING, MongoClient
from bson.objectid import ObjectId

def mongo_connect():
    """Connect to MongoDB using environment variables."""
    mongo_uri = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
    db_name = os.getenv("MONGO_DB_NAME", "test_db")  # Default to test database for safety
    client = MongoClient(mongo_uri)
    return client[db_name]


def create_collections(db):
    collections = {
        "species": {
            "scientific_name": "",
            "common_name": "",
            "growth_time": {
                "unit_of_measure": "", # days, months, years
                "value": 0
            },
            "water_requirement": {
                "unit_of_measure": "", # liters, m³, mm³
                "value": 0.0
            }
        },
        "plots": {
            "area": {
                "unit_of_measure": "", # m², km², ha
                "value": 0.0
            },
            "coordinates": [0.0, 0.0],
            "city": "",
            "state": "",
            "country": ""
        },
        "climate": {
            "day": "YYYY-MM-DD",
            "temperature": {
                "min": 0.0,
                "med": 0.0,
                "max": 0.0,
                "unit_of_measure": "" # °C, °F
            },
            "humidity": {
                "unit_of_measure": "", # %, g/m³
                "value": 0.0
            },
            "wind": {
                "unit_of_measure": "", # km/h, m/s
                "value": 0.0
            },
            "rain": {
                "min": 0.0,
                "med": 0.0,
                "max": 0.0,
                "unit_of_measure": "" # mm, in
            },
            "rain_probability": {
                "unit_of_measure": "%",
                "value": 0.0
            }
        },
        "events": [
            {
                "species_id": ObjectId(),
                "plot_id": ObjectId(),
                "climate": {}, # Objeto do tipo climate
                "type": "planting",
                "planted_area": {
                    "unit_of_measure": "", # m², km², ha
                    "value": 0.0
                },
                "planted_quantity": {
                    "unit_of_measure": "", # units, kg, g
                    "value": 0.0
                },
                "irrigation": [
                    {
                        "unit_of_measure": "", # liters, mm
                        "quantity": 0.0
                    }
                ],
                "observations": ""
            },
            {
                "planting_id": ObjectId(),
                "species_id": ObjectId(),
                "plot_id": ObjectId(),
                "climate": {},
                "type": "maintenance",
                "dead_plants": {
                    "unit_of_measure": "", # units, kg, g
                    "value": 0
                },
                "average_growth": {
                    "unit_of_measure": "", # cm, m
                    "value": 0.0
                },
                "fertilizer": [
                    {
                        "unit_of_measure": "", # kg, g
                        "quantity": 0.0
                    }
                ],
                "observations": ""
            },
            {
                "planting_id": ObjectId(),
                "species_id": ObjectId(),
                "plot_id": ObjectId(),
                "climate": {},
                "type": "harvest",
                "price": 0.0,
                "harvested_quantity": [
                    {
                        "unit_of_measure": "", # units, kg, g
                        "quantity": 0.0
                    }
                ],
                "losses": [
                    {
                        "unit_of_measure": "", # units, kg, g
                        "quantity": 0.0
                    }
                ]
            }
        ]
    }

    for collection, _ in collections.items():
        if collection not in db.list_collection_names():
            db.create_collection(collection)
            print(f"Coleção '{collection}' criada.")
        else:
            print(f"Coleção '{collection}' já existe.")

    db.species.create_index([("scientific_name", ASCENDING)], unique=True)
    db.plots.create_index([("coordinates", ASCENDING)])  # Índice geoespacial
    db.climate.create_index([("day", ASCENDING)])
    db.events.create_index([
        ("plot_id", ASCENDING),
        ("species_id", ASCENDING),
        ("climate_id", ASCENDING),
    ])

    print("📌 Índices criados com sucesso!")


if __name__ == "__main__":
    create_collections(mongo_connect())
    print("✅ Banco de dados inicializado com sucesso!")
