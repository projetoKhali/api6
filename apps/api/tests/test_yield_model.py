import pytest
from unittest.mock import MagicMock, patch
from api.models.yield_model import (
    create_yield_event,
    get_yield_events_filter,
    update_yield_event,
)

from db.mongo import MongoDB  # Adjust the import based on your structure


@patch.object(MongoDB, "get_client")
def test_create_yield_event(mock_get_client, mock_mongo, sample_event):
    """Test creating a yield event in MongoDB."""

    mock_client = MagicMock()
    mock_db = MagicMock()
    mock_collection = MagicMock()

    mock_client.__getitem__.return_value = mock_db
    mock_db.__getitem__.return_value = mock_collection
    mock_mongo.insert_one.return_value.inserted_id = "mock_id"

    mock_get_client.return_value = mock_client

    result = create_yield_event(sample_event)

    assert result == "mock_id"


@pytest.fixture
def sample_event():
    """Returns a sample yield event."""
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


def test_create_yield_event(mock_mongo, sample_event):
    """Test creating a yield event in MongoDB."""
    mock_mongo.insert_one.return_value.inserted_id = "mock_id"
    result = create_yield_event(sample_event)
    assert result == "mock_id"
    mock_mongo.insert_one.assert_called_once()


def test_get_yield_events_filter(mock_mongo, sample_event):
    """Test retrieving yield events with filters."""
    mock_mongo.find.return_value = [sample_event]
    result = get_yield_events_filter()
    assert result == [sample_event]
    mock_mongo.find.assert_called_once()


def test_update_yield_event(mock_mongo, sample_event):
    """Test updating a yield event in MongoDB."""
    mock_mongo.update_one.return_value.modified_count = 1
    update_data = sample_event.copy()
    update_data["production"] = 6000
    result = update_yield_event("Wheat", "2024", update_data)
    assert result["modified_count"] == 1
    mock_mongo.update_one.assert_called_once()
