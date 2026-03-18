import { Link } from "react-router-dom";
import { useNotFoundState } from "./hooks/useNotFoundState.js";

export default function NotFoundPage() {
  const { eyebrow, title, message, actionLabel } = useNotFoundState();

  return (
    <div className="page page-notfound">
      <section className="notfound">
        <div className="notfound__meta">
          <span>Elite routing</span>
          <span>Missing page</span>
        </div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p>{message}</p>
        <div className="notfound__actions">
          <Link className="btn btn-primary" to="/">
            {actionLabel}
          </Link>
          <Link className="btn btn-ghost" to="/login">
            Open login
          </Link>
        </div>
      </section>
    </div>
  );
}
