import express from "express";
import cors from "cors";
import {
  getCourts,
  getCourt,
  getBookings,
  getBookingsByContact,
  createBooking,
} from "./db.js";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):00$/;

function slotTimes(court) {
  const times = [];
  for (let h = court.openHour; h < court.closeHour; h++) {
    times.push(`${String(h).padStart(2, "0")}:00`);
  }
  return times;
}

app.get("/api/courts", (req, res) => {
  const { sport, region } = req.query;
  let courts = getCourts();
  if (sport) courts = courts.filter((c) => c.sport.toLowerCase() === String(sport).toLowerCase());
  if (region) courts = courts.filter((c) => c.region.toLowerCase() === String(region).toLowerCase());
  res.json(courts);
});

app.get("/api/courts/:id", (req, res) => {
  const court = getCourt(req.params.id);
  if (!court) return res.status(404).json({ error: "Court not found" });
  res.json(court);
});

app.get("/api/courts/:id/slots", (req, res) => {
  const court = getCourt(req.params.id);
  if (!court) return res.status(404).json({ error: "Court not found" });

  const { date } = req.query;
  if (!date || !DATE_RE.test(date)) {
    return res.status(400).json({ error: "date query param is required (YYYY-MM-DD)" });
  }

  const bookedTimes = new Set(
    getBookings({ courtId: court.id, date }).map((b) => b.time)
  );
  const slots = slotTimes(court).map((time) => ({
    time,
    available: !bookedTimes.has(time),
  }));
  res.json({ courtId: court.id, date, slots });
});

app.post("/api/bookings", (req, res) => {
  const { courtId, date, time, playerName, contact } = req.body ?? {};

  if (!courtId || !date || !time || !playerName || !contact) {
    return res.status(400).json({
      error: "courtId, date, time, playerName, and contact are required",
    });
  }
  if (!DATE_RE.test(date) || !TIME_RE.test(time)) {
    return res.status(400).json({ error: "date must be YYYY-MM-DD and time must be HH:00" });
  }

  const court = getCourt(courtId);
  if (!court) return res.status(404).json({ error: "Court not found" });

  if (!slotTimes(court).includes(time)) {
    return res.status(400).json({ error: "Time is outside the court's operating hours" });
  }

  const result = createBooking({ courtId, date, time, playerName, contact });
  if (result.error === "conflict") {
    return res.status(409).json({ error: "That slot has already been booked" });
  }

  res.status(201).json({ booking: result.booking, court });
});

app.get("/api/bookings", (req, res) => {
  const { contact } = req.query;
  if (contact) {
    const courts = getCourts();
    const bookings = getBookingsByContact(contact).map((b) => ({
      ...b,
      court: courts.find((c) => c.id === b.courtId) ?? null,
    }));
    return res.json(bookings);
  }
  res.json(getBookings());
});

app.listen(PORT, () => {
  console.log(`Court booking API listening on http://localhost:${PORT}`);
});
