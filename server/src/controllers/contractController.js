const Contract = require("../models/Contract");
const Employee = require("../models/Employee");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");

async function closeConflictingActiveContracts(employeeId, newStartDate, excludeContractId = null) {
  const query = {
    employee: employeeId,
    status: "Active",
    ...(excludeContractId ? { _id: { $ne: excludeContractId } } : {}),
  };

  const conflicting = await Contract.find(query);
  const dayBefore = new Date(newStartDate);
  dayBefore.setDate(dayBefore.getDate() - 1);

  for (const contract of conflicting) {
    contract.endDate = dayBefore;
    contract.status = "Expired";
    await contract.save();
  }
}

const createContract = async (req, res) => {
  const employeeExists = await Employee.exists({ _id: req.body.employee });
  if (!employeeExists) throw new ApiError(400, "employee does not exist");

  const contract = new Contract(req.body);

  if (contract.status === "Active") {
    await closeConflictingActiveContracts(contract.employee, contract.startDate);
  }

  await contract.save();
  return new ApiResponse(201, contract, "Contract created").send(res);
};

const listContracts = async (req, res) => {
  const { employee, status } = req.query;
  const filter = {};
  if (employee) filter.employee = employee;
  if (status) filter.status = status;

  const contracts = await Contract.find(filter)
    .populate("employee", "name email")
    .populate("department", "name")
    .sort({ startDate: -1 });

  return new ApiResponse(200, contracts, "Contracts fetched").send(res);
};

const getContractById = async (req, res) => {
  const contract = await Contract.findById(req.params.id)
    .populate("employee", "name email")
    .populate("department", "name")
    .populate("workingSchedule", "name")
    .populate("salaryStructure", "name");

  if (!contract) throw new ApiError(404, "Contract not found");
  return new ApiResponse(200, contract, "Contract fetched").send(res);
};

const updateContract = async (req, res) => {
  const contract = await Contract.findById(req.params.id);
  if (!contract) throw new ApiError(404, "Contract not found");

  const movingToActive = req.body.status === "Active" && contract.status !== "Active";
  Object.assign(contract, req.body);

  if (movingToActive) {
    await closeConflictingActiveContracts(contract.employee, contract.startDate, contract._id);
  }

  await contract.save();
  return new ApiResponse(200, contract, "Contract updated").send(res);
};

const endContract = async (req, res) => {
  const { endDate } = req.body; // optional, defaults to now
  const contract = await Contract.findById(req.params.id);
  if (!contract) throw new ApiError(404, "Contract not found");

  contract.endDate = endDate ? new Date(endDate) : new Date();
  contract.status = "Expired";
  await contract.save();

  return new ApiResponse(200, contract, "Contract ended").send(res);
};

const getActiveContractForPeriod = async (req, res) => {
  const { employee, date } = req.query;
  if (!employee || !date) {
    throw new ApiError(400, "employee and date query params are required");
  }
  const contract = await Contract.findActiveForPeriod(employee, new Date(date));
  if (!contract) {
    throw new ApiError(404, "No active contract found for this employee on this date");
  }
  return new ApiResponse(200, contract, "Active contract found").send(res);
};

module.exports = {
  createContract,
  listContracts,
  getContractById,
  updateContract,
  endContract,
  getActiveContractForPeriod,
};
