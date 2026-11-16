const BASE = import.meta.env.VITE_API_URL || "/api";

async function request(path, options) {
  const res = await fetch(`${BASE}${path}`, options);
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(body.error || `Request failed (${res.status})`);
  }
  return body;
}

export function fetchCourts() {
  return request("/courts");
}

export function fetchSlots(courtId, date) {
  return request(`/courts/${courtId}/slots?date=${encodeURIComponent(date)}`);
}

export function createBooking(payload) {
  return request("/bookings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export function fetchMyBookings(contact) {
  return request(`/bookings?contact=${encodeURIComponent(contact)}`);
}

export function peso(amount) {
  return `₱${amount.toLocaleString("en-PH")}`;
}
