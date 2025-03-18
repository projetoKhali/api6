from pymongo import ASCENDING
from mongo_db import MongoDB

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
                    "description": "Nome científico da espécie"
                },
                "common_name": {
                    "bsonType": "string",
                    "description": "Nome popular da espécie"
                }
            }
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
                    "bsonType": "object",
                    "description": "Área da propriedade",
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
        db.create_collection("plots_collection", validator=plots_validator)
        print("Coleção 'plots' criada com validador.")
    except Exception as e:
        print(f"Erro ao criar ou atualizar a coleção 'plots': {e}")

def create_yield_collection(db):
    yield_validator = {
        "bsonType": "object",
        "required": ["crop", "crop_year", "season", "state", "area", "production", "annual_rainfall", "fertilizer", "pesticide", "yield"],
        "properties": {
            "crop": {
                "bsonType": "string",
                "description": "Nome da cultura cultivada"
            },
            "crop_year": {
                "bsonType": "string",
                "description": "Ano em que a safra foi cultivada"
            },
            "season": {
                "bsonType": "string",
                "enum": ["Spring", "Summer", "Autumn", "Winter"],
                "description": "Estação do ano"
            },
            "state": {
                "bsonType": "string",
                "description": "Estado"
            },
            "area": {
                "bsonType": "double",
                "description": "A área total de terra (em hectares) cultivada para a cultura específica"
            },
            "production": {
                "bsonType": "int",
                "description": "Quantidade de cultura produzida"
            },
            "annual_rainfall": {
                "bsonType": "double",
                "description": "A precipitação anual recebida na região de cultivo (em mm)"
            },
            "fertilizer": {
                "bsonType": "double",
                "description": "A quantidade total de fertilizante usada na cultura (em quilogramas)"
            },
            "pesticide": {
                "bsonType": "double",
                "description": "A quantidade total de pesticida usado na cultura (em quilogramas)"
            },
            "yield": {
                "bsonType": "double",
                "description": "The calculated crop yield (production per unit area)"
            }
        }
    }
    try:
        db.create_collection("yield_collection", validator=yield_validator)
        print("Coleção 'yield' criada com validador.")
    except Exception as e:
        print(f"Erro ao criar ou atualizar a coleção 'yield': {e}")

def create_indexes(db):
    try:
        db.species_collection.create_index([("scientific_name", ASCENDING)], unique=True)
        db.plots_collection.create_index([("area", ASCENDING)])
        db.yield_collection.create_index([("production", ASCENDING)])
        print("📌 Índices criados com sucesso!")
    except Exception as e:
        print(f"Erro ao criar índices: {e}")
def main():
    db = MongoDB.get_database("reforestation")
    if db is not None:
        create_species_collection(db)
        create_plots_collection(db)
        create_yield_collection(db)
        create_indexes(db)

if __name__ == "__main__":
    main()
