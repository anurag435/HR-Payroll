const TimeOffType = require("../models/TimeOffType");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");

const createTimeOffType = async (req, res) => {
  const type = await TimeOffType.create(req.body);
  return new ApiResponse(201, type, "Time off type created").send(res);
};

const listTimeOffTypes = async (req, res) => {
  const types = await TimeOffType.find().sort({ name: 1 });
  return new ApiResponse(200, types, "Time off types fetched").send(res);
};

const getTimeOffTypeById = async (req, res) => {
  const type = await TimeOffType.findById(req.params.id);
  if (!type) throw new ApiError(404, "Time off type not found");
  return new ApiResponse(200, type, "Time off type fetched").send(res);
};

const updateTimeOffType = async (req, res) => {
  const type = await TimeOffType.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!type) throw new ApiError(404, "Time off type not found");
  return new ApiResponse(200, type, "Time off type updated").send(res);
};

module.exports = { createTimeOffType, listTimeOffTypes, getTimeOffTypeById, updateTimeOffType };
