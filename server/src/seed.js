import { replaceDatabase, SEED_COURTS } from "./db.js";

replaceDatabase({ courts: SEED_COURTS, bookings: [] });

console.log(`Seeded ${SEED_COURTS.length} courts. Bookings reset.`);
