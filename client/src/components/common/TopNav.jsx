import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import AttendanceWidget from "./AttendanceWidget";

function NavDropdown({ label, items, active }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        className={`flex items-center gap-1 px-3 py-2 text-sm rounded-md transition-colors ${
          active ? "text-accent font-medium" : "text-text-secondary hover:text-text-primary"
        }`}
      >
        {label}
        <svg width="10" height="10" viewBox="0 0 10 10" className="mt-px">
          <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <div className="absolute left-0 top-full pt-1 w-48 z-20">
          <div className="panel py-1">
            {items.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="block px-4 py-2 text-sm text-text-primary hover:bg-surface-raised"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function TopNav() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  const linkClass = ({ isActive }) =>
    `px-3 py-2 text-sm rounded-md transition-colors ${
      isActive ? "text-accent font-medium" : "text-text-secondary hover:text-text-primary"
    }`;

  return (
    <header className="sticky top-0 z-10 bg-surface-panel border-b border-surface-border">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/employees" className="w-7 h-7 rounded-md bg-accent text-white flex items-center justify-center text-xs font-bold shrink-0">
            HR
          </Link>

          <nav className="flex items-center gap-1">
            <NavDropdown
              label="Employees"
              items={[
                { label: "Employees", to: "/employees" },
                { label: "Contracts", to: "/contracts" },
                { label: "Departments", to: "/departments" },
                { label: "Working Schedule", to: "/working-schedule" },
              ]}
            />
            <NavLink to="/attendance" className={linkClass}>
              Attendance
            </NavLink>
            <NavDropdown
              label="Time Off"
              items={[
                { label: "Requests", to: "/timeoff/requests" },
                { label: "Allocations", to: "/timeoff/allocations" },
                { label: "Time Off Types", to: "/timeoff/types" },
              ]}
            />
            <NavLink to="/payroll" className={linkClass}>
              Payroll
            </NavLink>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <AttendanceWidget />
          <div className="relative">
          <button
            onClick={() => setProfileOpen((o) => !o)}
            className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-full hover:bg-surface-raised transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-accent/15 text-accent flex items-center justify-center text-xs font-semibold">
              {user?.employeeName?.[0] ?? "?"}
            </div>
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-full mt-1 w-48 panel py-1 z-20">
              <div className="px-4 py-2 border-b border-surface-border">
                <p className="text-sm font-medium truncate">{user?.employeeName ?? "Guest"}</p>
                <p className="text-xs text-text-muted truncate">{user?.workEmail}</p>
              </div>
              {user?.role === "admin" && (
                <Link
                  to="/admin/users"
                  onClick={() => setProfileOpen(false)}
                  className="block px-4 py-2 text-sm text-text-primary hover:bg-surface-raised"
                >
                  User Management
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-surface-raised"
              >
                Log out
              </button>
            </div>
                    )}
          </div>
        </div>
      </div>
    </header>
  );
}