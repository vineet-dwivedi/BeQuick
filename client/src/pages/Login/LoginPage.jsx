import { useLoginState } from "./hooks/useLoginState.js";

export default function LoginPage() {
  const { pageRef, signup, signin } = useLoginState();

  return (
    <div className="page page-login" ref={pageRef}>
      <section className="login-grid">
        <div className="login-panel">
          <p className="eyebrow">Secure access</p>
          <h1>Welcome to BeQuick Elite</h1>
          <p>
            Create an account with your email and password, verify it from your inbox,
            and unlock curated job intelligence with clean session-based access.
          </p>
          <div className="login-stats">
            <div>
              <h3>1 Click</h3>
              <p>Verification link activation</p>
            </div>
            <div>
              <h3>24/7</h3>
              <p>Live crawl coverage</p>
            </div>
            <div>
              <h3>6K+</h3>
              <p>Roles tracked weekly</p>
            </div>
          </div>
          <div className="login-note">
            <p>
              Admins use the same login form and are routed to the admin panel automatically
              based on their role.
            </p>
          </div>
        </div>

        <div className="login-cards">
          <div className="login-card login-card--highlight">
            <div>
              <p className="eyebrow">Create account</p>
              <h2>Sign up with a real email</h2>
              <p>We will send a verification link before your account can log in.</p>
            </div>

            <form
              className="auth-form"
              onSubmit={(event) => {
                event.preventDefault();
                signup.submit();
              }}
            >
              <label className="form-field">
                Full name
                <input
                  className="auth-input"
                  type="text"
                  value={signup.name}
                  onChange={(event) => signup.setName(event.target.value)}
                  placeholder="Vineet Dwivedi"
                  autoComplete="name"
                  required
                />
              </label>
              <label className="form-field">
                Email address
                <input
                  className="auth-input"
                  type="email"
                  value={signup.email}
                  onChange={(event) => signup.setEmail(event.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </label>
              <label className="form-field">
                Password
                <input
                  className="auth-input"
                  type="password"
                  value={signup.password}
                  onChange={(event) => signup.setPassword(event.target.value)}
                  placeholder="Create a password"
                  autoComplete="new-password"
                  required
                />
              </label>
              {signup.error && <p className="error-text">{signup.error}</p>}
              {signup.info && <p className="info-text">{signup.info}</p>}
              <button className="btn btn-primary" type="submit" disabled={signup.loading}>
                {signup.loading ? "Creating..." : "Create Account"}
              </button>
            </form>
          </div>

          <div className="login-card">
            <div>
              <p className="eyebrow">Login</p>
              <h2>Sign in with your password</h2>
              <p>Use your verified email and password to continue.</p>
            </div>

            <form
              className="auth-form"
              onSubmit={(event) => {
                event.preventDefault();
                signin.submit();
              }}
            >
              <label className="form-field">
                Email address
                <input
                  className="auth-input"
                  type="email"
                  value={signin.email}
                  onChange={(event) => signin.setEmail(event.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </label>
              <label className="form-field">
                Password
                <input
                  className="auth-input"
                  type="password"
                  value={signin.password}
                  onChange={(event) => signin.setPassword(event.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                />
              </label>
              {signin.error && <p className="error-text">{signin.error}</p>}
              {signin.info && <p className="info-text">{signin.info}</p>}
              <div className="auth-actions">
                <button className="btn btn-primary" type="submit" disabled={signin.loading}>
                  {signin.loading ? "Signing in..." : "Login"}
                </button>
                {signin.needsVerification && (
                  <button
                    className="btn btn-ghost"
                    type="button"
                    onClick={signin.resendVerification}
                    disabled={signin.resendLoading}
                  >
                    {signin.resendLoading ? "Sending..." : "Resend Verification Link"}
                  </button>
                )}
                <button className="btn btn-ghost" type="button" onClick={signin.reset}>
                  Reset
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
