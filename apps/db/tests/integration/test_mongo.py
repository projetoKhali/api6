import os
import pytest
from pymongo import MongoClient, ASCENDING
from bson.objectid import ObjectId
from testcontainers.mongodb import MongoDbContainer

@pytest.fixture(scope="session")
def mongodb_container():
    mongo_image = os.getenv("TEST_MONGO_IMAGE", "mongo:6")
    mongo_port = os.getenv("TEST_MONGO_PORT", "27017")

    with MongoDbContainer(mongo_image).with_bind_ports(27017, int(mongo_port)) as mongo:
        os.environ["MONGODB_URI"] = mongo.get_connection_url()
        yield mongo

@pytest.fixture(scope="module")
def test_mongo(mongodb_container):
    """Connect to a test database and clean it before and after tests."""
    client = MongoClient(mongodb_container.get_connection_url())
    test_db = client["Agrodb_test"]

    yield test_db
    client.drop_database("Agrodb_test")

def create_collections(db):
    collections = ["species", "plots", "climate", "events"]

    for collection in collections:
        if collection not in db.list_collection_names():
            db.create_collection(collection)

    db.species.create_index([("scientific_name", ASCENDING)], unique=True)
    db.plots.create_index([("coordinates", ASCENDING)])
    db.climate.create_index([("day", ASCENDING)])
    db.events.create_index([("plot_id", ASCENDING), ("species_id", ASCENDING)])

@pytest.fixture(scope="module")
def setup_database(test_mongo):
    create_collections(test_mongo)

@pytest.mark.usefixtures("setup_database")
def test_species_crud(test_mongo):
    species_collection = test_mongo["species"]

    new_species = {
        "scientific_name": "Solanum tuberosum",
        "common_name": "Potato",
        "growth_time": {"unit_of_measure": "days", "value": 90},
        "water_requirement": {"unit_of_measure": "mm", "value": 300.0}
    }
    species_id = species_collection.insert_one(new_species).inserted_id

    found_species = species_collection.find_one({"_id": species_id})
    assert found_species is not None
    assert found_species["common_name"] == "Potato"

    species_collection.update_one({"_id": species_id}, {"$set": {"common_name": "Potato (Updated)"}})
    updated_species = species_collection.find_one({"_id": species_id})
    assert updated_species["common_name"] == "Potato (Updated)"

    deleted_count = species_collection.delete_one({"_id": species_id}).deleted_count
    assert deleted_count == 1

def test_plot_and_climate_crud(test_mongo):
    plots_collection = test_mongo["plots"]
    climate_collection = test_mongo["climate"]

    new_plot = {
        "area": {"unit_of_measure": "km²", "value": 3.0},
        "coordinates": [55.3051, 130.5089],
        "city": "TestCity",
        "state": "TestState",
        "country": "TestCountry"
    }
    plot_id = plots_collection.insert_one(new_plot).inserted_id
    assert plots_collection.find_one({"_id": plot_id}) is not None

    new_climate = {
        "day": "2024-03-12",
        "temperature": {"unit_of_measure": "°C", "min": 22.0, "med": 28.0, "max": 30.0},
        "humidity": {"unit_of_measure": "%", "value": 64.0},
        "wind": {"unit_of_measure": "km/h", "value": 3.0},
        "rain": {"unit_of_measure": "mm", "min": 0.0, "med": 0.0, "max": 0.0},
        "rain_probability": {"unit_of_measure": "%", "value": 0.0}
    }
    climate_id = climate_collection.insert_one(new_climate).inserted_id
    assert climate_collection.find_one({"_id": climate_id}) is not None

def test_event_creation(test_mongo):
    species_collection = test_mongo["species"]
    plots_collection = test_mongo["plots"]
    events_collection = test_mongo["events"]

    species_id = species_collection.insert_one({"scientific_name": "Solanum tuberosum", "common_name": "Potato"}).inserted_id
    plot_id = plots_collection.insert_one({"area": {"unit_of_measure": "km²", "value": 3.0}, "coordinates": [55.3051, 130.5089]}).inserted_id

    planting_event = {
        "species_id": ObjectId(species_id),
        "plot_id": ObjectId(plot_id),
        "type": "planting",
        "planted_area": {"unit_of_measure": "m²", "value": 230.0},
        "planted_quantity": {"unit_of_measure": "units", "value": 400.0},
        "irrigation": [{"unit_of_measure": "liters", "quantity": 2000.0}],
        "observations": "The soil is very fertile"
    }
    planting_id = events_collection.insert_one(planting_event).inserted_id
    assert events_collection.find_one({"_id": planting_id}) is not None
