import { Link, NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../../services/auth.jsx";
import { useTheme } from "../../services/theme.jsx";
import {
  BriefcaseIcon,
  CompassIcon,
  LayersIcon,
  MoonIcon,
  SunIcon
} from "../Icons/AppIcons.jsx";

export default function Topbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const isHome = location.pathname === "/";
  const brandIconSrc =
    theme === "default" ? "/favicon-dark.svg?v=1" : "/favicon-light.svg?v=1";

  return (
    <header className="topbar">
      <Link className="brand" to="/">
        <span className="brand__mark" aria-hidden="true">
          <img className="brand__icon" src={brandIconSrc} alt="" />
        </span>
        <span className="brand__copy">
          <strong>BeQuick Elite</strong>
        </span>
      </Link>
      <nav className="nav">
        {isHome ? (
          <>
            <a href="#overview">
              <CompassIcon size={15} />
              <span>Overview</span>
            </a>
            <a href="#companies">
              <BriefcaseIcon size={15} />
              <span>Jobs</span>
            </a>
            <a href="#insights">
              <LayersIcon size={15} />
              <span>Report</span>
            </a>
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
          {theme === "default" ? <SunIcon size={16} /> : <MoonIcon size={16} />}
          <span>{theme === "default" ? "Light" : "Dark"}</span>
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
