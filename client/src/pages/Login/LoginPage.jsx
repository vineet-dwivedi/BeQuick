import { useLoginState } from "./hooks/useLoginState.js";

export default function LoginPage() {
  const { pageRef, googleButtonRef, error, info, loading } = useLoginState();

  return (
    <div className="page page-login" ref={pageRef}>
      <section className="login-grid">
        <div className="login-panel">
          <div className="login-panel__meta">
            <span className="login-badge">Software jobs only</span>
            <span className="login-badge login-badge--muted">Google verified access</span>
          </div>
          <p className="eyebrow">Secure access</p>
          <h1>Access the BeQuick command deck</h1>
          <p className="login-panel__lead">
            Sign in with Google to explore verified software engineering jobs from tracked
            tech companies.
          </p>
          <div className="login-stats">
            <div>
              <h3>1 click</h3>
              <p>Google-verified sign-in</p>
            </div>
            <div>
              <h3>Software jobs</h3>
              <p>Focused engineering search</p>
            </div>
            <div>
              <h3>Live feed</h3>
              <p>Verified company signals</p>
            </div>
          </div>
          <div className="login-note">
            <p>
              Admins use the same Google login. If your account already has the admin role in
              the database, you will be routed to the admin panel automatically.
            </p>
          </div>
        </div>

        <div className="login-cards">
          <div className="login-card login-card--highlight">
            <div className="login-card__header">
              <p className="eyebrow">Google Sign-In</p>
              <h2>Continue with Google</h2>
              <p>
                Use the same Google account every time so your BeQuick profile, role, and
                dashboard state stay linked correctly.
              </p>
            </div>

            <div className="google-auth-slot">
              <div className="google-auth-slot__shell">
                <div className="google-auth-slot__button" ref={googleButtonRef} />
              </div>
            </div>

            {(loading || error || info) && (
              <div className="login-feedback">
                {loading && <p className="info-text">Signing you in...</p>}
                {error && <p className="error-text">{error}</p>}
                {info && <p className="info-text">{info}</p>}
              </div>
            )}
          </div>

          <div className="login-card">
            <div className="login-card__header">
              <p className="eyebrow">Why this flow</p>
              <h2>No OTP friction, cleaner entry</h2>
              <p>
                Google handles the identity step, and BeQuick creates or links your account on
                the backend after verifying the Google ID token.
              </p>
            </div>
            <ul className="login-points">
              <li>Faster sign-in with fewer moving parts on Render free.</li>
              <li>Backend still issues your app JWT after verifying Google.</li>
              <li>Existing admin/user roles stay controlled in MongoDB.</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
