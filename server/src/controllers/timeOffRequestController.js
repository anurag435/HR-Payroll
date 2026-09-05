const TimeOffRequest = require("../models/TimeOffRequest");
const TimeOffType = require("../models/TimeOffType");
const TimeOffAllocation = require("../models/TimeOffAllocation");
const Employee = require("../models/Employee");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");

const createRequest = async (req, res) => {
  const employeeId = req.body.employee || req.user.employee?.toString();
  if (!employeeId) {
    throw new ApiError(400, "employee is required (or your account must be linked to one)");
  }

  const [employeeExists, timeOffType] = await Promise.all([
    Employee.exists({ _id: employeeId }),
    TimeOffType.findById(req.body.timeOffType),
  ]);
  if (!employeeExists) throw new ApiError(400, "employee does not exist");
  if (!timeOffType) throw new ApiError(400, "timeOffType does not exist");

  const request = await TimeOffRequest.create({ ...req.body, employee: employeeId });
  return new ApiResponse(201, request, "Time off request submitted").send(res);
};

const listRequests = async (req, res) => {
  const { employee, status, timeOffType } = req.query;
  const filter = {};
  if (employee) filter.employee = employee;
  if (status) filter.status = status;
  if (timeOffType) filter.timeOffType = timeOffType;

  const requests = await TimeOffRequest.find(filter)
    .populate("employee", "name email")
    .populate("timeOffType", "name unit")
    .sort({ createdAt: -1 });

  return new ApiResponse(200, requests, "Time off requests fetched").send(res);
};

const getRequestById = async (req, res) => {
  const request = await TimeOffRequest.findById(req.params.id)
    .populate("employee", "name email")
    .populate("timeOffType", "name unit requiresAllocation");
  if (!request) throw new ApiError(404, "Time off request not found");
  return new ApiResponse(200, request, "Time off request fetched").send(res);
};

const approveRequest = async (req, res) => {
  const request = await TimeOffRequest.findById(req.params.id).populate("timeOffType");
  if (!request) throw new ApiError(404, "Time off request not found");
  if (request.status !== "To Approve") {
    throw new ApiError(409, `This request is already ${request.status}`);
  }

  // A reviewer cannot approve their own request.
  if (req.user.employee && req.user.employee.toString() === request.employee.toString()) {
    throw new ApiError(403, "You cannot approve your own time off request");
  }

  let matchedAllocation = null;

  if (request.timeOffType.requiresAllocation) {
    matchedAllocation = await TimeOffAllocation.findOneAndUpdate(
      {
        employee: request.employee,
        timeOffType: request.timeOffType._id,
        validFrom: { $lte: request.startDate },
        validTo: { $gte: request.endDate },
        $expr: { $gte: [{ $subtract: ["$allocated", "$used"] }, request.duration] },
      },
      { $inc: { used: request.duration } },
      { new: true }
    );

    if (!matchedAllocation) {
      throw new ApiError(
        400,
        "No allocation with sufficient remaining balance covers this request's dates"
      );
    }
  }

  request.status = "Approved";
  request.approvedBy = req.user._id;

  try {
    await request.save();
  } catch (err) {
    
    if (matchedAllocation) {
      await TimeOffAllocation.findByIdAndUpdate(matchedAllocation._id, {
        $inc: { used: -request.duration },
      });
    }
    throw err;
  }

  return new ApiResponse(200, request, "Time off request approved").send(res);
};

const refuseRequest = async (req, res) => {
  const request = await TimeOffRequest.findById(req.params.id);
  if (!request) throw new ApiError(404, "Time off request not found");
  if (request.status !== "To Approve") {
    throw new ApiError(409, `This request is already ${request.status}`);
  }
  if (req.user.employee && req.user.employee.toString() === request.employee.toString()) {
    throw new ApiError(403, "You cannot refuse your own time off request");
  }

  request.status = "Refused";
  request.approvedBy = req.user._id;
  await request.save();

  return new ApiResponse(200, request, "Time off request refused").send(res);
};

module.exports = { createRequest, listRequests, getRequestById, approveRequest, refuseRequest };