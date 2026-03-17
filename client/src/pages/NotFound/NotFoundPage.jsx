import { Link } from "react-router-dom";
import { useNotFoundState } from "./hooks/useNotFoundState.js";

export default function NotFoundPage() {
  const { eyebrow, title, message, actionLabel } = useNotFoundState();

  return (
    <div className="page page-notfound">
      <section className="notfound">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p>{message}</p>
        <Link className="btn btn-primary" to="/">
          {actionLabel}
        </Link>
      </section>
    </div>
  );
}