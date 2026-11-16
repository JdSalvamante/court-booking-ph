from typing import Annotated

from fastapi import APIRouter, HTTPException, Query, status
from pydantic import BaseModel, Field

from api.booking_store import (
    BookingConflict,
    InvalidSlot,
    create_booking,
    get_court,
    list_bookings,
)

router = APIRouter()


class BookingRequest(BaseModel):
    courtId: str
    date: str = Field(pattern=r"^\d{4}-\d{2}-\d{2}$")
    time: str = Field(pattern=r"^([01]\d|2[0-3]):00$")
    playerName: str = Field(min_length=1)
    contact: str = Field(min_length=3)


class Booking(BaseModel):
    id: str
    courtId: str
    date: str
    time: str
    playerName: str
    contact: str
    createdAt: str


class Court(BaseModel):
    id: str
    name: str
    sport: str
    city: str
    region: str
    pricePerHour: int
    openHour: int
    closeHour: int


class CreatedBooking(BaseModel):
    booking: Booking
    court: Court


class BookingWithCourt(Booking):
    court: Court | None = None


@router.post("", operation_id="create_booking", summary="Book a court slot", status_code=status.HTTP_201_CREATED)
async def book(request: BookingRequest) -> CreatedBooking:
    court = get_court(request.courtId)
    if court is None:
        raise HTTPException(status_code=404, detail="Court not found")
    try:
        booking = create_booking(
            court_id=request.courtId,
            date=request.date,
            time=request.time,
            player_name=request.playerName,
            contact=request.contact,
        )
    except BookingConflict as exc:
        raise HTTPException(status_code=409, detail="That slot has already been booked") from exc
    except InvalidSlot as exc:
        raise HTTPException(status_code=400, detail="Time is outside the court's operating hours") from exc
    return CreatedBooking(booking=Booking(**booking), court=Court(**court))  # type: ignore[arg-type]


@router.get("", operation_id="list_bookings", summary="Bookings, optionally by contact")
async def bookings(
    contact: Annotated[str | None, Query(description="Filter by the contact used to book")] = None,
) -> list[BookingWithCourt]:
    return [BookingWithCourt(**b) for b in list_bookings(contact=contact)]  # type: ignore[arg-type]
