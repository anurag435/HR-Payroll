const mongoose = require("mongoose");
const Employee = require("../models/Employee");
const Contract = require("../models/Contract");
const Attendance = require("../models/Attendance");
const TimeOffRequest = require("../models/TimeOffRequest");
const Payrun = require("../models/Payrun");
const Payslip = require("../models/Payslip");
const ApiResponse = require("../utils/ApiResponse");
const { startOfDay } = require("../utils/dateHelpers");

const getSummary = async (req, res) => {
  const { department, status } = req.query;
  const month = req.query.month || new Date().toISOString().slice(0, 7);

  const employeeFilter = {};
  if (department) employeeFilter.department = new mongoose.Types.ObjectId(department);
  if (status) employeeFilter.status = status;

  const [monthStart, monthEnd] = monthBounds(month);

  const scopedEmployeeIds = await Employee.find(employeeFilter).distinct("_id");

  const [
    totalActiveEmployees,
    presentTodayCount,
    pendingTimeOff,
    contractsExpiringSoon,
    headcountByDepartment,
    attendanceTrend,
    timeOffByType,
    employeeStatusSplit,
    latestRelevantPayrun,
  ] = await Promise.all([
    Employee.countDocuments({ ...employeeFilter, status: "Active" }),
    Attendance.countDocuments({
      employee: { $in: scopedEmployeeIds },
      date: startOfDay(),
      checkIn: { $ne: null },
    }),
    TimeOffRequest.countDocuments({
      employee: { $in: scopedEmployeeIds },
      status: "To Approve",
    }),
    Contract.countDocuments({
      employee: { $in: scopedEmployeeIds },
      status: "Active",
      endDate: { $ne: null, $gte: new Date(), $lte: addDays(new Date(), 30) },
    }),
    Employee.aggregate([
      { $match: { ...employeeFilter, status: "Active" } },
      { $lookup: { from: "departments", localField: "department", foreignField: "_id", as: "dept" } },
      { $unwind: { path: "$dept", preserveNullAndEmptyArrays: true } },
      { $group: { _id: { $ifNull: ["$dept.name", "Unassigned"] }, count: { $sum: 1 } } },
      { $project: { _id: 0, department: "$_id", count: 1 } },
      { $sort: { department: 1 } },
    ]),
    attendanceTrendLast7Days(scopedEmployeeIds),
    TimeOffRequest.aggregate([
      { $match: { employee: { $in: scopedEmployeeIds }, createdAt: { $gte: monthStart, $lt: monthEnd } } },
      { $lookup: { from: "timeofftypes", localField: "timeOffType", foreignField: "_id", as: "type" } },
      { $unwind: "$type" },
      { $group: { _id: "$type.name", count: { $sum: 1 } } },
      { $project: { _id: 0, type: "$_id", count: 1 } },
      { $sort: { type: 1 } },
    ]),
    Employee.aggregate([
      { $match: employeeFilter },
      { $group: { _id: "$status", count: { $sum: 1 } } },
      { $project: { _id: 0, status: "$_id", count: 1 } },
    ]),
    Payrun.findOne({ "period.startDate": { $lt: monthEnd }, "period.endDate": { $gte: monthStart } }).sort({
      createdAt: -1,
    }),
  ]);

  let payrollByDepartment = [];
  let payrollCostThisPeriod = 0;

  if (latestRelevantPayrun) {
    const payslips = await Payslip.find({ payrun: latestRelevantPayrun._id })
      .populate({ path: "employee", select: "department", populate: { path: "department", select: "name" } });

    const byDept = {};
    for (const p of payslips) {
      if (department && (!p.employee?.department || p.employee.department._id.toString() !== department)) continue;
      const deptName = p.employee?.department?.name || "Unassigned";
      byDept[deptName] = (byDept[deptName] || 0) + p.net;
      payrollCostThisPeriod += p.net;
    }
    payrollByDepartment = Object.entries(byDept).map(([department, total]) => ({
      department,
      total: Math.round(total * 100) / 100,
    }));
  }

  return new ApiResponse(
    200,
    {
      kpis: {
        totalActiveEmployees,
        presentToday: { count: presentTodayCount, total: totalActiveEmployees },
        pendingTimeOffRequests: pendingTimeOff,
        contractsExpiringSoon,
        payrollCostThisPeriod: Math.round(payrollCostThisPeriod * 100) / 100,
      },
      charts: {
        headcountByDepartment,
        attendanceTrend,
        timeOffByType,
        payrollByDepartment,
        employeeStatusSplit,
      },
      appliedFilters: { department: department || null, status: status || null, month },
    },
    "Dashboard summary fetched"
  ).send(res);
};

function monthBounds(monthStr) {
  const [y, m] = monthStr.split("-").map(Number);
  const start = new Date(y, m - 1, 1);
  const end = new Date(y, m, 1);
  return [start, end];
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

async function attendanceTrendLast7Days(employeeIds) {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    days.push(startOfDay(addDays(new Date(), -i)));
  }
  const counts = await Promise.all(
    days.map((day) =>
      Attendance.countDocuments({ employee: { $in: employeeIds }, date: day, checkIn: { $ne: null } })
    )
  );
  return days.map((day, i) => ({ date: day.toISOString().slice(0, 10), present: counts[i] }));
}

module.exports = { getSummary };