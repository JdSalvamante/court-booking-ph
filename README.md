# Court Booking PH 🇵🇭

A web system for booking sports courts (pickleball, badminton, basketball, volleyball, and more) in the Philippines.

## Features

- Browse courts with sport, location, and hourly rate in pesos
- Pick a date and see all hourly time slots for a court
- Available slots are shown in real time; booked slots are disabled
- Book a slot with your name and contact number/email
- Look up your bookings by contact

## Tech Stack

A Mistral App monorepo:

- **Web** (`apps/web`): TanStack Start (React) with TanStack Query — court list, slot picker, booking form, my-bookings lookup
- **API** (`apps/api`): FastAPI with a JSON-file store and per-slot double-booking prevention (409 on conflicts)
- **Seed data**: 6 PH courts — pickleball in Taguig/Makati/Cebu, badminton in Quezon City, basketball in Mandaue, volleyball in Davao

## Development

Prerequisites: [Bun](https://bun.sh), [uv](https://docs.astral.sh/uv/), and the [Mistral CLI](https://docs.mistral.ai/studio/mistral-cli).

```bash
bun install            # or: mistral apps install
cp .env.example .env   # then fill in MISTRAL_API_KEY
mistral apps dev       # API on :3000, web on :3001, behind a local gateway
```

Checks and tests:

```bash
bun run check   # build + typecheck + generated API client drift gate
bun run test
```

## API

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/courts` | List courts (optional `?sport=` / `?region=` filters) |
| GET | `/api/courts/{court_id}` | One court |
| GET | `/api/courts/{court_id}/slots?date=YYYY-MM-DD` | Hourly slots with availability |
| POST | `/api/bookings` | Create a booking `{ courtId, date, time, playerName, contact }` |
| GET | `/api/bookings?contact=` | List bookings for a contact |

The typed web client in `apps/web/src/api/generated` is generated from the API's OpenAPI spec (`tools/gen-types.sh`).

## Deploy

```bash
mistral apps deploy
```

> Note: bookings are stored in a JSON file inside the container, so they reset when the app redeploys. Swap `apps/api/src/api/booking_store.py` for a database when you need durable bookings.
