# Court Booking PH 🇵🇭

A web system for booking sports courts (pickleball, badminton, basketball, volleyball, and more) in the Philippines.

## Features

- Browse courts with sport, location, and hourly rate in pesos
- Pick a date and see all hourly time slots for a court
- Available slots are shown in real time; booked slots are disabled
- Book a slot with your name and contact number/email
- Look up your bookings by contact

## Deployment (Railway)

The repo ships a `railway.json` that builds both packages and starts the Express server, which serves the frontend and API on one port. Railway provides `PORT` automatically.

1. Create a project at [railway.app](https://railway.app) → **Deploy from GitHub repo** → pick this repo
2. Railway reads `railway.json` and builds/starts the app
3. Generate a public domain: service → **Settings** → **Networking** → **Generate Domain**

For local development with hot reload, run the API (`npm --prefix server run dev`) and the Vite client (`npm --prefix client run dev`) separately; the client proxies `/api` to port 4000.

## Tech Stack

- **Client:** React 18 + Vite (`client/`)
- **API:** Node.js + Express (`server/`), serving the built frontend in production
- **Storage:** JSON file store (`server/data/db.json`, auto-seeded) — simple to run anywhere, easy to swap for a real database later

## Getting Started

Prerequisites: Node.js 18+

```bash
# 1. Install and build
npm --prefix server install
npm --prefix client install
npm --prefix client run build

# 2. Start the server (API + frontend on one port)
PORT=4000 npm --prefix server start
```

Open http://localhost:4000 — the Express server serves both the API (`/api/*`) and the built React frontend. The database seeds itself with PH sample courts on first start.

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
