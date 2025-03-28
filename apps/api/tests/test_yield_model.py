from unittest.mock import MagicMock, patch
import pytest
from mongomock import MongoClient
from api.models.yield_model import (
    create_yield_event,
    get_yield_events_filter,
    update_yield_event,
)
from db.mongo import MongoDB, restart_collections


@pytest.fixture
def mock_mongo():
    client = MongoClient()
    db = client['test_db']
    restart_collections(db)
    yield db


@pytest.fixture(autouse=True)
def patch_get_client(mock_mongo):
    with patch.object(MongoDB, "get_client", return_value=mock_mongo):
        yield


@pytest.fixture(autouse=True)
def yield_collection(mock_mongo):
    return mock_mongo['yield_collection']


@pytest.fixture
def sample_event():
    return {
        "crop": "Wheat",
        "crop_year": "2024",
        "season": "Winter",
        "state": "California",
        "area": 100.5,
        "production": 5000,
        "annual_rainfall": 800.2,
        "fertilizer": 50.5,
        "pesticide": 10.3,
        "yield": 49.75,
    }


def test_create_yield_event(yield_collection, sample_event):
    yield_collection.insert_one = MagicMock(return_value=MagicMock(inserted_id="123"))
    result = create_yield_event(yield_collection, sample_event)
    assert result is not None
    yield_collection.insert_one.assert_called_once()


def test_get_yield_events_filter(yield_collection, sample_event):
    yield_collection.find = MagicMock(return_value=[sample_event])
    result = get_yield_events_filter(yield_collection)
    assert result == [sample_event]
    yield_collection.find.assert_called_once()


def test_update_yield_event(yield_collection, sample_event):
    update_result = MagicMock()
    update_result.modified_count = 1
    yield_collection.update_one = MagicMock(return_value=update_result)
    update_data = sample_event.copy()
    update_data["production"] = 6000
    result = update_yield_event(yield_collection, "Wheat", "2024", update_data)
    assert result["modified_count"] == 1
    yield_collection.update_one.assert_called_once()

