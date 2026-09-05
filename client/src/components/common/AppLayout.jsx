import { Outlet } from "react-router-dom";
import TopNav from "./TopNav";

// This layout wraps every authenticated page. Because it renders
// <Outlet /> instead of a specific page, the TopNav component itself
// never unmounts when you navigate between /employees, /payroll, etc —
// only the content below it swaps out. That's what makes the nav feel
// stable and consistent everywhere.
export default function AppLayout() {
  return (
    <div className="min-h-screen bg-surface">
      <TopNav />
      <Outlet />
    </div>
  );
}