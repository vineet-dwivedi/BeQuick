import { Link, NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../../services/auth.jsx";
import { useTheme } from "../../services/theme.jsx";

export default function Topbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <header className="topbar">
      <Link className="brand" to="/">
        <span className="brand__mark" aria-hidden="true">
          <img className="brand__icon" src="/favicon.svg?v=5" alt="" />
        </span>
        <span className="brand__copy">
          <strong>BeQuick Elite</strong>
        </span>
      </Link>
      <nav className="nav">
        {isHome ? (
          <>
            <a href="#overview">Overview</a>
            <a href="#companies">Jobs</a>
            <a href="#insights">Report</a>
          </>
        ) : (
          <>
            <NavLink to="/">Overview</NavLink>
            {!user && <NavLink to="/login">Login</NavLink>}
          </>
        )}
      </nav>
      <div className="topbar__actions">
        {user && <span className="user-pill">{user.email}</span>}
        <button className="btn btn-outline" type="button" onClick={toggleTheme}>
          {theme === "default" ? "Light mode" : "Dark mode"}
        </button>
        {user?.role === "admin" && (
          <NavLink className="btn btn-outline" to="/admin">
            Admin Panel
          </NavLink>
        )}
        {!user && (
          <NavLink className="btn btn-ghost" to="/login">
            Login
          </NavLink>
        )}
        {user && (
          <button className="btn btn-ghost" type="button" onClick={logout}>
            Logout
          </button>
        )}
        {!user ? (
          <NavLink className="btn btn-primary" to="/login">
            Sign in
          </NavLink>
        ) : (
          <NavLink className="btn btn-primary" to="/">
            Open platform
          </NavLink>
        )}
      </div>
    </header>
  );
}
