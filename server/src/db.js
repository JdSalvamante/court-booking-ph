import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const DATA_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "data");
const DATA_FILE = path.join(DATA_DIR, "db.json");

const EMPTY_DB = { courts: [], bookings: [] };

function load() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
  } catch {
    return structuredClone(EMPTY_DB);
  }
}

function save(db) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2));
}

let db = load();

export function getCourts() {
  return db.courts;
}

export function getCourt(id) {
  return db.courts.find((c) => c.id === id) ?? null;
}

export function getBookings({ courtId, date } = {}) {
  return db.bookings.filter(
    (b) =>
      (!courtId || b.courtId === courtId) && (!date || b.date === date)
  );
}

export function getBookingsByContact(contact) {
  return db.bookings.filter((b) => b.contact === contact);
}

export function createBooking({ courtId, date, time, playerName, contact }) {
  const conflict = db.bookings.some(
    (b) => b.courtId === courtId && b.date === date && b.time === time
  );
  if (conflict) return { error: "conflict" };

  const booking = {
    id: crypto.randomUUID(),
    courtId,
    date,
    time,
    playerName,
    contact,
    createdAt: new Date().toISOString(),
  };
  db.bookings.push(booking);
  save(db);
  return { booking };
}

export function replaceDatabase(nextDb) {
  db = nextDb;
  save(db);
}
