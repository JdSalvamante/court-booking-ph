import { Link, useMatchRoute } from "@tanstack/react-router";

export const BookingNav = () => {
  const matchRoute = useMatchRoute();
  const to = (path: string) => (matchRoute({ to: path }) ? path : undefined);

  return (
    <nav className="booking-nav">
      <Link to="/" data-active={to("/") === "/"}>
        Courts
      </Link>
      <Link to="/my-bookings" data-active={Boolean(to("/my-bookings"))}>
        My bookings
      </Link>
    </nav>
  );
};
