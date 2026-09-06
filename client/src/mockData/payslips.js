import { mockEmployees } from "./employees";
import { computeSalary } from "../services/salaryEngine";

function wageOf(employeeId) {
  return mockEmployees.find((e) => e.id === employeeId)?.wage ?? 0;
}

function buildPayslip({ id, payrunId, employeeId, structureId, periodStart, periodEnd, workedDays, status, warning, computed }) {
  const empty = { lines: [], gross: 0, net: 0 };
  const result = computed ? computeSalary(structureId, wageOf(employeeId)) : empty;
  return {
    id,
    payrunId,
    employeeId,
    structureId,
    periodStart,
    periodEnd,
    workedDays,
    status,   
    warning,  
    ...result,
  };
}

const allEmployeeIds = mockEmployees.map((e) => e.id);

export const mockPayslips = [
  
  ...allEmployeeIds.map((id, i) =>
    buildPayslip({
      id: `ps-jan-${id}`,
      payrunId: "pr1",
      employeeId: id,
      structureId: "st1",
      periodStart: "2026-01-01",
      periodEnd: "2026-01-31",
      workedDays: 22,
      status: "done",
      warning: null,
      computed: true,
    })
  ),

 
  buildPayslip({ id: "ps-feb-e1", payrunId: "pr2", employeeId: "e1", structureId: "st1", periodStart: "2026-02-01", periodEnd: "2026-02-28", workedDays: 22, status: "done", warning: null, computed: true }),
  buildPayslip({ id: "ps-feb-e2", payrunId: "pr2", employeeId: "e2", structureId: "st1", periodStart: "2026-02-01", periodEnd: "2026-02-28", workedDays: 22, status: "done", warning: "missing_account", computed: true }),
  buildPayslip({ id: "ps-feb-e3", payrunId: "pr2", employeeId: "e3", structureId: "st1", periodStart: "2026-02-01", periodEnd: "2026-02-28", workedDays: 20, status: "draft", warning: "duplicate", computed: true }),
  buildPayslip({ id: "ps-feb-e4", payrunId: "pr2", employeeId: "e4", structureId: "st1", periodStart: "2026-02-01", periodEnd: "2026-02-28", workedDays: 22, status: "done", warning: null, computed: true }),
  ...["e5", "e6", "e7", "e8"].map((id) =>
    buildPayslip({
      id: `ps-feb-${id}`,
      payrunId: "pr2",
      employeeId: id,
      structureId: "st1",
      periodStart: "2026-02-01",
      periodEnd: "2026-02-28",
      workedDays: 22,
      status: "done",
      warning: null,
      computed: true,
    })
  ),


  ...allEmployeeIds.map((id) =>
    buildPayslip({
      id: `ps-mar-${id}`,
      payrunId: "pr3",
      employeeId: id,
      structureId: "st1",
      periodStart: "2026-03-01",
      periodEnd: "2026-03-31",
      workedDays: 0,
      status: "draft",
      warning: null,
      computed: false,
    })
  ),
];