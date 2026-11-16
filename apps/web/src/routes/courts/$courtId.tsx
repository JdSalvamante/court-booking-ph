import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { BookingNav } from "../../booking/Nav";
import { fetchCourts, fetchSlots, postBooking, peso, todayStr, type Court } from "../../booking/api";
import "../../booking/styles.css";

const CourtDetailPage = () => {
  const { courtId } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [date, setDate] = useState(todayStr());
  const [time, setTime] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [contact, setContact] = useState("");
  const [confirmed, setConfirmed] = useState<string | null>(null);

  const { data: courts } = useQuery({ queryKey: ["courts"], queryFn: fetchCourts });
  const court: Court | undefined = courts?.find((c) => c.id === courtId);

  const { data: slotsResponse, isPending: slotsPending, error: slotsError } = useQuery({
    queryKey: ["slots", courtId, date],
    queryFn: () => fetchSlots(courtId, date),
    enabled: court !== undefined,
  });

  const bookingMutation = useMutation({
    mutationFn: postBooking,
    onSuccess: () => {
      setConfirmed(`${date} at ${time}`);
      setTime("");
      queryClient.invalidateQueries({ queryKey: ["slots", courtId, date] });
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
  });

  if (!court) {
    return (
      <main className="booking-app">
        <p className="muted">Loading court…</p>
      </main>
    );
  }

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    bookingMutation.mutate({ courtId, date, time, playerName, contact });
  };

  return (
    <main className="booking-app">
      <header className="booking-header">
        <h1>Court Booking PH 🇵🇭</h1>
        <BookingNav />
      </header>

      <Link to="/" className="back-link">
        ← Back to courts
      </Link>
      <h2>{court.name}</h2>
      <p className="muted">
        {court.sport} · {court.city}, {court.region} · {peso(court.pricePerHour)}/hour
      </p>

      <label className="date-label">
        Date
        <input type="date" value={date} min={todayStr()} onChange={(e) => setDate(e.target.value)} />
      </label>

      {slotsError ? <p className="error-text">{slotsError.message}</p> : null}
      {slotsPending ? <p className="muted">Loading slots…</p> : null}

      {slotsResponse ? (
        <div className="slot-grid">
          {slotsResponse.slots.map((slot) => (
            <button
              key={slot.time}
              type="button"
              className="slot"
              disabled={!slot.available}
              data-selected={time === slot.time}
              onClick={() => setTime(slot.time)}
            >
              {slot.time}
            </button>
          ))}
        </div>
      ) : null}

      {confirmed ? (
        <div className="confirm-box">
          <h3>Booking confirmed! 🎾</h3>
          <p>
            {court.name} — {confirmed}
          </p>
          <button type="button" className="primary-button" onClick={() => navigate({ to: "/my-bookings" })}>
            View my bookings
          </button>
        </div>
      ) : null}

      {time && !confirmed ? (
        <form className="booking-form" onSubmit={submit}>
          <h3>Book {court.name}</h3>
          <p className="muted">
            {date} at {time} — {peso(court.pricePerHour)} for one hour
          </p>
          <label>
            Name
            <input required value={playerName} onChange={(e) => setPlayerName(e.target.value)} placeholder="Your name" />
          </label>
          <label>
            Contact (mobile or email)
            <input required value={contact} onChange={(e) => setContact(e.target.value)} placeholder="09xx xxx xxxx" />
          </label>
          {bookingMutation.error ? <p className="error-text">{(bookingMutation.error as Error).message}</p> : null}
          <button type="submit" disabled={bookingMutation.isPending}>
            {bookingMutation.isPending ? "Booking…" : "Confirm booking"}
          </button>
        </form>
      ) : null}
    </main>
  );
};

export const Route = createFileRoute("/courts/$courtId")({
  component: CourtDetailPage,
});
