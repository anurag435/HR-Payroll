import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Auth/Login";
import UserManagement from "./components/Admin/UserManagement";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/admin/users" element={<UserManagement />} />

      {/* Placeholder landing spot until the post-login employee/dashboard
          home page mockup is added. */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Future routes as you send more pages, e.g.:
          <Route path="/employees" element={<EmployeeList />} />
          <Route path="/employees/:id" element={<EmployeeForm />} />
          <Route path="/contracts" element={<ContractList />} />
          <Route path="/attendance" element={<AttendanceList />} />
          <Route path="/timeoff/requests" element={<TimeOffRequests />} />
          <Route path="/payroll/payruns" element={<PayrunList />} />
      */}
    </Routes>
  );
}