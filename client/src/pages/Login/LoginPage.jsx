import { useLoginState } from "./hooks/useLoginState.js";
import {
  ArrowUpRightIcon,
  BriefcaseIcon,
  KeyIcon,
  LayersIcon,
  ShieldIcon,
  SparkIcon
} from "../../components/Icons/AppIcons.jsx";

const LOGIN_POINTS = [
  {
    icon: ShieldIcon,
    title: "Verified access",
    detail: "Google sign-in only."
  },
  {
    icon: BriefcaseIcon,
    title: "Software jobs",
    detail: "Focused role search."
  },
  {
    icon: LayersIcon,
    title: "Admin ready",
    detail: "Same login, smart routing."
  }
];

export default function LoginPage() {
  const { pageRef, googleButtonRef, error, info, loading } = useLoginState();

  return (
    <div className="page page-login" ref={pageRef}>
      <section className="login-grid">
        <div className="login-panel">
          <p className="eyebrow">
            <SparkIcon size={14} />
            <span>Secure access</span>
          </p>
          <h1>Sign in to BeQuick</h1>
          <p className="login-panel__lead">Verified software engineering jobs in one place.</p>
          <div className="login-pills">
            <span className="login-badge">
              <BriefcaseIcon size={14} />
              Software jobs
            </span>
            <span className="login-badge login-badge--muted">
              <ShieldIcon size={14} />
              Google only
            </span>
          </div>
          <div className="login-points-grid">
            {LOGIN_POINTS.map((item) => (
              <article key={item.title} className="login-mini-card">
                <span className="login-mini-card__icon">
                  <item.icon size={16} />
                </span>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.detail}</p>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="login-cards">
          <div className="login-card login-card--highlight">
            <div className="login-card__header">
              <p className="eyebrow">
                <KeyIcon size={14} />
                <span>Google sign-in</span>
              </p>
              <h2>Continue with Google</h2>
              <p>Use the same account every time.</p>
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
              <p className="eyebrow">
                <LayersIcon size={14} />
                <span>Flow</span>
              </p>
              <h2>Simple and direct</h2>
            </div>
            <div className="login-steps">
              <div className="login-step">
                <ShieldIcon size={16} />
                <span>Google verifies identity.</span>
              </div>
              <div className="login-step">
                <LayersIcon size={16} />
                <span>BeQuick links your account.</span>
              </div>
              <div className="login-step">
                <ArrowUpRightIcon size={16} />
                <span>Admins go straight to admin.</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
