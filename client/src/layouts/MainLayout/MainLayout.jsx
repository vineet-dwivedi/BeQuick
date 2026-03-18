import { Outlet } from "react-router-dom";
import Topbar from "../../components/Topbar/Topbar.jsx";

export default function MainLayout() {
  return (
    <div className="layout">
      <div className="layout__shell">
        <Topbar />
        <main className="layout__content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
