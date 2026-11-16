import { replaceDatabase } from "./db.js";

const courts = [
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

replaceDatabase({ courts, bookings: [] });

console.log(`Seeded ${courts.length} courts. Bookings reset.`);
