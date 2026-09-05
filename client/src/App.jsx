import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Auth/Login";
import UserManagement from "./components/Admin/UserManagement";
import AppLayout from "./components/common/AppLayout";
import RequireRole from "./components/common/RequireRole";
import EmployeeList from "./components/Employees/EmployeeList";
import EmployeeForm from "./components/Employees/EmployeeForm";
import ContractList from "./components/Contracts/ContractList";
import ContractForm from "./components/Contracts/ContractForm";
import ScheduleList from "./components/WorkingSchedule/ScheduleList";
import ScheduleForm from "./components/WorkingSchedule/ScheduleForm";
import Departments from "./components/Departments/Departments";
import AttendanceList from "./components/Attendance/AttendanceList";
import AttendanceForm from "./components/Attendance/AttendanceForm";
import RequestList from "./components/TimeOff/RequestList";
import RequestForm from "./components/TimeOff/RequestForm";
import AllocationList from "./components/TimeOff/AllocationList";
import AllocationForm from "./components/TimeOff/AllocationForm";
import TypeList from "./components/TimeOff/TypeList";
import TypeForm from "./components/TimeOff/TypeForm";
import PayrunList from "./components/Payroll/PayrunList";
import PayrunWizard from "./components/Payroll/PayrunWizard";
import PayrunDetail from "./components/Payroll/PayrunDetail";
import PayslipList from "./components/Payroll/PayslipList";
import PayslipDetail from "./components/Payroll/PayslipDetail";
import SalaryRuleList from "./components/Payroll/SalaryRuleList";
import SalaryRuleForm from "./components/Payroll/SalaryRuleForm";
import SalaryStructureList from "./components/Payroll/SalaryStructureList";
import SalaryStructureForm from "./components/Payroll/SalaryStructureForm";
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
        <Route path="/attendance" element={<AttendanceList />} />
        <Route
          path="/attendance/new"
          element={
            <RequireRole roles={ROLE_GROUPS.HR_STAFF}>
              <AttendanceForm />
            </RequireRole>
          }
        />
        <Route
          path="/attendance/:id"
          element={
            <RequireRole roles={ROLE_GROUPS.HR_STAFF}>
              <AttendanceForm />
            </RequireRole>
          }
        />

        <Route path="/timeoff/requests" element={<RequestList />} />
        <Route path="/timeoff/requests/new" element={<RequestForm />} />

        <Route path="/timeoff/allocations" element={<AllocationList />} />
        <Route
          path="/timeoff/allocations/new"
          element={
            <RequireRole roles={ROLE_GROUPS.HR_STAFF}>
              <AllocationForm />
            </RequireRole>
          }
        />

        <Route
          path="/timeoff/types"
          element={
            <RequireRole roles={ROLE_GROUPS.HR_STAFF}>
              <TypeList />
            </RequireRole>
          }
        />
        <Route
          path="/timeoff/types/new"
          element={
            <RequireRole roles={ROLE_GROUPS.HR_STAFF}>
              <TypeForm />
            </RequireRole>
          }
        />
        <Route
          path="/timeoff/types/:id"
          element={
            <RequireRole roles={ROLE_GROUPS.HR_STAFF}>
              <TypeForm />
            </RequireRole>
          }
        />

        {/* ---- Payroll: Payruns & Payslips ---------------------------- */}
        <Route
          path="/payroll"
          element={
            <RequireRole roles={ROLE_GROUPS.PAYROLL_STAFF}>
              <PayrunList />
            </RequireRole>
          }
        />
        <Route
          path="/payroll/payruns/new"
          element={
            <RequireRole roles={ROLE_GROUPS.PAYROLL_STAFF}>
              <PayrunWizard />
            </RequireRole>
          }
        />
        <Route
          path="/payroll/payruns/:id"
          element={
            <RequireRole roles={ROLE_GROUPS.PAYROLL_STAFF}>
              <PayrunDetail />
            </RequireRole>
          }
        />
        <Route
          path="/payroll/payslips"
          element={
            <RequireRole roles={ROLE_GROUPS.PAYROLL_STAFF}>
              <PayslipList />
            </RequireRole>
          }
        />
        {/* Not role-gated on purpose: an Employee can open their own payslip
            (e.g. via a link from elsewhere); the backend itself 403s anyone
            trying to view a payslip that isn't theirs and isn't payroll staff. */}
        <Route path="/payroll/payslips/:id" element={<PayslipDetail />} />

        {/* ---- Payroll: Salary Structure / Rule config -------------------
            Lists are readable by all PAYROLL_STAFF (HRPayrollUser included,
            per spec's read-only access); create/edit is PAYROLL_CONFIG only
            (HRPayrollManager/Admin) — matches the backend route guards. */}
        <Route
          path="/payroll/salary-rules"
          element={
            <RequireRole roles={ROLE_GROUPS.PAYROLL_STAFF}>
              <SalaryRuleList />
            </RequireRole>
          }
        />
        <Route
          path="/payroll/salary-rules/new"
          element={
            <RequireRole roles={ROLE_GROUPS.PAYROLL_CONFIG}>
              <SalaryRuleForm />
            </RequireRole>
          }
        />
        <Route
          path="/payroll/salary-rules/:id"
          element={
            <RequireRole roles={ROLE_GROUPS.PAYROLL_CONFIG}>
              <SalaryRuleForm />
            </RequireRole>
          }
        />
        <Route
          path="/payroll/salary-structures"
          element={
            <RequireRole roles={ROLE_GROUPS.PAYROLL_STAFF}>
              <SalaryStructureList />
            </RequireRole>
          }
        />
        <Route
          path="/payroll/salary-structures/new"
          element={
            <RequireRole roles={ROLE_GROUPS.PAYROLL_CONFIG}>
              <SalaryStructureForm />
            </RequireRole>
          }
        />
        <Route
          path="/payroll/salary-structures/:id"
          element={
            <RequireRole roles={ROLE_GROUPS.PAYROLL_CONFIG}>
              <SalaryStructureForm />
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
