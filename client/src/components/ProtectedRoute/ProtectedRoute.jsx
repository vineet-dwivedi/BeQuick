import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../services/auth.jsx";

export default function ProtectedRoute() {
  const { user, bootstrapped } = useAuth();
  const location = useLocation();

  if (!bootstrapped) {
    return (
      <div className="page page-loading">
        <section className="loading-card">
          <div className="loading-orbit" aria-hidden="true">
            <span />
            <span />
          </div>
          <p className="eyebrow">Checking access</p>
          <h1>Securing your workspace</h1>
          <p>Verifying session and permissions.</p>
        </section>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
