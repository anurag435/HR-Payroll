// Single source of truth for employee records — the Admin > User
// Management dropdown and the Employees Kanban/List page both read
// from this same list, so a person only ever needs to exist once.
export const mockEmployees = [
  { id: "e1", name: "Aarav Mehta", workEmail: "aarav@company.com", jobPosition: "Payroll Specialist", department: "Finance", status: "active" },
  { id: "e2", name: "Sara Khan", workEmail: "sara@company.com", jobPosition: "HR Officer", department: "HR", status: "active" },
  { id: "e3", name: "John Dsouza", workEmail: "john@company.com", jobPosition: "Developer", department: "Engineering", status: "active" },
  { id: "e4", name: "Neha Patel", workEmail: "neha@company.com", jobPosition: "Recruiter", department: "HR", status: "active" },
  { id: "e5", name: "Maya Shah", workEmail: "maya@company.com", jobPosition: "HR Manager", department: "Human Resources", status: "active" },
  { id: "e6", name: "Rohan Patel", workEmail: "rohan@company.com", jobPosition: "Operations Associate", department: "Operations", status: "active" },
  { id: "e7", name: "Nisha Rao", workEmail: "nisha@company.com", jobPosition: "Payroll Manager", department: "Payroll", status: "active" },
  { id: "e8", name: "Karan Verma", workEmail: "karan@company.com", jobPosition: "Software Engineer", department: "Engineering", status: "active" },
];