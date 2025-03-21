import pytest
import mongomock
from unittest.mock import patch
from app.models.yield_collection import (
    create_yield_event,
    get_yield_events_filter,
    update_yield_event,
)


@pytest.fixture
def mock_mongo():
    """Mock MongoDB connection using mongomock."""
    with patch(
        "app.models.yield_collection.yield_collection",
        mongomock.MongoClient().db.yield_collection,
    ):
        yield


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
    result = create_yield_event(sample_event)
    assert isinstance(result, str)  # Should return a MongoDB object ID

    events = get_yield_events_filter()
    assert len(events) == 1
    assert events[0]["crop"] == "Wheat"
    assert events[0]["crop_year"] == "2024"


def test_get_yield_events_filter(mock_mongo, sample_event):
    """Test retrieving yield events with filters."""
    create_yield_event(sample_event)

    events = get_yield_events_filter({"crop": "Wheat"})
    assert len(events) == 1
    assert events[0]["crop_year"] == "2024"

    no_events = get_yield_events_filter({"crop": "Corn"})
    assert len(no_events) == 0


def test_update_yield_event(mock_mongo, sample_event):
    """Test updating a yield event in MongoDB."""
    create_yield_event(sample_event)

    update_data = {"production": 5500, "fertilizer": 60.0}
    result = update_yield_event("Wheat", "2024", update_data)

    assert result["modified_count"] == 1

    updated_event = get_yield_events_filter({"crop": "Wheat"})[0]
    assert updated_event["production"] == 5500
    assert updated_event["fertilizer"] == 60.0
