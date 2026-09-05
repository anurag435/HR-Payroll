import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../context/useAuth";
import { getActiveSession, checkIn, checkOut } from "../../services/api";

function formatElapsed(checkInTime) {
  const diffMs = Date.now() - new Date(checkInTime).getTime();
  const totalMinutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h${minutes.toString().padStart(2, "0")}`;
}

export default function AttendanceWidget() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [, forceTick] = useState(0);
  const intervalRef = useRef(null);

  const employeeName = user?.employeeName;

  useEffect(() => {
    if (!employeeName) return;
    getActiveSession(employeeName).then(setSession);
  }, [employeeName]);

  useEffect(() => {
    if (session) {
      intervalRef.current = setInterval(() => forceTick((n) => n + 1), 60000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [session]);

  async function handleCheckIn() {
    setLoading(true);
    try {
      const newSession = await checkIn(employeeName);
      setSession(newSession);
    } finally {
      setLoading(false);
    }
  }

  async function handleCheckOut() {
    setLoading(true);
    try {
      await checkOut(employeeName);
      setSession(null);
    } finally {
      setLoading(false);
    }
  }

  if (!employeeName) return null;

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
            session ? "bg-status-active" : "bg-status-inactive"
          }`}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-64 panel p-4 z-20">
          <p className="text-xs text-text-secondary mb-0.5">Welcome back</p>
          <p className="text-base font-semibold mb-3">{employeeName.split(" ")[0]}!</p>

          {session ? (
            <>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-text-secondary">
                  {new Date(session.checkInTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} — Now
                </span>
                <span className="font-medium">{formatElapsed(session.checkInTime)}</span>
              </div>
              <div className="border-t border-surface-border my-3" />
              <div className="flex items-center justify-between text-sm mb-4">
                <span className="text-text-secondary">Today</span>
                <span className="font-medium">{formatElapsed(session.checkInTime)}</span>
              </div>
              <button onClick={handleCheckOut} disabled={loading} className="btn-primary">
                {loading ? "Checking out…" : "Check Out"}
              </button>
            </>
          ) : (
            <button onClick={handleCheckIn} disabled={loading} className="btn-primary">
              {loading ? "Checking in…" : "Check In"}
            </button>
          )}

          <p className="text-xs text-text-muted mt-3">
            Employees can mark attendance from this quick widget and review records from the Attendance module.
          </p>
        </div>
      )}
    </div>
  );
}