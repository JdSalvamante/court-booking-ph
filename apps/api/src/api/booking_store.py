"""JSON-file-backed store for courts and bookings, seeded with PH sample courts.

The file lives at ``BOOKING_DB_PATH`` (default under /tmp), so the store works
in a container without a database. Persistence is per-instance: a redeploy or
restart resets bookings to the seed, which suits this first version.
"""

import json
import os
import re
import threading
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

DB_PATH = Path(os.environ.get("BOOKING_DB_PATH", "/tmp/court-booking-db.json"))
DATE_RE = re.compile(r"^\d{4}-\d{2}-\d{2}$")
TIME_RE = re.compile(r"^([01]\d|2[0-3]):00$")

SEED_COURTS: list[dict[str, Any]] = [
    {
        "id": "court-mnl-001",
        "name": "Pickle Republic BGC",
        "sport": "Pickleball",
        "city": "Taguig",
        "region": "Metro Manila",
        "pricePerHour": 850,
        "openHour": 7,
        "closeHour": 22,
    },
    {
        "id": "court-mnl-002",
        "name": "Manila Polo Club Paddle Courts",
        "sport": "Pickleball",
        "city": "Makati",
        "region": "Metro Manila",
        "pricePerHour": 700,
        "openHour": 8,
        "closeHour": 21,
    },
    {
        "id": "court-mnl-003",
        "name": "Ace Badminton & Sports Center",
        "sport": "Badminton",
        "city": "Quezon City",
        "region": "Metro Manila",
        "pricePerHour": 500,
        "openHour": 8,
        "closeHour": 22,
    },
    {
        "id": "court-ceb-001",
        "name": "Cebu Pickleball Hub",
        "sport": "Pickleball",
        "city": "Cebu City",
        "region": "Central Visayas",
        "pricePerHour": 450,
        "openHour": 7,
        "closeHour": 21,
    },
    {
        "id": "court-ceb-002",
        "name": "Sugbo Basketball Courts",
        "sport": "Basketball",
        "city": "Mandaue",
        "region": "Central Visayas",
        "pricePerHour": 600,
        "openHour": 8,
        "closeHour": 23,
    },
    {
        "id": "court-dvo-001",
        "name": "Davao Smash Volleyball Courts",
        "sport": "Volleyball",
        "city": "Davao City",
        "region": "Davao Region",
        "pricePerHour": 550,
        "openHour": 8,
        "closeHour": 22,
    },
]

_lock = threading.Lock()
_db: dict[str, Any] | None = None


def _load() -> dict[str, Any]:
    global _db
    if _db is not None:
        return _db
    with _lock:
        if _db is None:
            try:
                _db = json.loads(DB_PATH.read_text(encoding="utf-8"))
            except (OSError, ValueError):
                _db = {"courts": SEED_COURTS, "bookings": []}
            _db.setdefault("courts", SEED_COURTS)
            _db.setdefault("bookings", [])
    return _db


def _save() -> None:
    try:
        DB_PATH.parent.mkdir(parents=True, exist_ok=True)
        DB_PATH.write_text(json.dumps(_load(), indent=2), encoding="utf-8")
    except OSError:
        pass


def list_courts(sport: str | None = None, region: str | None = None) -> list[dict[str, Any]]:
    courts = _load()["courts"]
    if sport:
        courts = [c for c in courts if c["sport"].lower() == sport.lower()]
    if region:
        courts = [c for c in courts if c["region"].lower() == region.lower()]
    return courts


def get_court(court_id: str) -> dict[str, Any] | None:
    return next((c for c in _load()["courts"] if c["id"] == court_id), None)


def slot_times(court: dict[str, Any]) -> list[str]:
    return [f"{h:02d}:00" for h in range(court["openHour"], court["closeHour"])]


def slots_for(court: dict[str, Any], date: str) -> list[dict[str, Any]]:
    booked = {
        b["time"]
        for b in _load()["bookings"]
        if b["courtId"] == court["id"] and b["date"] == date
    }
    return [{"time": t, "available": t not in booked} for t in slot_times(court)]


class BookingConflict(Exception):
    pass


class InvalidSlot(Exception):
    pass


def create_booking(court_id: str, date: str, time: str, player_name: str, contact: str) -> dict[str, Any]:
    with _lock:
        court = get_court(court_id)
        if court is None:
            raise KeyError(court_id)
        if time not in slot_times(court):
            raise InvalidSlot(time)
        db = _load()
        if any(
            b["courtId"] == court_id and b["date"] == date and b["time"] == time
            for b in db["bookings"]
        ):
            raise BookingConflict(time)
        booking = {
            "id": str(uuid.uuid4()),
            "courtId": court_id,
            "date": date,
            "time": time,
            "playerName": player_name,
            "contact": contact,
            "createdAt": datetime.now(timezone.utc).isoformat(),
        }
        db["bookings"].append(booking)
        _save()
        return booking


def list_bookings(contact: str | None = None) -> list[dict[str, Any]]:
    db = _load()
    bookings = db["bookings"]
    if contact:
        bookings = [b for b in bookings if b["contact"] == contact]
    courts = {c["id"]: c for c in db["courts"]}
    return [{**b, "court": courts.get(b["courtId"])} for b in bookings]
