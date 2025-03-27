from pydantic import BaseModel, Field
from typing import Optional
from db.mongo import MongoDB


class YieldEvent(BaseModel):
    crop: str
    crop_year: str
    season: str
    state: str
    area: float
    production: int
    annual_rainfall: float
    fertilizer: float
    pesticide: float
    yield_: float = Field(..., alias="yield")  # 'yield' is a reserved Python keyword


def get_yield_collection():
    db = MongoDB.get_database("api6_mongo")
    return db["yield_collection"]


def create_yield_event(event_data: dict):
    try:
        event = YieldEvent(**event_data)  # Validate input data
        result = get_yield_collection().insert_one(event.model_dump(by_alias=True))
        return str(result.inserted_id)
    except Exception as e:
        return {"error": str(e)}


def get_yield_events_filter(filters: Optional[dict] = None):
    query = filters if filters else {}
    events = list(
        get_yield_collection().find(query, {"_id": 0})
    )  # Exclude MongoDB ObjectId
    return events


def update_yield_event(crop: str, crop_year: str, update_data: dict):
    try:
        update_data.pop("_id", None)  # Prevent modifying MongoDB ObjectId
        validated_update = YieldEvent(**update_data).model_dump(
            by_alias=True
        )  # Validate update
        result = get_yield_collection().update_one(
            {"crop": crop, "crop_year": crop_year}, {"$set": validated_update}
        )
        return {"modified_count": result.modified_count}
    except Exception as e:
        return {"error": str(e)}
