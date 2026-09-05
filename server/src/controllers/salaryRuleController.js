const SalaryRule = require("../models/SalaryRule");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");

const createSalaryRule = async (req, res) => {
  const rule = await SalaryRule.create(req.body);
  return new ApiResponse(201, rule, "Salary rule created").send(res);
};

const listSalaryRules = async (req, res) => {
  const rules = await SalaryRule.find().sort({ sequence: 1 });
  return new ApiResponse(200, rules, "Salary rules fetched").send(res);
};

const getSalaryRuleById = async (req, res) => {
  const rule = await SalaryRule.findById(req.params.id);
  if (!rule) throw new ApiError(404, "Salary rule not found");
  return new ApiResponse(200, rule, "Salary rule fetched").send(res);
};

const updateSalaryRule = async (req, res) => {
  const rule = await SalaryRule.findById(req.params.id);
  if (!rule) throw new ApiError(404, "Salary rule not found");

  Object.assign(rule, req.body);
  await rule.save(); // triggers the pre('validate') compute-type consistency check

  return new ApiResponse(200, rule, "Salary rule updated").send(res);
};

const deleteSalaryRule = async (req, res) => {
  const SalaryStructure = require("../models/SalaryStructure");
  const inUse = await SalaryStructure.exists({ rules: req.params.id });
  if (inUse) {
    throw new ApiError(409, "This rule is used by a Salary Structure — remove it from the structure first");
  }
  const rule = await SalaryRule.findByIdAndDelete(req.params.id);
  if (!rule) throw new ApiError(404, "Salary rule not found");
  return new ApiResponse(200, null, "Salary rule deleted").send(res);
};

module.exports = {
  createSalaryRule,
  listSalaryRules,
  getSalaryRuleById,
  updateSalaryRule,
  deleteSalaryRule,
};
