import { mockSalaryRules } from "../mockData/salaryRules";

export function computeSalary(structureId, wage) {
  const rules = mockSalaryRules
    .filter((r) => r.structureId === structureId)
    .sort((a, b) => a.sequence - b.sequence);

  const context = {};
  const lines = [];

  for (const rule of rules) {
    let amount;

    switch (rule.computationType) {
      case "wage":
        amount = wage;
        break;
      case "fixed":
        amount = rule.amount;
        break;
      case "percentage": {
        const base = context[rule.baseCode] ?? 0;
        amount = (rule.percentage / 100) * base;
        break;
      }
      case "formula": {
        
        const keys = Object.keys(context);
        const values = keys.map((k) => context[k]);
        
        const fn = new Function(...keys, `return ${rule.formula};`);
        amount = fn(...values);
        break;
      }
      default:
        amount = 0;
    }

    amount = Math.round(amount);
    context[rule.code] = amount;

    lines.push({
      ruleId: rule.id,
      name: rule.name,
      code: rule.code,
      category: rule.category,
      amount,
    });
  }

  const gross = context["GROSS"] ?? 0;
  const net = context["NET"] ?? 0;

  return { lines, gross, net };
}