from pydantic import BaseModel, Field
from typing import Optional


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
    # 'yield' is a reserved python keyword
    yield_: float = Field(..., alias="yield")


def create_yield_event(collection, event_data: dict):
    try:
        event = YieldEvent(**event_data)
        result = collection.insert_one(event.model_dump(by_alias=True))
        return str(result.inserted_id)
    except Exception as e:
        return {"error": str(e)}


def get_yield_events_filter(collection, filters: Optional[dict] = None):
    query = filters if filters else {}
    events = list(collection.find(query, {"_id": 0}))
    return events


def update_yield_event(collection, crop: str, crop_year: str, update_data: dict):
    try:
        update_data.pop("_id", None)
        validated_update = YieldEvent(**update_data).model_dump(by_alias=True)
        result = collection.update_one(
            {"crop": crop, "crop_year": crop_year}, {"$set": validated_update}
        )
        return {"modified_count": result.modified_count}
    except Exception as e:
        return {"error": str(e)}
