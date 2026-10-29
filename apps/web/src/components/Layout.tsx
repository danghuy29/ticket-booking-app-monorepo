import { Link, Outlet } from "react-router";

export function Layout() {
  return (
    <div className="layout">
      <header className="header">
        <Link to="/" className="brand">
          Ticket Booking
        </Link>
      </header>
      <main className="container">
        <Outlet />
      </main>
    </div>
  );
}
