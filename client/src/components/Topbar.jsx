import { Link, NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../services/auth.jsx";
import { useTheme } from "../services/theme.jsx";

export default function Topbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <header className="topbar">
      <Link className="brand" to="/">
        <span className="brand__dot" />
        BeQuick Elite
      </Link>
      <nav className="nav">
        {isHome ? (
          <>
            <a href="#how">How it works</a>
            <a href="#signals">Signals</a>
            <a href="#companies">Companies</a>
            <a href="#insights">Insights</a>
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
          {theme === "default" ? "Light Theme" : "Dark Theme"}
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
            Get Access
          </NavLink>
        ) : (
          <NavLink className="btn btn-primary" to="/">
            Launch Dashboard
          </NavLink>
        )}
      </div>
    </header>
  );
}
