export interface Court {
  id: string;
  name: string;
  sport: string;
  city: string;
  region: string;
  pricePerHour: number;
  openHour: number;
  closeHour: number;
}

export interface Slot {
  time: string;
  available: boolean;
}

export interface SlotsResponse {
  courtId: string;
  date: string;
  slots: Slot[];
}

export interface Booking {
  id: string;
  courtId: string;
  date: string;
  time: string;
  playerName: string;
  contact: string;
  createdAt: string;
  court?: Court | null;
}

export interface NewBooking {
  courtId: string;
  date: string;
  time: string;
  playerName: string;
  contact: string;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });

  const body: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      typeof body === "object" && body !== null && "detail" in body
        ? String((body as { detail: unknown }).detail)
        : `Request failed (${response.status})`;
    throw new Error(message);
  }

  return body as T;
}

export const fetchCourts = () => request<Court[]>("/api/courts");

export const fetchSlots = (courtId: string, date: string) =>
  request<SlotsResponse>(`/api/courts/${courtId}/slots?date=${encodeURIComponent(date)}`);

export const postBooking = (booking: NewBooking) =>
  request<{ booking: Booking }>("/api/bookings", {
    method: "POST",
    body: JSON.stringify(booking),
  });

export const fetchBookings = (contact: string) =>
  request<Booking[]>(`/api/bookings?contact=${encodeURIComponent(contact)}`);

export const peso = (amount: number) =>
  new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 0 }).format(amount);

export const todayStr = () => new Date().toISOString().slice(0, 10);
