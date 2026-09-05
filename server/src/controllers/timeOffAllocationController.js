const TimeOffAllocation = require("../models/TimeOffAllocation");
const Employee = require("../models/Employee");
const TimeOffType = require("../models/TimeOffType");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");

const createAllocation = async (req, res) => {
  const [employeeExists, typeExists] = await Promise.all([
    Employee.exists({ _id: req.body.employee }),
    TimeOffType.exists({ _id: req.body.timeOffType }),
  ]);
  if (!employeeExists) throw new ApiError(400, "employee does not exist");
  if (!typeExists) throw new ApiError(400, "timeOffType does not exist");

  const allocation = await TimeOffAllocation.create(req.body);
  return new ApiResponse(201, allocation, "Allocation created").send(res);
};

const listAllocations = async (req, res) => {
  const { employee, timeOffType } = req.query;
  const filter = {};
  if (employee) filter.employee = employee;
  if (timeOffType) filter.timeOffType = timeOffType;

  const allocations = await TimeOffAllocation.find(filter)
    .populate("employee", "name email")
    .populate("timeOffType", "name unit")
    .sort({ validFrom: -1 });

  return new ApiResponse(200, allocations, "Allocations fetched").send(res);
};

const getAllocationById = async (req, res) => {
  const allocation = await TimeOffAllocation.findById(req.params.id)
    .populate("employee", "name email")
    .populate("timeOffType", "name unit");
  if (!allocation) throw new ApiError(404, "Allocation not found");

  const { ROLE_GROUPS } = require("../constants/roles");
  const isOwner = req.user.employee && req.user.employee.toString() === allocation.employee._id.toString();
  const isHrStaff = ROLE_GROUPS.HR_STAFF.includes(req.user.role);
  if (!isOwner && !isHrStaff) {
    throw new ApiError(403, "You can only view your own allocations");
  }

  return new ApiResponse(200, allocation, "Allocation fetched").send(res);
};

module.exports = { createAllocation, listAllocations, getAllocationById };
