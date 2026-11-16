import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { BookingNav } from "../booking/Nav";
import { fetchBookings } from "../booking/api";
import "../booking/styles.css";

const MyBookingsPage = () => {
  const [contact, setContact] = useState("");
  const [search, setSearch] = useState("");

  const { data: bookings, isPending, error } = useQuery({
    queryKey: ["bookings", search],
    queryFn: () => fetchBookings(search),
    enabled: search !== "",
  });

  return (
    <main className="booking-app">
      <header className="booking-header">
        <h1>Court Booking PH 🇵🇭</h1>
        <BookingNav />
      </header>

      <h2>My bookings</h2>
      <form
        className="inline-form"
        onSubmit={(event) => {
          event.preventDefault();
          setSearch(contact);
        }}
      >
        <input
          required
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          placeholder="Enter your mobile or email"
        />
        <button type="submit" className="primary-button">
          Search
        </button>
      </form>

      {error ? <p className="error-text">{error.message}</p> : null}
      {search && isPending ? <p className="muted">Searching…</p> : null}
      {bookings && bookings.length === 0 ? <p className="muted">No bookings found for that contact.</p> : null}

      {bookings?.map((booking) => (
        <div key={booking.id} className="booking-row">
          <h3>{booking.court?.name ?? booking.courtId}</h3>
          <p>
            {booking.date} at {booking.time} · {booking.playerName}
          </p>
        </div>
      ))}
    </main>
  );
};

export const Route = createFileRoute("/my-bookings")({
  component: MyBookingsPage,
});
