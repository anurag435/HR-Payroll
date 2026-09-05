const ROLES = Object.freeze({
  EMPLOYEE: "Employee",
  HR_MANAGER: "HRManager",
  HR_PAYROLL_USER: "HRPayrollUser",
  HR_PAYROLL_MANAGER: "HRPayrollManager",
  ADMIN: "Admin",
});

const ALL_ROLES = Object.values(ROLES);

module.exports = { ROLES, ALL_ROLES };