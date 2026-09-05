const Contract = require("../models/Contract");
const SalaryStructure = require("../models/SalaryStructure");

const { evaluateFormula } = require("./formulaEvaluator");

const EARNING_CATEGORIES = ["Basic", "Allowance"];
const DEDUCTION_CATEGORIES = ["Deduction"];

/**
 * Computes one employee's payslip for a given period.
 * Never throws for "expected" business situations (no active contract,
 * no structure, bad rule config) — instead returns { ok: false, warning }
 * so the caller (Payrun compute step) can surface it and keep going for
 * the rest of the batch, per the "visible, not silent" stability rule.
 *
 * @param {string} employeeId
 * @param {{startDate: Date, endDate: Date}} period
 * @returns {Promise<{ok: true, contract, lines, gross, net} | {ok: false, warning: string}>}
 */
async function computePayslipForEmployee(employeeId, period) {
  try {
    const contract = await Contract.findActiveForPeriod(employeeId, period.startDate);
    if (!contract) {
      return { ok: false, warning: `No active contract found for this employee for the selected period` };
    }

    if (!contract.salaryStructure) {
      return { ok: false, warning: `Employee's active contract has no Salary Structure assigned` };
    }

    const structure = await SalaryStructure.findById(contract.salaryStructure).populate({
      path: "rules",
      options: { sort: { sequence: 1 } },
    });

    if (!structure) {
      return { ok: false, warning: `Salary Structure referenced by the contract no longer exists` };
    }
    if (!structure.rules || structure.rules.length === 0) {
      return { ok: false, warning: `Salary Structure "${structure.name}" has no rules configured` };
    }

    const variables = { CONTRACT_WAGE: contract.wage };
    const lines = [];

    for (const rule of structure.rules) {
      let amount = 0;

      if (rule.computeType === "Fixed") {
        amount = rule.fixedAmount || 0;
      } else if (rule.computeType === "Percentage") {
        const base = variables[(rule.percentageOf || "").toUpperCase()] ?? 0;
        amount = (base * (rule.percentageValue || 0)) / 100;
      } else if (rule.computeType === "Formula") {
        amount = evaluateFormula(rule.formula, variables);
      }

      amount = Math.round(amount * 100) / 100;
      variables[rule.code.toUpperCase()] = amount;

      lines.push({
        code: rule.code,
        name: rule.name,
        category: rule.category,
        amount,
      });
    }

    const gross = round2(
      lines.filter((l) => EARNING_CATEGORIES.includes(l.category)).reduce((s, l) => s + l.amount, 0)
    );
    const totalDeductions = round2(
      lines.filter((l) => DEDUCTION_CATEGORIES.includes(l.category)).reduce((s, l) => s + l.amount, 0)
    );
    const net = round2(gross - totalDeductions);

    return { ok: true, contract, lines, gross, net };
  } catch (err) {
    return { ok: false, warning: `Payroll computation error: ${err.message}` };
  }
}

function round2(n) {
  return Math.round(n * 100) / 100;
}

module.exports = { computePayslipForEmployee };
