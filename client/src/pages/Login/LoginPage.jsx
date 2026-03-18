import { useLoginState } from "./hooks/useLoginState.js";

export default function LoginPage() {
  const { pageRef, adminEmail, admin, user } = useLoginState();

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
              <h2>{admin.step === "email" ? "Admin login" : "Enter admin OTP"}</h2>
              <p>
                {admin.step === "email"
                  ? "This section is locked to the primary admin email."
                  : `Code sent to ${adminEmail}`}
              </p>
            </div>

            {admin.step === "email" ? (
              <form
                className="auth-form"
                onSubmit={(event) => {
                  event.preventDefault();
                  admin.requestOtp();
                }}
              >
                <label className="form-field">
                  Admin email
                  <input
                    className="auth-input is-locked"
                    type="email"
                    value={adminEmail}
                    readOnly
                  />
                </label>
                {admin.error && <p className="error-text">{admin.error}</p>}
                {admin.info && <p className="info-text">{admin.info}</p>}
                <button className="btn btn-primary" type="submit" disabled={admin.loading}>
                  {admin.loading ? "Sending..." : "Send OTP"}
                </button>
              </form>
            ) : (
              <form
                className="auth-form"
                onSubmit={(event) => {
                  event.preventDefault();
                  admin.verifyOtp();
                }}
              >
                <label className="form-field">
                  Enter 6-digit code
                  <input
                    className="auth-input"
                    type="text"
                    value={admin.code}
                    onChange={(event) => admin.setCode(event.target.value)}
                    placeholder="000000"
                    required
                  />
                </label>
                {admin.error && <p className="error-text">{admin.error}</p>}
                {admin.info && <p className="info-text">{admin.info}</p>}
                <div className="auth-actions">
                  <button className="btn btn-primary" type="submit" disabled={admin.loading}>
                    {admin.loading ? "Verifying..." : "Verify & Login"}
                  </button>
                  <button
                    className="btn btn-ghost"
                    type="button"
                    onClick={admin.reset}
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
              <h2>{user.step === "email" ? "Login with email" : "Enter OTP code"}</h2>
              <p>
                {user.step === "email"
                  ? "We will send a one-time code to your inbox."
                  : `Code sent to ${user.email}`}
              </p>
            </div>

            {user.step === "email" ? (
              <form
                className="auth-form"
                onSubmit={(event) => {
                  event.preventDefault();
                  user.requestOtp();
                }}
              >
                <label className="form-field">
                  Work email
                  <input
                    className="auth-input"
                    type="email"
                    value={user.email}
                    onChange={(event) => user.setEmail(event.target.value)}
                    placeholder="you@company.com"
                    required
                  />
                </label>
                {user.error && <p className="error-text">{user.error}</p>}
                {user.info && <p className="info-text">{user.info}</p>}
                <button className="btn btn-primary" type="submit" disabled={user.loading}>
                  {user.loading ? "Sending..." : "Send OTP"}
                </button>
              </form>
            ) : (
              <form
                className="auth-form"
                onSubmit={(event) => {
                  event.preventDefault();
                  user.verifyOtp();
                }}
              >
                <label className="form-field">
                  Enter 6-digit code
                  <input
                    className="auth-input"
                    type="text"
                    value={user.code}
                    onChange={(event) => user.setCode(event.target.value)}
                    placeholder="000000"
                    required
                  />
                </label>
                {user.error && <p className="error-text">{user.error}</p>}
                {user.info && <p className="info-text">{user.info}</p>}
                <div className="auth-actions">
                  <button className="btn btn-primary" type="submit" disabled={user.loading}>
                    {user.loading ? "Verifying..." : "Verify & Login"}
                  </button>
                  <button
                    className="btn btn-ghost"
                    type="button"
                    onClick={user.reset}
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
