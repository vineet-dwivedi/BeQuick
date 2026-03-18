import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../../services/auth.jsx";
import "./VerifyEmailPage.scss";

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const { verifyEmail } = useAuth();
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("Checking your verification link...");

  useEffect(() => {
    let active = true;

    const verify = async () => {
      const token = searchParams.get("token") || "";

      if (!token) {
        if (!active) return;
        setStatus("error");
        setMessage("Verification link is missing or incomplete.");
        return;
      }

      const result = await verifyEmail(token);
      if (!active) return;

      if (!result.ok) {
        setStatus("error");
        setMessage(result.error || "Verification failed.");
        return;
      }

      setStatus("success");
      setMessage(result.message || "Email verified. You can log in now.");
    };

    verify();

    return () => {
      active = false;
    };
  }, [searchParams, verifyEmail]);

  return (
    <div className="page page-verify-email">
      <section className="verify-card">
        <p className="eyebrow">Account verification</p>
        <h1>{status === "loading" ? "Verifying your email" : "Verification status"}</h1>
        <p>{message}</p>
        <div className="verify-actions">
          <Link className="btn btn-primary" to="/login">
            Go to Login
          </Link>
          <Link className="btn btn-ghost" to="/">
            Back to Home
          </Link>
        </div>
      </section>
    </div>
  );
}
