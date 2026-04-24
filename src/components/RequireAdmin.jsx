import { Navigate, Outlet, useOutletContext } from 'react-router-dom';

// Layout route: renders nested admin-only dashboard routes only when the
// signed-in user has role "admin". Publishers get bounced back to the
// dashboard overview. Expects the parent `<Dashboard />` layout to supply
// `{ user }` via Outlet context.
export default function RequireAdmin() {
  const ctx = useOutletContext();
  const user = ctx?.user ?? null;

  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/dashboard" replace />;

  return <Outlet context={ctx} />;
}
