import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Auth/Login";
import UserManagement from "./components/Admin/UserManagement";
import AppLayout from "./components/common/AppLayout";
import ComingSoon from "./components/common/ComingSoon";
import EmployeeList from "./components/Employees/EmployeeList";
import EmployeeForm from "./components/Employees/EmployeeForm";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* Everything below shares the same persistent TopNav via AppLayout */}
      <Route element={<AppLayout />}>
        <Route path="/" element={<Navigate to="/employees" replace />} />
        <Route path="/employees" element={<EmployeeList />} />
        <Route path="/employees/:id" element={<EmployeeForm />} />
        <Route path="/contracts" element={<ComingSoon title="Contracts" />} />
        <Route path="/departments" element={<ComingSoon title="Departments" />} />
        <Route path="/working-schedule" element={<ComingSoon title="Working Schedule" />} />
        <Route path="/attendance" element={<ComingSoon title="Attendance" />} />
        <Route path="/timeoff/requests" element={<ComingSoon title="Time Off Requests" />} />
        <Route path="/timeoff/allocations" element={<ComingSoon title="Time Off Allocations" />} />
        <Route path="/timeoff/types" element={<ComingSoon title="Time Off Types" />} />
        <Route path="/payroll" element={<ComingSoon title="Payroll" />} />
        <Route path="/admin/users" element={<UserManagement />} />
      </Route>
    </Routes>
  );
}