from pymongo import MongoClient

def mongo_connect(database_name, url="mongodb://admin:password@localhost:27017/"): # para encontrar o IP de conexão do MongoDB, execute o comando 'docker inspect mongodb'
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
            "coordinates": [0.0, 0.0], # [latitude, longitude]
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
        if collection not in db.list_collection_names():
            db.create_collection(collection)
            db[collection].insert_one(structure)
            print(f"Coleção '{collection}' criada com estrutura padrão.")
        else:
            print(f"Coleção '{collection}' já existe.")

if __name__ == "__main__":
    db = mongo_connect("Agrodb")
    create_collections(db)
