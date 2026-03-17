import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="page page-notfound">
      <section className="notfound">
        <p className="eyebrow">404</p>
        <h1>Page not found</h1>
        <p>The page you are looking for does not exist or has moved.</p>
        <Link className="btn btn-primary" to="/">
          Back to home
        </Link>
      </section>
    </div>
  );
}
