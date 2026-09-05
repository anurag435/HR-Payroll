const PDFDocument = require("pdfkit");
const Payslip = require("../models/Payslip");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const { ROLE_GROUPS } = require("../constants/roles");

const listPayslips = async (req, res) => {
  const { employee, payrun } = req.query;
  const filter = {};
  if (employee) filter.employee = employee;
  if (payrun) filter.payrun = payrun;

  const payslips = await Payslip.find(filter)
    .populate("employee", "name email")
    .populate("payrun", "label status")
    .sort({ createdAt: -1 });

  return new ApiResponse(200, payslips, "Payslips fetched").send(res);
};

async function loadAndAuthorize(req) {
  const payslip = await Payslip.findById(req.params.id)
    .populate("employee", "name email jobPosition")
    .populate("payrun", "label status period")
    .populate("contract", "contractNumber wage");
  if (!payslip) throw new ApiError(404, "Payslip not found");

  const isOwner = req.user.employee && req.user.employee.toString() === payslip.employee._id.toString();
  const isPayrollStaff = ROLE_GROUPS.PAYROLL_STAFF.includes(req.user.role);
  if (!isOwner && !isPayrollStaff) {
    throw new ApiError(403, "You can only view your own payslips");
  }
  return payslip;
}

const getPayslipById = async (req, res) => {
  const payslip = await loadAndAuthorize(req);
  return new ApiResponse(200, payslip, "Payslip fetched").send(res);
};

const downloadPayslipPdf = async (req, res) => {
  const payslip = await loadAndAuthorize(req);

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="payslip-${payslip.employee.name.replace(/\s+/g, "_")}-${payslip._id}.pdf"`
  );

  const doc = new PDFDocument({ margin: 50, size: "A4" });
  doc.pipe(res);

  const fmt = (n) => `Rs. ${Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const dateFmt = (d) => new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

  doc.fontSize(18).text("Payslip", { align: "right" });
  doc.moveDown(0.3);
  doc.fontSize(10).fillColor("#666").text(`Payrun: ${payslip.payrun?.label ?? "-"}`, { align: "right" });
  doc.text(`Status: ${payslip.status}`, { align: "right" });
  doc.moveDown();

  doc.fillColor("#000").fontSize(12).text(`Employee: ${payslip.employee.name}`);
  doc.fontSize(10).fillColor("#666").text(payslip.employee.jobPosition || "");
  doc.text(payslip.employee.email);
  doc.moveDown(0.3);
  doc.text(
    `Period: ${dateFmt(payslip.period.startDate)} — ${dateFmt(payslip.period.endDate)}`
  );
  if (payslip.contract) {
    doc.text(`Contract: ${payslip.contract.contractNumber}`);
  }
  doc.moveDown();

  // --- Rule breakdown table ---
  const tableTop = doc.y + 10;
  const col = { name: 50, category: 300, amount: 420 };

  doc.fillColor("#000").fontSize(10).font("Helvetica-Bold");
  doc.text("Component", col.name, tableTop);
  doc.text("Category", col.category, tableTop);
  doc.text("Amount", col.amount, tableTop, { width: 100, align: "right" });
  doc.moveTo(50, tableTop + 15).lineTo(545, tableTop + 15).strokeColor("#ccc").stroke();

  let y = tableTop + 22;
  doc.font("Helvetica");
  for (const line of payslip.lines) {
    doc.text(line.name, col.name, y);
    doc.text(line.category, col.category, y);
    const isDeduction = line.category === "Deduction";
    doc.text(`${isDeduction ? "-" : ""}${fmt(line.amount)}`, col.amount, y, { width: 100, align: "right" });
    y += 18;
  }

  y += 6;
  doc.moveTo(50, y).lineTo(545, y).strokeColor("#ccc").stroke();
  y += 10;

  doc.font("Helvetica-Bold");
  doc.text("Gross", col.category, y);
  doc.text(fmt(payslip.gross), col.amount, y, { width: 100, align: "right" });
  y += 18;
  doc.fontSize(12);
  doc.text("Net Pay", col.category, y);
  doc.text(fmt(payslip.net), col.amount, y, { width: 100, align: "right" });

  if (payslip.warnings && payslip.warnings.length) {
    y += 30;
    doc.fontSize(9).fillColor("#b45309").font("Helvetica");
    doc.text("Warnings:", 50, y);
    for (const w of payslip.warnings) {
      y += 14;
      doc.text(`- ${w}`, 50, y);
    }
  }

  doc.end();
};

module.exports = { listPayslips, getPayslipById, downloadPayslipPdf };
