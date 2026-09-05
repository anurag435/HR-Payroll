const Attendance = require("../models/Attendance");
const Employee = require("../models/Employee");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const { startOfDay } = require("../utils/dateHelpers");

function requireLinkedEmployee(req) {
  if (!req.user.employee) {
    throw new ApiError(400, "Your account isn't linked to an Employee record");
  }
  return req.user.employee.toString();
}

const getMyTodayStatus = async (req, res) => {
  const employeeId = requireLinkedEmployee(req);
  const today = startOfDay();

  const record = await Attendance.findOne({ employee: employeeId, date: today });

  return new ApiResponse(200, {
    hasCheckedInToday: !!record?.checkIn,
    hasCheckedOutToday: !!record?.checkOut,
    record: record || null,
  }, "Today's attendance status fetched").send(res);
};

const checkIn = async (req, res) => {
  const employeeId = requireLinkedEmployee(req);
  const today = startOfDay();

  let record = await Attendance.findOne({ employee: employeeId, date: today });

  if (record && record.checkIn) {
    throw new ApiError(409, "Already checked in today. Use Check Out instead.");
  }

  if (!record) {
    record = new Attendance({ employee: employeeId, date: today });
  }
  record.checkIn = new Date();
  await record.save();

  return new ApiResponse(200, record, "Checked in successfully").send(res);
};

const checkOut = async (req, res) => {
  const employeeId = requireLinkedEmployee(req);
  const today = startOfDay();

  const record = await Attendance.findOne({ employee: employeeId, date: today });

  if (!record || !record.checkIn) {
    throw new ApiError(400, "You haven't checked in today yet");
  }
  if (record.checkOut) {
    throw new ApiError(409, "Already checked out today");
  }

  record.checkOut = new Date();
  await record.save();

  return new ApiResponse(200, record, "Checked out successfully").send(res);
};

const listMyAttendance = async (req, res) => {
  const employeeId = requireLinkedEmployee(req);
  const records = await Attendance.find({ employee: employeeId }).sort({ date: -1 });
  return new ApiResponse(200, records, "Your attendance fetched").send(res);
};

const listAttendance = async (req, res) => {
  const { employee, from, to, status, page = 1, limit = 30 } = req.query;

  const filter = {};
  if (employee) filter.employee = employee;
  if (status) filter.status = status;
  if (from || to) {
    filter.date = {};
    if (from) filter.date.$gte = startOfDay(new Date(from));
    if (to) filter.date.$lte = startOfDay(new Date(to));
  }

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit, 10) || 30, 1), 200);

  const [records, total] = await Promise.all([
    Attendance.find(filter)
      .populate("employee", "name email")
      .sort({ date: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Attendance.countDocuments(filter),
  ]);

  return new ApiResponse(200, {
    records,
    pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
  }, "Attendance fetched").send(res);
};

const getAttendanceById = async (req, res) => {
  const record = await Attendance.findById(req.params.id).populate("employee", "name email");
  if (!record) throw new ApiError(404, "Attendance record not found");
  return new ApiResponse(200, record, "Attendance record fetched").send(res);
};

const createManualAttendance = async (req, res) => {
  const employeeExists = await Employee.exists({ _id: req.body.employee });
  if (!employeeExists) throw new ApiError(400, "employee does not exist");

  const date = startOfDay(req.body.date);
  const existing = await Attendance.findOne({ employee: req.body.employee, date });
  if (existing) {
    throw new ApiError(409, "An attendance record already exists for this employee on this date. Use update instead.");
  }

  const record = await Attendance.create({ ...req.body, date, isManualEdit: true });
  return new ApiResponse(201, record, "Attendance record created").send(res);
};

const updateAttendance = async (req, res) => {
  const record = await Attendance.findById(req.params.id);
  if (!record) throw new ApiError(404, "Attendance record not found");

  Object.assign(record, req.body, { isManualEdit: true });
  await record.save(); // triggers workedHours recompute

  return new ApiResponse(200, record, "Attendance record updated").send(res);
};

module.exports = {
  getMyTodayStatus,
  checkIn,
  checkOut,
  listMyAttendance,
  listAttendance,
  getAttendanceById,
  createManualAttendance,
  updateAttendance,
};
