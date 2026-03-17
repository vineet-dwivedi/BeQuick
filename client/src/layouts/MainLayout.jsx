import { Outlet } from "react-router-dom";
import Topbar from "../components/Topbar.jsx";

export default function MainLayout() {
  return (
    <div className="layout">
      <Topbar />
      <Outlet />
    </div>
  );
}
