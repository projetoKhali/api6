from pymongo import MongoClient

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
            "growth_time": "",
            "water_requirement": ""
        },
        "plots": {
            "area": 0.0,
            "coordinates": [0.0, 0.0],
            "city": "",
            "state": "",
            "country": ""
        },
        "climate": {
            "day": "YYYY-MM-DD",
            "temperature_min_med_max": [0.0, 0.0, 0.0],
            "humidity_min_med_max": [0, 0, 0],
            "wind_min_med_max": [0, 0, 0],
            "rain_min_med_max": [0, 0, 0],
            "rain_probability": 0
        },
        "events": [
            {
                "type": "planting",
                "date": "YYYY-MM-DD",
                "planted_area": 100.0,
                "planted_quantity": 500,
                "irrigation": "drip"
            },
            {
                "type": "maintenance",
                "date": "YYYY-MM-DD",
                "dead_plants": 10,
                "average_growth": 0.5,
                "observations": "need for fertilization"
            },
            {
                "type": "harvest",
                "date": "YYYY-MM-DD",
                "harvested_quantity": 450,
                "losses": 50,
                "price": 2.5
            }
        ]
    }
    
    for collection, structure in collections.items():
        if (collection not in db.list_collection_names()):
            db.create_collection(collection)
            db[collection].insert_one(structure)
            print(f"Coleção '{collection}' criada com estrutura padrão.")
        else:
            print(f"Coleção '{collection}' já existe.")

def crud_operations(db):
    species_collection = db["species"]
    events_collection = db["events"]
    plots_collection = db["plots"]
    climate_collection = db["climate"]
    
    # Create
    new_species = {
        "scientific_name": "Solanum lycopersicum",
        "common_name": "Tomato",
        "growth_time": "60-80 days",
        "water_requirement": "Moderate"
    }
    species_id = species_collection.insert_one(new_species).inserted_id
    print(f"Nova espécie inserida com ID: {species_id}")

    # Read
    species = species_collection.find_one({"_id": species_id})
    print(f"Espécie encontrada: {species}")

    # Update
    updated_species = species_collection.update_one(
        {"_id": species_id},
        {"$set": {"common_name": "Tomato (Updated)"}}
    )
    print(f"Espécies atualizadas: {updated_species.modified_count}")

    # Delete
    deleted_species = species_collection.delete_one({"_id": species_id})
    print(f"Espécies deletadas: {deleted_species.deleted_count}")

    new_plots = {
        "area": 100.0,
        "coordinates": [-22.9035, -43.2096],
        "city": "Rio de Janeiro",
        "state": "RJ",
    }    
    plot_id = plots_collection.insert_one(new_plots).inserted_id

    new_climate = [
        {
            "day": "2023-10-01",
            "temperature_min_med_max": [15.0, 20.0, 25.0],
            "humidity_min_med_max": [60, 70, 80],
            "wind_min_med_max": [0, 5, 10],
            "rain_min_med_max": [0, 0, 0],
            "rain_probability": 0
        },
        {
            "day": "2023-10-15",
            "temperature_min_med_max": [16.0, 21.0, 26.0],
            "humidity_min_med_max": [65, 75, 85],
            "wind_min_med_max": [1, 6, 11],
            "rain_min_med_max": [0, 0, 0],
            "rain_probability": 20
        }
    ]
    result = climate_collection.insert_many(new_climate)
    climate_ids = result.inserted_ids

    print(climate_ids)

    # Insert examples in events collection
    new_events = [
        {
            "type": "planting",
            "species_id": species_id,
            "date": "2023-10-01",
            "planted_area": 150.0,
            "planted_quantity": 600,
            "irrigation": "sprinkler",
            "climate_id": climate_ids[0]
        },
        {
            "type": "maintenance",
            "species_id": species_id,
            "date": "2023-10-15",
            "dead_plants": 5,
            "average_growth": 0.6,
            "observations": "pest control needed",
            "climate_id": climate_ids[1]
        },
        {
            "type": "harvest",
            "plots": plot_id,
            "date": "2023-12-01",
            "harvested_quantity": 500,
            "losses": 30,
            "price": 3.0
        }
    ]
    
    for event in new_events:
        event_id = events_collection.insert_one(event).inserted_id
        print(f"Novo evento inserido com ID: {event_id}")

if __name__ == "__main__":
    db = mongo_connect("Agrodb")
    create_collections(db)
    crud_operations(db)
