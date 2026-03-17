import { useEffect, useMemo, useRef, useState } from "react";
import { Navigate } from "react-router-dom";
import gsap from "gsap";
import { fetchStats } from "../services/api.js";
import { useAuth } from "../services/auth.jsx";

export default function AdminPage() {
  const pageRef = useRef(null);
  const { user } = useAuth();
  const [stats, setStats] = useState(null);

  const activity = useMemo(
    () => [
      {
        title: "Crawler queue",
        detail: "12 sources queued for the next run",
        status: "On schedule"
      },
      {
        title: "Signal refresh",
        detail: "Realtime updates streaming every 30 minutes",
        status: "Healthy"
      },
      {
        title: "Source audits",
        detail: "3 sources flagged for manual review",
        status: "Attention"
      }
    ],
    []
  );

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await fetchStats();
        setStats(data);
      } catch {
        // Ignore stats errors on the UI.
      }
    };

    loadStats();
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".admin-hero", { y: 24, opacity: 0, duration: 0.7 });
      gsap.from(".admin-card", { y: 20, opacity: 0, duration: 0.6, stagger: 0.08 });
      gsap.from(".admin-table", { y: 20, opacity: 0, duration: 0.6, delay: 0.15 });
    }, pageRef);

    return () => ctx.revert();
  }, []);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "admin") {
    return (
      <div className="page page-admin" ref={pageRef}>
        <section className="access-denied">
          <p className="eyebrow">Restricted</p>
          <h1>Admin access required</h1>
          <p>
            You are signed in as {user.email}. Switch to an admin account to view
            the control panel.
          </p>
        </section>
      </div>
    );
  }

  return (
    <div className="page page-admin" ref={pageRef}>
      <section className="admin-hero">
        <div>
          <p className="eyebrow">Command center</p>
          <h1>Admin intelligence dashboard</h1>
          <p>
            Monitor crawler health, review source performance, and control the
            weekly data refresh cycles.
          </p>
        </div>
        <div className="admin-actions">
          <button className="btn btn-primary" type="button">
            Run priority crawl
          </button>
          <button className="btn btn-outline" type="button">
            Export insights
          </button>
        </div>
      </section>

      <section className="admin-grid">
        <div className="admin-card">
          <p>Sources indexed</p>
          <h2>{stats?.sources ?? "--"}</h2>
          <span>Verified endpoints</span>
        </div>
        <div className="admin-card">
          <p>Active jobs</p>
          <h2>{stats?.jobs ?? "--"}</h2>
          <span>Live listings</span>
        </div>
        <div className="admin-card">
          <p>Companies tracked</p>
          <h2>{stats?.companies ?? "--"}</h2>
          <span>Global coverage</span>
        </div>
        <div className="admin-card">
          <p>System confidence</p>
          <h2>93%</h2>
          <span>Signal reliability</span>
        </div>
      </section>

      <section className="admin-table">
        <div className="table-header">
          <h2>Operational status</h2>
          <p>Live feed from the crawler and analytics services.</p>
        </div>
        <div className="table-body">
          {activity.map((item) => (
            <div className="table-row" key={item.title}>
              <div>
                <h3>{item.title}</h3>
                <p>{item.detail}</p>
              </div>
              <span className={`status ${item.status.toLowerCase().replace(/\s+/g, "-")}`}>
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
