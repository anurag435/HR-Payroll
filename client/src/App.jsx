import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Auth/Login";
import UserManagement from "./components/Admin/UserManagement";
import AppLayout from "./components/common/AppLayout";
import ComingSoon from "./components/common/ComingSoon";
import RequireRole from "./components/common/RequireRole";
import EmployeeList from "./components/Employees/EmployeeList";
import EmployeeForm from "./components/Employees/EmployeeForm";
import ContractList from "./components/Contracts/ContractList";
import ContractForm from "./components/Contracts/ContractForm";
import ScheduleList from "./components/WorkingSchedule/ScheduleList";
import ScheduleForm from "./components/WorkingSchedule/ScheduleForm";
import Departments from "./components/Departments/Departments";
import { ROLE_GROUPS, homeRouteForRole } from "./constants/roles";
import { useAuth } from "./context/useAuth";

function RoleHome() {
  const { user } = useAuth();
  return <Navigate to={homeRouteForRole(user?.role)} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<AppLayout />}>
        <Route path="/" element={<RoleHome />} />

        <Route
          path="/employees"
          element={
            <RequireRole roles={ROLE_GROUPS.HR_STAFF}>
              <EmployeeList />
            </RequireRole>
          }
        />
        <Route
          path="/employees/:id"
          element={
            <RequireRole roles={ROLE_GROUPS.HR_STAFF}>
              <EmployeeForm />
            </RequireRole>
          }
        />
        <Route
          path="/contracts"
          element={
            <RequireRole roles={ROLE_GROUPS.HR_STAFF}>
              <ContractList />
            </RequireRole>
          }
        />
        <Route
          path="/contracts/:id"
          element={
            <RequireRole roles={ROLE_GROUPS.HR_STAFF}>
              <ContractForm />
            </RequireRole>
          }
        />
        <Route
          path="/departments"
          element={
            <RequireRole roles={ROLE_GROUPS.HR_STAFF}>
              <Departments />
            </RequireRole>
          }
        />
        <Route
          path="/working-schedule"
          element={
            <RequireRole roles={ROLE_GROUPS.HR_STAFF}>
              <ScheduleList />
            </RequireRole>
          }
        />
        <Route
          path="/working-schedule/:id"
          element={
            <RequireRole roles={ROLE_GROUPS.HR_STAFF}>
              <ScheduleForm />
            </RequireRole>
          }
        />

        {/* Every role can check their own attendance / submit time off,
            so these stay open — the backend itself scopes the data to
            "own records only" for anyone outside HR_STAFF. */}
        <Route path="/attendance" element={<ComingSoon title="Attendance" />} />
        <Route path="/timeoff/requests" element={<ComingSoon title="Time Off Requests" />} />
        <Route path="/timeoff/allocations" element={<ComingSoon title="Time Off Allocations" />} />
        <Route path="/timeoff/types" element={<ComingSoon title="Time Off Types" />} />

        <Route
          path="/payroll"
          element={
            <RequireRole roles={ROLE_GROUPS.PAYROLL_STAFF}>
              <ComingSoon title="Payroll" />
            </RequireRole>
          }
        />
        <Route
          path="/admin/users"
          element={
            <RequireRole roles={ROLE_GROUPS.ADMIN_ONLY}>
              <UserManagement />
            </RequireRole>
          }
        />
      </Route>
    </Routes>
  );
}