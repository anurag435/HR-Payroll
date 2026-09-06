const Payrun = require("../models/Payrun");
const Payslip = require("../models/Payslip");
const Employee = require("../models/Employee");
const SalaryStructure = require("../models/SalaryStructure");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const { computePayslipForEmployee } = require("../utils/payrollEngine");

// ---- Step 2 of the wizard: create-on-confirm-only ----------------------
const createPayrun = async (req, res) => {
  const structureExists = await SalaryStructure.exists({ _id: req.body.salaryStructure });
  if (!structureExists) throw new ApiError(400, "salaryStructure does not exist");

  const employeeCount = await Employee.countDocuments({ _id: { $in: req.body.employees } });
  if (employeeCount !== req.body.employees.length) {
    throw new ApiError(400, "One or more selected employees do not exist");
  }

  const payrun = await Payrun.create(req.body);
  return new ApiResponse(201, payrun, "Payrun created").send(res);
};

const listPayruns = async (req, res) => {
  const { status } = req.query;
  const filter = {};
  if (status) filter.status = status;

  const payruns = await Payrun.find(filter)
    .populate("salaryStructure", "name")
    .sort({ createdAt: -1 });

  return new ApiResponse(200, payruns, "Payruns fetched").send(res);
};

const getPayrunById = async (req, res) => {
  const payrun = await Payrun.findById(req.params.id)
    .populate("salaryStructure", "name")
    .populate("employees", "name email jobPosition");
  if (!payrun) throw new ApiError(404, "Payrun not found");

  const payslips = await Payslip.find({ payrun: payrun._id }).populate("employee", "name email");

  return new ApiResponse(200, { payrun, payslips }, "Payrun fetched").send(res);
};

// ---- Lifecycle: Draft -> Processing (Compute) ---------------------------
// Idempotent: clicking Compute twice recomputes cleanly instead of
// crashing or duplicating payslips (unique index on payrun+employee).
const computePayrun = async (req, res) => {
  const payrun = await Payrun.findById(req.params.id).populate("employees");
  if (!payrun) throw new ApiError(404, "Payrun not found");
  if (payrun.status === "Paid") {
    throw new ApiError(409, "This payrun has already been paid and can no longer be recomputed");
  }

  const warnings = [];

  for (const employee of payrun.employees) {
    const result = await computePayslipForEmployee(
      employee._id.toString(),
      payrun.period,
      payrun.salaryStructure
    );

    if (!result.ok) {
      warnings.push(`${employee.name}: ${result.warning}`);
      continue;
    }

    await Payslip.findOneAndUpdate(
      { payrun: payrun._id, employee: employee._id },
      {
        payrun: payrun._id,
        employee: employee._id,
        contract: result.contract._id,
        period: payrun.period,
        lines: result.lines,
        gross: result.gross,
        net: result.net,
        status: "Computed",
        warnings: [],
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  payrun.status = "Processing";
  payrun.warnings = warnings;
  await payrun.save();

  return new ApiResponse(
    200,
    { payrun, warningCount: warnings.length },
    warnings.length ? "Payrun computed with warnings" : "Payrun computed successfully"
  ).send(res);
};

// ---- Lifecycle: Processing -> Validated ---------------------------------
const validatePayrun = async (req, res) => {
  const payrun = await Payrun.findById(req.params.id);
  if (!payrun) throw new ApiError(404, "Payrun not found");
  if (payrun.status !== "Processing") {
    throw new ApiError(409, `Cannot validate a payrun in "${payrun.status}" status — compute it first`);
  }

  await Payslip.updateMany({ payrun: payrun._id }, { status: "Validated" });
  payrun.status = "Validated";
  await payrun.save();

  return new ApiResponse(200, payrun, "Payrun validated").send(res);
};

// ---- Lifecycle: Validated -> Paid ---------------------------------------
const markPayrunPaid = async (req, res) => {
  const payrun = await Payrun.findById(req.params.id);
  if (!payrun) throw new ApiError(404, "Payrun not found");
  if (payrun.status !== "Validated") {
    throw new ApiError(409, `Cannot mark paid — payrun must be Validated first (currently "${payrun.status}")`);
  }

  await Payslip.updateMany({ payrun: payrun._id }, { status: "Paid" });
  payrun.status = "Paid";
  await payrun.save();

  return new ApiResponse(200, payrun, "Payrun marked as paid").send(res);
};

module.exports = {
  createPayrun,
  listPayruns,
  getPayrunById,
  computePayrun,
  validatePayrun,
  markPayrunPaid,
};
