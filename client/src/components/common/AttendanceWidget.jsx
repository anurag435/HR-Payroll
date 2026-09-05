import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../context/useAuth";
import { getMyTodayAttendance, checkIn, checkOut } from "../../services/api";

function formatElapsed(checkInTime) {
  const diffMs = Date.now() - new Date(checkInTime).getTime();
  const totalMinutes = Math.max(Math.floor(diffMs / 60000), 0);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h${minutes.toString().padStart(2, "0")}`;
}

export default function AttendanceWidget() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState(null); // { hasCheckedInToday, hasCheckedOutToday, record }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [, forceTick] = useState(0);
  const intervalRef = useRef(null);

  // Only employees linked to an Employee record can punch in/out.
  if (!user?.employee) return null;

  useEffect(() => {
    getMyTodayAttendance()
      .then(setStatus)
      .catch(() => setStatus(null));
  }, []);

  const isCheckedIn = status?.hasCheckedInToday && !status?.hasCheckedOutToday;

  useEffect(() => {
    if (isCheckedIn) {
      intervalRef.current = setInterval(() => forceTick((n) => n + 1), 60000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isCheckedIn]);

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
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative w-8 h-8 rounded-full border border-surface-border bg-surface-panel flex items-center justify-center hover:bg-surface-raised transition-colors"
        title="Attendance"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.3" className="text-text-secondary" />
          <path d="M8 4.5V8L10.5 9.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" className="text-text-secondary" />
        </svg>
        <span
          className={`absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-surface-panel ${
            isCheckedIn ? "bg-status-active" : "bg-status-inactive"
          }`}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-64 panel p-4 z-20">
          <p className="text-xs text-text-secondary mb-0.5">Welcome back</p>
          <p className="text-base font-semibold mb-3">{user?.name?.split(" ")[0] ?? ""}!</p>

          {error && <p className="text-xs text-red-500 mb-2">{error}</p>}

          {isCheckedIn ? (
            <>
              <div className="flex items-center justify-between text-sm mb-4">
                <span className="text-text-secondary">
                  Since{" "}
                  {new Date(status.record.checkIn).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
                <span className="font-medium">{formatElapsed(status.record.checkIn)}</span>
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