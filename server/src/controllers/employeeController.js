const Employee = require("../models/Employee");
const Department = require("../models/Department");
const WorkingSchedule = require("../models/WorkingSchedule");
const Contract = require("../models/Contract");
const Attendance = require("../models/Attendance");
const TimeOffRequest = require("../models/TimeOffRequest");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");

async function assertReferencesExist({ department, manager, workingSchedule }) {
  const checks = [];
  if (department) {
    checks.push(
      Department.exists({ _id: department }).then((found) => {
        if (!found) throw new ApiError(400, "department does not exist");
      })
    );
  }
  if (manager) {
    checks.push(
      Employee.exists({ _id: manager }).then((found) => {
        if (!found) throw new ApiError(400, "manager does not exist");
      })
    );
  }
  if (workingSchedule) {
    checks.push(
      WorkingSchedule.exists({ _id: workingSchedule }).then((found) => {
        if (!found) throw new ApiError(400, "workingSchedule does not exist");
      })
    );
  }
  await Promise.all(checks);
}

const createEmployee = async (req, res) => {
  await assertReferencesExist(req.body);
  const employee = await Employee.create(req.body);
  return new ApiResponse(201, employee, "Employee created").send(res);
};

const listEmployees = async (req, res) => {
  const { department, status, search, page = 1, limit = 20 } = req.query;

  const filter = {};
  if (department) filter.department = department;
  if (status) filter.status = status;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100); // cap to avoid a client asking for 1M rows

  const [employees, total] = await Promise.all([
    Employee.find(filter)
      .populate("department", "name")
      .populate("workingSchedule", "name")
      .sort({ name: 1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Employee.countDocuments(filter),
  ]);

  return new ApiResponse(200, {
    employees,
    pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
  }, "Employees fetched").send(res);
};

const getEmployeeById = async (req, res) => {
  const employee = await Employee.findById(req.params.id)
    .populate("department", "name")
    .populate("manager", "name")
    .populate("workingSchedule", "name totalWeeklyHours");

  if (!employee) throw new ApiError(404, "Employee not found");

  const [contractsCount, attendanceCount, timeOffCount] = await Promise.all([
    Contract.countDocuments({ employee: employee._id }),
    Attendance.countDocuments({ employee: employee._id }),
    TimeOffRequest.countDocuments({ employee: employee._id }),
  ]);

  return new ApiResponse(200, {
    employee,
    relatedCounts: { contracts: contractsCount, attendance: attendanceCount, timeOff: timeOffCount },
  }, "Employee fetched").send(res);
};

const updateEmployee = async (req, res) => {
  await assertReferencesExist(req.body);

  const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!employee) throw new ApiError(404, "Employee not found");

  return new ApiResponse(200, employee, "Employee updated").send(res);
};

const archiveEmployee = async (req, res) => {
  const employee = await Employee.findByIdAndUpdate(
    req.params.id,
    { status: "Inactive" },
    { new: true }
  );
  if (!employee) throw new ApiError(404, "Employee not found");
  return new ApiResponse(200, employee, "Employee archived").send(res);
};

const getMyProfile = async (req, res) => {
  if (!req.user.employee) {
    throw new ApiError(404, "No employee record is linked to this account");
  }
  req.params.id = req.user.employee.toString();
  return getEmployeeById(req, res);
};

module.exports = {
  createEmployee,
  listEmployees,
  getEmployeeById,
  getMyProfile,
  updateEmployee,
  archiveEmployee,
};
