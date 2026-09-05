const Department = require("../models/Department");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");

const createDepartment = async (req, res) => {
  const department = await Department.create(req.body);
  return new ApiResponse(201, department, "Department created").send(res);
};

const listDepartments = async (req, res) => {
  const departments = await Department.find().sort({ name: 1 });
  return new ApiResponse(200, departments, "Departments fetched").send(res);
};

const getDepartmentById = async (req, res) => {
  const department = await Department.findById(req.params.id);
  if (!department) throw new ApiError(404, "Department not found");
  return new ApiResponse(200, department, "Department fetched").send(res);
};

const updateDepartment = async (req, res) => {
  const department = await Department.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!department) throw new ApiError(404, "Department not found");
  return new ApiResponse(200, department, "Department updated").send(res);
};

const deleteDepartment = async (req, res) => {
  const department = await Department.findByIdAndDelete(req.params.id);
  if (!department) throw new ApiError(404, "Department not found");
  return new ApiResponse(200, null, "Department deleted").send(res);
};

module.exports = {
  createDepartment,
  listDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
};