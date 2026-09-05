import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getAttendanceById } from "../../services/api";

export default function AttendanceForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id === "new") {
      setRecord(null);
      setLoading(false);
      return;
    }
    getAttendanceById(id).then((data) => {
      setRecord(data);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return <p className="text-sm text-text-muted text-center py-16">Loading attendance record…</p>;
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <button onClick={() => navigate("/attendance")} className="text-sm text-accent hover:text-accent-hover mb-4">
        ← Back to Attendance
      </button>

      <div className="panel p-6 mb-6">
        <h1 className="text-lg font-semibold">
          Attendance {record ? `/ ${record.employeeName} / ${record.date}` : "/ New"}
        </h1>
        <p className="text-sm text-text-secondary mb-6">Form view of one attendance record</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-text-secondary mb-1.5">Employee</label>
            <input defaultValue={record?.employeeName ?? ""} className="field-input" />
          </div>
          <div>
            <label className="block text-xs text-text-secondary mb-1.5">Department</label>
            <input defaultValue={record?.department ?? ""} className="field-input" />
          </div>
          <div>
            <label className="block text-xs text-text-secondary mb-1.5">Check In</label>
            <input defaultValue={record?.checkIn ?? ""} placeholder="—" className="field-input" />
          </div>
          <div>
            <label className="block text-xs text-text-secondary mb-1.5">Manager</label>
            <input defaultValue={record?.manager ?? ""} className="field-input" />
          </div>
          <div>
            <label className="block text-xs text-text-secondary mb-1.5">Check Out</label>
            <input defaultValue={record?.checkOut ?? ""} placeholder="—" className="field-input" />
          </div>
          <div>
            <label className="block text-xs text-text-secondary mb-1.5">Status</label>
            <input
              defaultValue={record?.status === "present" ? "Present" : record?.status === "absent" ? "Absent" : ""}
              className="field-input"
            />
          </div>
          <div>
            <label className="block text-xs text-text-secondary mb-1.5">Worked Hours</label>
            <input defaultValue={record ? record.workedHours.toFixed(2) : ""} className="field-input" />
          </div>
          <div>
            <label className="block text-xs text-text-secondary mb-1.5">Overtime</label>
            <input defaultValue={record ? `${record.overtime.toFixed(2)} hrs` : ""} className="field-input" />
          </div>
        </div>
      </div>

      <div className="panel p-6">
        <h2 className="text-sm font-semibold mb-2">Notes</h2>
        <p className="text-sm text-text-secondary">
          {record?.notes ?? "System-generated from check in/out or manually corrected by an authorized user."}
        </p>
      </div>

      <p className="text-xs text-text-muted mt-4">
        Worked hours and overtime should be easy to read because they may later influence payroll or reporting.
      </p>
    </div>
  );
}