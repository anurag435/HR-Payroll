import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { roleLabel, ROLE_GROUPS } from "../../constants/roles";
import AttendanceWidget from "./AttendanceWidget";

function useDismissableDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    function handlePointerDown(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    function handleKeyDown(e) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return [open, setOpen, ref];
}

function NavDropdown({ label, items, active }) {
  const [open, setOpen, ref] = useDismissableDropdown();

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
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
                onClick={() => setOpen(false)}
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
  const [profileOpen, setProfileOpen, profileRef] = useDismissableDropdown();

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  const linkClass = ({ isActive }) =>
    `px-3 py-2 text-sm rounded-md transition-colors ${
      isActive ? "text-accent font-medium" : "text-text-secondary hover:text-text-primary"
    }`;

  const displayName = user?.name ?? "Guest";
  const initial = displayName[0]?.toUpperCase() ?? "?";
  const isAdmin = user?.role === "Admin";
  const canManageHR = ROLE_GROUPS.HR_STAFF.includes(user?.role);
  const canSeePayroll = ROLE_GROUPS.PAYROLL_STAFF.includes(user?.role);

  return (
    <header className="sticky top-0 z-10 bg-surface-panel border-b border-surface-border">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to={canManageHR ? "/employees" : "/attendance"} className="w-7 h-7 rounded-md bg-accent text-white flex items-center justify-center text-xs font-bold shrink-0">
            HR
          </Link>

          <nav className="flex items-center gap-1">
            {canManageHR && (
              <NavDropdown
                label="Employees"
                items={[
                  { label: "Employees", to: "/employees" },
                  { label: "Contracts", to: "/contracts" },
                  { label: "Departments", to: "/departments" },
                  { label: "Working Schedule", to: "/working-schedule" },
                ]}
              />
            )}
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
            {canSeePayroll && (
              <NavDropdown
                label="Payroll"
                items={[
                  { label: "Payruns", to: "/payroll" },
                  { label: "Payslips", to: "/payroll/payslips" },
                ]}
              />
            )}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <AttendanceWidget />
          <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => setProfileOpen((o) => !o)}
            className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-full hover:bg-surface-raised transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-accent/15 text-accent flex items-center justify-center text-xs font-semibold">
              {initial}
            </div>
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-full mt-1 w-48 panel py-1 z-20">
              <div className="px-4 py-2 border-b border-surface-border">
                <p className="text-sm font-medium truncate">{displayName}</p>
                <p className="text-xs text-text-muted truncate">{user?.email}</p>
                <p className="text-xs text-accent truncate">{roleLabel(user?.role)}</p>
              </div>
              {isAdmin && (
                <Link
                  to="/admin/users"
                  onClick={() => setProfileOpen(false)}
                  className="block px-4 py-2 text-sm text-text-primary hover:bg-surface-raised"
                >
                  User Management
                </Link>
              )}
              <button
                onClick={() => {
                  setProfileOpen(false);
                  handleLogout();
                }}
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