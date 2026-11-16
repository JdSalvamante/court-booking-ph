from typing import Annotated

from fastapi import APIRouter, Query
from pydantic import BaseModel

from api.booking_store import get_court, list_courts, slots_for

router = APIRouter()


class Court(BaseModel):
    id: str
    name: str
    sport: str
    city: str
    region: str
    pricePerHour: int
    openHour: int
    closeHour: int


class Slot(BaseModel):
    time: str
    available: bool


class Slots(BaseModel):
    courtId: str
    date: str
    slots: list[Slot]


@router.get("", operation_id="list_courts", summary="List courts, optionally filtered")
async def courts(
    sport: Annotated[str | None, Query(description="Filter by sport, e.g. Pickleball")] = None,
    region: Annotated[str | None, Query(description="Filter by region, e.g. Metro Manila")] = None,
) -> list[Court]:
    return list_courts(sport=sport, region=region)


@router.get("/{court_id}", operation_id="get_court", summary="One court by id")
async def court(court_id: str) -> Court:
    found = get_court(court_id)
    if found is None:
        from fastapi import HTTPException

        raise HTTPException(status_code=404, detail="Court not found")
    return found  # type: ignore[return-value]


@router.get("/{court_id}/slots", operation_id="get_court_slots", summary="Hourly slots for a date")
async def court_slots(court_id: str, date: str) -> Slots:
    found = get_court(court_id)
    if found is None:
        from fastapi import HTTPException

        raise HTTPException(status_code=404, detail="Court not found")
    return Slots(courtId=court_id, date=date, slots=slots_for(found, date))  # type: ignore[arg-type]
