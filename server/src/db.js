import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const DATA_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "data");
const DATA_FILE = path.join(DATA_DIR, "db.json");

const EMPTY_DB = { courts: [], bookings: [] };

export const SEED_COURTS = [
  {
    id: "court-mnl-001",
    name: "Pickle Republic BGC",
    sport: "Pickleball",
    city: "Taguig",
    region: "Metro Manila",
    pricePerHour: 850,
    openHour: 7,
    closeHour: 22,
  },
  {
    id: "court-mnl-002",
    name: "Manila Polo Club Paddle Courts",
    sport: "Pickleball",
    city: "Makati",
    region: "Metro Manila",
    pricePerHour: 700,
    openHour: 8,
    closeHour: 21,
  },
  {
    id: "court-mnl-003",
    name: "Ace Badminton & Sports Center",
    sport: "Badminton",
    city: "Quezon City",
    region: "Metro Manila",
    pricePerHour: 500,
    openHour: 8,
    closeHour: 22,
  },
  {
    id: "court-ceb-001",
    name: "Cebu Pickleball Hub",
    sport: "Pickleball",
    city: "Cebu City",
    region: "Central Visayas",
    pricePerHour: 450,
    openHour: 7,
    closeHour: 21,
  },
  {
    id: "court-ceb-002",
    name: "Sugbo Basketball Courts",
    sport: "Basketball",
    city: "Mandaue",
    region: "Central Visayas",
    pricePerHour: 600,
    openHour: 8,
    closeHour: 23,
  },
  {
    id: "court-dvo-001",
    name: "Davao Smash Volleyball Courts",
    sport: "Volleyball",
    city: "Davao City",
    region: "Davao Region",
    pricePerHour: 550,
    openHour: 8,
    closeHour: 22,
  },
];

function load() {
  try {
    const parsed = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
    if (!Array.isArray(parsed.courts) || parsed.courts.length === 0) {
      return { courts: structuredClone(SEED_COURTS), bookings: parsed.bookings ?? [] };
    }
    return parsed;
  } catch {
    return { courts: structuredClone(SEED_COURTS), bookings: [] };
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
