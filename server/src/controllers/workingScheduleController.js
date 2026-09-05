const WorkingSchedule = require("../models/WorkingSchedule");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");

const createWorkingSchedule = async (req, res) => {
  const schedule = await WorkingSchedule.create(req.body);
  return new ApiResponse(201, schedule, "Working schedule created").send(res);
};

const listWorkingSchedules = async (req, res) => {
  const schedules = await WorkingSchedule.find().sort({ name: 1 });
  return new ApiResponse(200, schedules, "Working schedules fetched").send(res);
};

const getWorkingScheduleById = async (req, res) => {
  const schedule = await WorkingSchedule.findById(req.params.id);
  if (!schedule) throw new ApiError(404, "Working schedule not found");
  return new ApiResponse(200, schedule, "Working schedule fetched").send(res);
};

const updateWorkingSchedule = async (req, res) => {
  const schedule = await WorkingSchedule.findById(req.params.id);
  if (!schedule) throw new ApiError(404, "Working schedule not found");

  Object.assign(schedule, req.body);
  await schedule.save();

  return new ApiResponse(200, schedule, "Working schedule updated").send(res);
};

const archiveWorkingSchedule = async (req, res) => {
  const schedule = await WorkingSchedule.findByIdAndUpdate(
    req.params.id,
    { status: "Archived" },
    { new: true }
  );
  if (!schedule) throw new ApiError(404, "Working schedule not found");
  return new ApiResponse(200, schedule, "Working schedule archived").send(res);
};

module.exports = {
  createWorkingSchedule,
  listWorkingSchedules,
  getWorkingScheduleById,
  updateWorkingSchedule,
  archiveWorkingSchedule,
};