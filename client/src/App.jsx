import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Auth/Login";
import UserManagement from "./components/Admin/UserManagement";
import AppLayout from "./components/common/AppLayout";
import ComingSoon from "./components/common/ComingSoon";
import EmployeeList from "./components/Employees/EmployeeList";
import EmployeeForm from "./components/Employees/EmployeeForm";
import ContractList from "./components/Contracts/ContractList";
import ContractForm from "./components/Contracts/ContractForm";
import ScheduleList from "./components/WorkingSchedule/ScheduleList";
import ScheduleForm from "./components/WorkingSchedule/ScheduleForm";
import AttendanceList from "./components/Attendance/AttendanceList";
import AttendanceForm from "./components/Attendance/AttendanceForm";
import RequestList from "./components/TimeOff/RequestList";
import RequestForm from "./components/TimeOff/RequestForm";
import AllocationList from "./components/TimeOff/AllocationList";
import AllocationForm from "./components/TimeOff/AllocationForm";
import TypeList from "./components/TimeOff/TypeList";
import TypeForm from "./components/TimeOff/TypeForm";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<AppLayout />}>
        <Route path="/" element={<Navigate to="/employees" replace />} />
        <Route path="/employees" element={<EmployeeList />} />
        <Route path="/employees/:id" element={<EmployeeForm />} />
        <Route path="/contracts" element={<ContractList />} />
        <Route path="/contracts/:id" element={<ContractForm />} />
        <Route path="/departments" element={<ComingSoon title="Departments" />} />
        <Route path="/working-schedule" element={<ScheduleList />} />
        <Route path="/working-schedule/:id" element={<ScheduleForm />} />
        <Route path="/attendance" element={<AttendanceList />} />
        <Route path="/attendance/:id" element={<AttendanceForm />} />
        <Route path="/timeoff/dashboard" element={<ComingSoon title="Time Off Dashboard" />} />
        <Route path="/timeoff/requests" element={<RequestList />} />
        <Route path="/timeoff/requests/:id" element={<RequestForm />} />
        <Route path="/timeoff/allocations" element={<AllocationList />} />
        <Route path="/timeoff/allocations/:id" element={<AllocationForm />} />
        <Route path="/timeoff/types" element={<TypeList />} />
        <Route path="/timeoff/types/:id" element={<TypeForm />} />
        <Route path="/payroll" element={<ComingSoon title="Payroll" />} />
        <Route path="/admin/users" element={<UserManagement />} />
      </Route>
    </Routes>
  );
}