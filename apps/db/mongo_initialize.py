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
        "plantations": {
            "plot_id": "plot_id",
            "species_id": "species_id",
            "irrigation": "",
            "fertilization": "",
            "pest_control": ""
        }
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

if __name__ == "__main__":
    db = mongo_connect("Agrodb")
    create_collections(db)
    crud_operations(db)
