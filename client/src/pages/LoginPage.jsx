import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import gsap from "gsap";
import { useAuth } from "../services/auth.jsx";

const ADMIN_EMAIL = "vineetdwi17@gmail.com";

export default function LoginPage() {
  const pageRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyOtp, requestOtp, logout } = useAuth();

  const [adminStep, setAdminStep] = useState("email");
  const [adminCode, setAdminCode] = useState("");
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState("");
  const [adminInfo, setAdminInfo] = useState("");
  const [adminDevCode, setAdminDevCode] = useState("");

  const [userStep, setUserStep] = useState("email");
  const [userEmail, setUserEmail] = useState("");
  const [userCode, setUserCode] = useState("");
  const [userLoading, setUserLoading] = useState(false);
  const [userError, setUserError] = useState("");
  const [userInfo, setUserInfo] = useState("");
  const [userDevCode, setUserDevCode] = useState("");

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".login-panel", { y: 24, opacity: 0, duration: 0.7 });
      gsap.from(".login-card", { y: 30, opacity: 0, duration: 0.8, delay: 0.1, stagger: 0.1 });
    }, pageRef);

    return () => ctx.revert();
  }, []);

  const handleAdminRequestOtp = async () => {
    setAdminError("");
    setAdminInfo("");
    setAdminDevCode("");
    setAdminLoading(true);

    const result = await requestOtp(ADMIN_EMAIL);
    setAdminLoading(false);

    if (!result.ok) {
      setAdminError(result.error || "Failed to send OTP");
      return;
    }

    setAdminStep("code");
    setAdminInfo(result.cooldown ? "OTP already sent. Check your inbox." : result.message);
    if (result.devCode) {
      setAdminDevCode(result.devCode);
    }
  };

  const handleAdminVerifyOtp = async () => {
    setAdminError("");
    setAdminInfo("");
    setAdminLoading(true);

    const result = await verifyOtp(ADMIN_EMAIL, adminCode);
    setAdminLoading(false);

    if (!result.ok) {
      setAdminError(result.error || "OTP verification failed");
      return;
    }

    if (result.user?.role !== "admin") {
      setAdminError("This email is not configured as admin.");
      await logout();
      return;
    }

    navigate("/admin", { replace: true });
  };

  const handleUserRequestOtp = async () => {
    const normalized = userEmail.trim().toLowerCase();
    if (normalized === ADMIN_EMAIL) {
      setUserError("Use the admin login section for this email.");
      return;
    }

    setUserError("");
    setUserInfo("");
    setUserDevCode("");
    setUserLoading(true);

    const result = await requestOtp(userEmail);
    setUserLoading(false);

    if (!result.ok) {
      setUserError(result.error || "Failed to send OTP");
      return;
    }

    setUserStep("code");
    setUserInfo(result.cooldown ? "OTP already sent. Check your inbox." : result.message);
    if (result.devCode) {
      setUserDevCode(result.devCode);
    }
  };

  const handleUserVerifyOtp = async () => {
    const normalized = userEmail.trim().toLowerCase();
    if (normalized === ADMIN_EMAIL) {
      setUserError("Use the admin login section for this email.");
      return;
    }

    setUserError("");
    setUserInfo("");
    setUserLoading(true);

    const result = await verifyOtp(userEmail, userCode);
    setUserLoading(false);

    if (!result.ok) {
      setUserError(result.error || "OTP verification failed");
      return;
    }

    const fallback = result.user?.role === "admin" ? "/admin" : "/";
    const intended = location.state?.from?.pathname;
    const target = intended && intended !== "/login" ? intended : fallback;
    navigate(target, { replace: true });
  };

  return (
    <div className="page page-login" ref={pageRef}>
      <section className="login-grid">
        <div className="login-panel">
          <p className="eyebrow">Secure access</p>
          <h1>Welcome to BeQuick Elite</h1>
          <p>
            Sign in with a one-time code to unlock curated job intelligence, hiring signals,
            and stack-level insights.
          </p>
          <div className="login-stats">
            <div>
              <h3>24/7</h3>
              <p>Live crawl coverage</p>
            </div>
            <div>
              <h3>6K+</h3>
              <p>Roles tracked weekly</p>
            </div>
          </div>
        </div>

        <div className="login-cards">
          <div className="login-card admin">
            <div>
              <p className="eyebrow">Admin access</p>
              <h2>{adminStep === "email" ? "Admin login" : "Enter admin OTP"}</h2>
              <p>
                {adminStep === "email"
                  ? "This section is locked to the primary admin email."
                  : `Code sent to ${ADMIN_EMAIL}`}
              </p>
            </div>

            {adminStep === "email" ? (
              <form
                className="auth-form"
                onSubmit={(event) => {
                  event.preventDefault();
                  handleAdminRequestOtp();
                }}
              >
                <label className="form-field">
                  Admin email
                  <input
                    className="auth-input is-locked"
                    type="email"
                    value={ADMIN_EMAIL}
                    readOnly
                  />
                </label>
                {adminError && <p className="error-text">{adminError}</p>}
                {adminInfo && <p className="info-text">{adminInfo}</p>}
                <button className="btn btn-primary" type="submit" disabled={adminLoading}>
                  {adminLoading ? "Sending..." : "Send OTP"}
                </button>
              </form>
            ) : (
              <form
                className="auth-form"
                onSubmit={(event) => {
                  event.preventDefault();
                  handleAdminVerifyOtp();
                }}
              >
                <label className="form-field">
                  Enter 6-digit code
                  <input
                    className="auth-input"
                    type="text"
                    value={adminCode}
                    onChange={(event) => setAdminCode(event.target.value)}
                    placeholder="000000"
                    required
                  />
                </label>
                {adminError && <p className="error-text">{adminError}</p>}
                {adminInfo && <p className="info-text">{adminInfo}</p>}
                {adminDevCode && (
                  <p className="auth-dev-code">
                    Dev OTP: <strong>{adminDevCode}</strong>
                  </p>
                )}
                <div className="auth-actions">
                  <button className="btn btn-primary" type="submit" disabled={adminLoading}>
                    {adminLoading ? "Verifying..." : "Verify & Login"}
                  </button>
                  <button
                    className="btn btn-ghost"
                    type="button"
                    onClick={() => {
                      setAdminStep("email");
                      setAdminCode("");
                      setAdminError("");
                      setAdminInfo("");
                    }}
                  >
                    Back
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className="login-card">
            <div>
              <p className="eyebrow">Member access</p>
              <h2>{userStep === "email" ? "Login with email" : "Enter OTP code"}</h2>
              <p>
                {userStep === "email"
                  ? "We will send a one-time code to your inbox."
                  : `Code sent to ${userEmail}`}
              </p>
            </div>

            {userStep === "email" ? (
              <form
                className="auth-form"
                onSubmit={(event) => {
                  event.preventDefault();
                  handleUserRequestOtp();
                }}
              >
                <label className="form-field">
                  Work email
                  <input
                    className="auth-input"
                    type="email"
                    value={userEmail}
                    onChange={(event) => setUserEmail(event.target.value)}
                    placeholder="you@company.com"
                    required
                  />
                </label>
                {userError && <p className="error-text">{userError}</p>}
                {userInfo && <p className="info-text">{userInfo}</p>}
                <button className="btn btn-primary" type="submit" disabled={userLoading}>
                  {userLoading ? "Sending..." : "Send OTP"}
                </button>
              </form>
            ) : (
              <form
                className="auth-form"
                onSubmit={(event) => {
                  event.preventDefault();
                  handleUserVerifyOtp();
                }}
              >
                <label className="form-field">
                  Enter 6-digit code
                  <input
                    className="auth-input"
                    type="text"
                    value={userCode}
                    onChange={(event) => setUserCode(event.target.value)}
                    placeholder="000000"
                    required
                  />
                </label>
                {userError && <p className="error-text">{userError}</p>}
                {userInfo && <p className="info-text">{userInfo}</p>}
                {userDevCode && (
                  <p className="auth-dev-code">
                    Dev OTP: <strong>{userDevCode}</strong>
                  </p>
                )}
                <div className="auth-actions">
                  <button className="btn btn-primary" type="submit" disabled={userLoading}>
                    {userLoading ? "Verifying..." : "Verify & Login"}
                  </button>
                  <button
                    className="btn btn-ghost"
                    type="button"
                    onClick={() => {
                      setUserStep("email");
                      setUserCode("");
                      setUserError("");
                      setUserInfo("");
                    }}
                  >
                    Change email
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
