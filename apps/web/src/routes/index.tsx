import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";

import { BookingNav } from "../booking/Nav";
import { fetchCourts, peso } from "../booking/api";
import "../booking/styles.css";

const CourtsPage = () => {
  const { data: courts, isPending, error } = useQuery({ queryKey: ["courts"], queryFn: fetchCourts });

  return (
    <main className="booking-app">
      <header className="booking-header">
        <h1>Court Booking PH 🇵🇭</h1>
        <BookingNav />
      </header>

      {error ? <p className="error-text">{error.message}</p> : null}
      {isPending ? <p className="muted">Loading courts…</p> : null}

      {courts ? (
        <div className="court-grid">
          {courts.map((court) => (
            <Link key={court.id} to="/courts/$courtId" params={{ courtId: court.id }} className="court-card">
              <div className="court-card-head">
                <h3>{court.name}</h3>
                <span className="sport-badge">{court.sport}</span>
              </div>
              <p className="muted">
                {court.city}, {court.region}
              </p>
              <p className="price">{peso(court.pricePerHour)} <span className="muted">/ hour</span></p>
            </Link>
          ))}
        </div>
      ) : null}
    </main>
  );
};

export const Route = createFileRoute("/")({
  component: CourtsPage,
});
