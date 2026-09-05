const SalaryStructure = require("../models/SalaryStructure");
const SalaryRule = require("../models/SalaryRule");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");

async function assertRulesExist(ruleIds = []) {
  if (!ruleIds.length) return;
  const count = await SalaryRule.countDocuments({ _id: { $in: ruleIds } });
  if (count !== ruleIds.length) {
    throw new ApiError(400, "One or more selected rules do not exist");
  }
}

const createSalaryStructure = async (req, res) => {
  await assertRulesExist(req.body.rules);
  const structure = await SalaryStructure.create(req.body);
  return new ApiResponse(201, structure, "Salary structure created").send(res);
};

const listSalaryStructures = async (req, res) => {
  const structures = await SalaryStructure.find().populate("rules").sort({ name: 1 });
  return new ApiResponse(200, structures, "Salary structures fetched").send(res);
};

const getSalaryStructureById = async (req, res) => {
  const structure = await SalaryStructure.findById(req.params.id).populate({
    path: "rules",
    options: { sort: { sequence: 1 } },
  });
  if (!structure) throw new ApiError(404, "Salary structure not found");
  return new ApiResponse(200, structure, "Salary structure fetched").send(res);
};

const updateSalaryStructure = async (req, res) => {
  await assertRulesExist(req.body.rules);
  const structure = await SalaryStructure.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }).populate({ path: "rules", options: { sort: { sequence: 1 } } });
  if (!structure) throw new ApiError(404, "Salary structure not found");
  return new ApiResponse(200, structure, "Salary structure updated").send(res);
};

module.exports = {
  createSalaryStructure,
  listSalaryStructures,
  getSalaryStructureById,
  updateSalaryStructure,
};
