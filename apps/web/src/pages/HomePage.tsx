import { useHealth } from "../features/health/api";

export function HomePage() {
  const { data, isPending, error } = useHealth();

  return (
    <section>
      <h1>Ticket Booking</h1>
      <div className="card">
        <h2>System status</h2>
        {isPending && <p className="muted">Checking API…</p>}
        {error && <p className="error">API unreachable: {error.message}</p>}
        {data && (
          <p className="success-text">
            API: {data.status} · Database: {data.database}
          </p>
        )}
      </div>
    </section>
  );
}
