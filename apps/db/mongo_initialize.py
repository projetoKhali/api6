from pymongo import ASCENDING, MongoClient
from bson.objectid import ObjectId

def mongo_connect(database_name, url="mongodb://admin:password@localhost:27017/"):
    try:
        client = MongoClient(url)
        db = client[database_name]
        print("✅ Conectado ao MongoDB!", db.command("ping"))
        return db
    except Exception as e:
        print(f"Erro ao conectar ao MongoDB: {e}")
        return None

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
                "climate_id": ObjectId(),
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
                "climate_id": ObjectId(),
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
                "climate_id": ObjectId(),
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
    
    for collection, structure in collections.items():
        if (collection not in db.list_collection_names()):
            db.create_collection(collection)
            print(f"Coleção '{collection}' criada.")
        else:
            print(f"Coleção '{collection}' já existe.")
    
    db.species.create_index([("scientific_name", ASCENDING)], unique=True)
    db.plots.create_index([("coordinates", ASCENDING)])  # Índice geoespacial
    db.climate.create_index([("day", ASCENDING)])
    db.events.create_index([("plot_id", ASCENDING), ("species_id", ASCENDING), ("climate_id", ASCENDING)])

    print("📌 Índices criados com sucesso!")

def crud_operations(db):
    species_collection = db["species"]
    events_collection = db["events"]
    plots_collection = db["plots"]
    climate_collection = db["climate"]
    
    # Species
    new_species = {
        "scientific_name": "Solanum tuberosum",
        "common_name": "Potato",
        "growth_time": {
            "unit_of_measure": "days",
            "value": 90
        },
        "water_requirement": {
            "unit_of_measure": "mm",
            "value": 300.0
        }
    }
    species_id = species_collection.insert_one(new_species).inserted_id
    print(f"Nova espécie inserida com ID: {species_id}")
    # Read
    species = species_collection.find_one({"_id": species_id})
    print(f"Espécie encontrada: {species}")
    # Update
    updated_species = species_collection.update_one(
        {"_id": species_id},
        {"$set": {"common_name": "Potato (Updated)"}}
    )
    print(f"Espécies atualizadas: {updated_species.modified_count}")
    # Delete
    deleted_species = species_collection.delete_one({"_id": species_id})
    print(f"Espécies deletadas: {deleted_species.deleted_count}")


    new_plots = {
        "area": {
            "unit_of_measure": "km²",
            "value": 3.0
        },
        "coordinates": [55.3051, 130.5089],
        "city": "",
        "state": "",
        "country": ""
    }
    plot_id = plots_collection.insert_one(new_plots).inserted_id

    new_climate = [
        {
            "day": "2024-03-12",
            "temperature": {
                "unit_of_measure": "°C",
                "min": 22.0,
                "med": 28.0,
                "max": 30.0,
            },
            "humidity": {
                "unit_of_measure": "%",
                "med": 64.0,
            },
            "wind": {
                "unit_of_measure": "km/h",
                "med": 3.0,
            },
            "rain": {
                "unit_of_measure": "mm",
                "min": 0.0,
                "med": 0.0,
                "max": 0.0,
            },
            "rain_probability": {
                "unit_of_measure": "%",
                "value": 0.0
            }
        },
        {
            "day": "2024-03-13",
            "temperature": {
                "unit_of_measure": "°C",
                "min": 22.0,
                "med": 28.0,
                "max": 30.0,
            },
            "humidity": {
                "unit_of_measure": "%",
                "med": 64.0,
            },
            "wind": {
                "unit_of_measure": "km/h",
                "med": 3.0,
            },
            "rain": {
                "unit_of_measure": "mm",
                "min": 0.0,
                "med": 0.0,
                "max": 0.0,
            },
            "rain_probability": {
                "unit_of_measure": "%",
                "value": 0.0
            }
        }
    ]
    result = climate_collection.insert_many(new_climate)
    climate_ids = result.inserted_ids

    # Evento de plantio
    planting_event = {
        "species_id": ObjectId(species_id),
        "plot_id": ObjectId(plot_id),
        "climate_id": ObjectId(climate_ids[0]),
        "type": "planting",
        "planted_area": {
            "unit_of_measure": "m²",
            "value": 230.0
        },
        "planted_quantity": {
            "unit_of_measure": "units",
            "value": 400.0
        },
        "irrigation": [
            {
                "unit_of_measure": "liters",
                "quantity": 2000.0
            }
        ],
        "observations": "the solo is very fertile"
    }

    planting_id = events_collection.insert_one(planting_event).inserted_id

    new_events = [
        {
            "planting_id": ObjectId(planting_id),
            "species_id": ObjectId(species_id),
            "plot_id": ObjectId(plot_id),
            "climate_id": ObjectId(climate_ids[1]),
            "type": "maintenance",
            "dead_plants": {
                "unit_of_measure": "units",
                "value": 10.0
            },
            "average_growth": {
                "unit_of_measure": "cm",
                "value": 5.0
            },
            "fertilizer": [
                {
                    "unit_of_measure": "kg",
                    "quantity": 2.0
                }
            ],
            "observations": "the plants are growing well"
        },
        {
            "planting_id": ObjectId(planting_id),
            "species_id": ObjectId(species_id),
            "plot_id": ObjectId(plot_id),
            "climate_id": ObjectId(climate_ids[1]),
            "type": "harvest",
            "price": 2.0,
            "harvested_quantity": [
                {
                    "unit_of_measure": "units",
                    "quantity": 390.0
                }
            ],
            "losses": [
                {
                    "unit_of_measure": "units",
                    "quantity": 10.0
                }
            ]
        }
    ]

    for event in new_events:
        event_id = events_collection.insert_one(event).inserted_id
        print(f"Novo evento inserido com ID: {event_id}")

if __name__ == "__main__":
    db = mongo_connect("Agrodb")
    create_collections(db)
    crud_operations(db)
