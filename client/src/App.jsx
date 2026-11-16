import { useEffect, useState } from "react";
import {
  fetchCourts,
  fetchSlots,
  createBooking,
  fetchMyBookings,
  peso,
} from "./api.js";

const todayStr = () => new Date().toISOString().slice(0, 10);

function CourtCard({ court, onSelect }) {
  return (
    <button className="card" onClick={() => onSelect(court)}>
      <div className="card-head">
        <h3>{court.name}</h3>
        <span className="badge">{court.sport}</span>
      </div>
      <p className="muted">
        {court.city}, {court.region}
      </p>
      <p className="price">
        {peso(court.pricePerHour)} <span>/ hour</span>
      </p>
    </button>
  );
}

function CourtList({ onSelect }) {
  const [courts, setCourts] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCourts()
      .then(setCourts)
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <p className="error">{error}</p>;
  if (!courts) return <p className="muted">Loading courts…</p>;

  return (
    <div className="grid">
      {courts.map((c) => (
        <CourtCard key={c.id} court={c} onSelect={onSelect} />
      ))}
    </div>
  );
}

function SlotGrid({ slots, selected, onSelect }) {
  return (
    <div className="slots">
      {slots.map((s) => (
        <button
          key={s.time}
          className="slot"
          disabled={!s.available}
          data-selected={selected === s.time}
          onClick={() => onSelect(s.time)}
        >
          {s.time}
        </button>
      ))}
    </div>
  );
}

function BookingForm({ court, date, time, onDone }) {
  const [playerName, setPlayerName] = useState("");
  const [contact, setContact] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    setStatus("booking");
    setError("");
    try {
      await createBooking({ courtId: court.id, date, time, playerName, contact });
      setStatus("done");
      onDone();
    } catch (e2) {
      setError(e2.message);
      setStatus("");
    }
  }

  if (status === "done") {
    return (
      <div className="confirm">
        <h3>Booking confirmed! 🎾</h3>
        <p>
          {court.name} — {date} at {time}
        </p>
        <button onClick={() => onDone(true)}>Book another slot</button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="form">
      <h3>Book {court.name}</h3>
      <p className="muted">
        {date} at {time} — {peso(court.pricePerHour)} for one hour
      </p>
      <label>
        Name
        <input
          required
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          placeholder="Your name"
        />
      </label>
      <label>
        Contact (mobile or email)
        <input
          required
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          placeholder="09xx xxx xxxx"
        />
      </label>
      {error && <p className="error">{error}</p>}
      <button disabled={status === "booking"}>
        {status === "booking" ? "Booking…" : "Confirm booking"}
      </button>
    </form>
  );
}

function CourtDetail({ court, onBack }) {
  const [date, setDate] = useState(todayStr());
  const [slots, setSlots] = useState(null);
  const [time, setTime] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setSlots(null);
    setTime("");
    setError("");
    fetchSlots(court.id, date)
      .then((r) => setSlots(r.slots))
      .catch((e) => setError(e.message));
  }, [court.id, date]);

  return (
    <div>
      <button className="link" onClick={onBack}>
        ← Back to courts
      </button>
      <h2>{court.name}</h2>
      <p className="muted">
        {court.sport} · {court.city}, {court.region} · {peso(court.pricePerHour)}/hour
      </p>
      <label className="date-label">
        Date
        <input
          type="date"
          value={date}
          min={todayStr()}
          onChange={(e) => setDate(e.target.value)}
        />
      </label>
      {error && <p className="error">{error}</p>}
      {!slots && !error && <p className="muted">Loading slots…</p>}
      {slots && (
        <>
          <SlotGrid slots={slots} selected={time} onSelect={setTime} />
          {time && (
            <BookingForm
              court={court}
              date={date}
              time={time}
              onDone={(reset) => setTime(reset ? "" : time)}
            />
          )}
        </>
      )}
    </div>
  );
}

function MyBookings() {
  const [contact, setContact] = useState("");
  const [bookings, setBookings] = useState(null);
  const [error, setError] = useState("");

  async function search(e) {
    e.preventDefault();
    setBookings(null);
    setError("");
    try {
      setBookings(await fetchMyBookings(contact));
    } catch (e2) {
      setError(e2.message);
    }
  }

  return (
    <div>
      <h2>My bookings</h2>
      <form onSubmit={search} className="form inline">
        <input
          required
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          placeholder="Enter your mobile or email"
        />
        <button>Search</button>
      </form>
      {error && <p className="error">{error}</p>}
      {bookings && bookings.length === 0 && (
        <p className="muted">No bookings found for that contact.</p>
      )}
      {bookings?.map((b) => (
        <div key={b.id} className="card static">
          <h3>{b.court?.name ?? b.courtId}</h3>
          <p>
            {b.date} at {b.time} · {b.playerName}
          </p>
        </div>
      ))}
    </div>
  );
}

export default function App() {
  const [view, setView] = useState("courts");
  const [court, setCourt] = useState(null);

  return (
    <main>
      <header>
        <h1 onClick={() => { setView("courts"); setCourt(null); }}>
          Court Booking PH 🇵🇭
        </h1>
        <nav>
          <button data-active={view === "courts"} onClick={() => { setView("courts"); setCourt(null); }}>
            Courts
          </button>
          <button data-active={view === "mine"} onClick={() => setView("mine")}>
            My bookings
          </button>
        </nav>
      </header>

      {view === "courts" &&
        (court ? (
          <CourtDetail court={court} onBack={() => setCourt(null)} />
        ) : (
          <CourtList onSelect={setCourt} />
        ))}
      {view === "mine" && <MyBookings />}
    </main>
  );
}
