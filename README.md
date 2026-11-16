# Court Booking PH 🇵🇭

A web system for booking sports courts (pickleball, badminton, basketball, volleyball, and more) in the Philippines.

## Features

- Browse courts with sport, location, and hourly rate in pesos
- Pick a date and see all hourly time slots for a court
- Available slots are shown in real time; booked slots are disabled
- Book a slot with your name and contact number/email
- Look up your bookings by contact

## Tech Stack

- **Client:** React 18 + Vite (`client/`)
- **API:** Node.js + Express (`server/`)
- **Storage:** JSON file store (`server/data/db.json`) — simple to run anywhere, easy to swap for a real database later

## Getting Started

Prerequisites: Node.js 18+

```bash
# 1. Start the API (port 4000)
cd server
npm install
npm run seed        # loads PH sample courts
npm run dev

# 2. In a new terminal, start the client (port 5173)
cd client
npm install
npm run dev
```

Open http://localhost:5173 to use the app. The Vite dev server proxies `/api` requests to the backend.

## API Reference

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/courts` | List all courts (optional `?sport=` / `?region=` filters) |
| GET | `/api/courts/:id` | Get one court |
| GET | `/api/courts/:id/slots?date=YYYY-MM-DD` | Hourly slots with availability |
| POST | `/api/bookings` | Create a booking `{ courtId, date, time, playerName, contact }` |
| GET | `/api/bookings?contact=` | List bookings for a contact |

## Project Structure

```
server/
  src/index.js    Express app & routes
  src/db.js       JSON file data store
  src/seed.js     Seeds PH sample courts
client/
  src/App.jsx     UI: court list, slot picker, booking form
  src/api.js      API client helpers
```

## Roadmap Ideas

- Location filter by region/city
- Admin panel to add courts and manage schedules
- Online payments (GCash/Maya) and booking fees
- User accounts and email/SMS confirmation
