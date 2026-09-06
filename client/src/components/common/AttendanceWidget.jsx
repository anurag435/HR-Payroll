import { useEffect, useState } from "react";
import { useAuth } from "../../context/useAuth";
import { getMyTodayAttendance, checkIn, checkOut } from "../../services/api";
import useDismissableDropdown from "../../hooks/useDismissableDropdown";

function formatElapsed(checkInTime) {
  const diffMs = Date.now() - new Date(checkInTime).getTime();
  const totalMinutes = Math.max(Math.floor(diffMs / 60000), 0);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h${minutes.toString().padStart(2, "0")}`;
}

export default function AttendanceWidget() {
  const { user } = useAuth();
  // All hooks must run unconditionally, in the same order, on every render —
  // the "only employees linked to a record can punch in/out" gate used to be
  // an early `return null` placed *before* these hooks, which breaks React's
  // rules of hooks the moment `user` changes (e.g. a different account with
  // a different `employee` link logs in without a full page reload).
  const [open, setOpen, ref] = useDismissableDropdown();
  const [status, setStatus] = useState(null); // { hasCheckedInToday, hasCheckedOutToday, record }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [, forceTick] = useState(0);

  const hasEmployeeRecord = Boolean(user?.employee);

  useEffect(() => {
    if (!hasEmployeeRecord) return;
    getMyTodayAttendance()
      .then(setStatus)
      .catch(() => setStatus(null));
  }, [hasEmployeeRecord]);

  const isCheckedIn = status?.hasCheckedInToday && !status?.hasCheckedOutToday;

  useEffect(() => {
    if (!isCheckedIn) return undefined;
    const id = setInterval(() => forceTick((n) => n + 1), 60000);
    return () => clearInterval(id);
  }, [isCheckedIn]);

  // Only employees linked to an Employee record can punch in/out.
  if (!hasEmployeeRecord) return null;

  async function handleCheckIn() {
    setLoading(true);
    setError("");
    try {
      const record = await checkIn();
      setStatus({ hasCheckedInToday: true, hasCheckedOutToday: false, record });
    } catch (err) {
      setError(err.message || "Failed to check in.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCheckOut() {
    setLoading(true);
    setError("");
    try {
      const record = await checkOut();
      setStatus({ hasCheckedInToday: true, hasCheckedOutToday: true, record });
    } catch (err) {
      setError(err.message || "Failed to check out.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="icon-btn"
        title="Attendance"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.3" />
          <path d="M8 4.5V8L10.5 9.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
        <span
          className={`absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-surface-panel ${
            isCheckedIn ? "bg-status-active" : "bg-status-inactive"
          }`}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-64 panel p-4 z-20 animate-pop">
          <p className="text-xs text-text-secondary mb-0.5">Welcome back</p>
          <p className="text-base font-semibold mb-3">{user?.name?.split(" ")[0] ?? ""}!</p>

          {error && <p className="text-xs text-status-danger mb-2">{error}</p>}

          {isCheckedIn ? (
            <>
              <div className="flex items-center justify-between text-sm mb-4">
                <span className="text-text-secondary">
                  Since{" "}
                  {new Date(status.record.checkIn).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
                <span className="font-medium tabular-nums">{formatElapsed(status.record.checkIn)}</span>
              </div>
              <button onClick={handleCheckOut} disabled={loading} className="btn-primary">
                {loading ? "Checking out…" : "Check Out"}
              </button>
            </>
          ) : status?.hasCheckedOutToday ? (
            <p className="text-sm text-text-secondary">
              You've completed today's attendance ({status.record.workedHours}h worked).
            </p>
          ) : (
            <button onClick={handleCheckIn} disabled={loading} className="btn-primary">
              {loading ? "Checking in…" : "Check In"}
            </button>
          )}

          <p className="text-xs text-text-muted mt-3">Review full history in the Attendance module.</p>
        </div>
      )}
    </div>
  );
}
