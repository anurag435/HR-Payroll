export const mockSalaryRules = [
  
  { id: "r1", structureId: "st1", name: "Basic Salary", code: "BASIC", category: "Basic", sequence: 10, computationType: "wage" },
  { id: "r2", structureId: "st1", name: "House Rent Allowance", code: "HRA", category: "Allowance", sequence: 20, computationType: "percentage", baseCode: "BASIC", percentage: 20 },
  { id: "r3", structureId: "st1", name: "Standard Allowance", code: "STA", category: "Allowance", sequence: 30, computationType: "fixed", amount: 5000 },
  { id: "r4", structureId: "st1", name: "Performance Bonus", code: "BONUS", category: "Allowance", sequence: 40, computationType: "percentage", baseCode: "BASIC", percentage: 10 },
  { id: "r5", structureId: "st1", name: "Leave Travel Allowance", code: "LTA", category: "Allowance", sequence: 50, computationType: "fixed", amount: 3000 },
  { id: "r6", structureId: "st1", name: "Fuel Allowance", code: "FUEL", category: "Allowance", sequence: 60, computationType: "fixed", amount: 2000 },
  { id: "r7", structureId: "st1", name: "Gross Salary", code: "GROSS", category: "Gross", sequence: 70, computationType: "formula", formula: "BASIC + HRA + STA + BONUS + LTA + FUEL" },
  { id: "r8", structureId: "st1", name: "LWF Fund", code: "LWF", category: "Deduction", sequence: 80, computationType: "fixed", amount: 200 },
  { id: "r9", structureId: "st1", name: "Provident Fund", code: "PF", category: "Deduction", sequence: 90, computationType: "percentage", baseCode: "BASIC", percentage: 12 },
  { id: "r10", structureId: "st1", name: "ESIC", code: "ESIC", category: "Deduction", sequence: 100, computationType: "percentage", baseCode: "GROSS", percentage: 0.75 },
  { id: "r11", structureId: "st1", name: "Professional Tax", code: "PT", category: "Deduction", sequence: 110, computationType: "fixed", amount: 200 },
  { id: "r12", structureId: "st1", name: "Net Salary", code: "NET", category: "Net", sequence: 120, computationType: "formula", formula: "GROSS - LWF - PF - ESIC - PT" },

 
  { id: "r13", structureId: "st2", name: "Basic Salary", code: "BASIC", category: "Basic", sequence: 10, computationType: "wage" },
  { id: "r14", structureId: "st2", name: "Standard Allowance", code: "STA", category: "Allowance", sequence: 20, computationType: "fixed", amount: 1500 },
  { id: "r15", structureId: "st2", name: "Gross Salary", code: "GROSS", category: "Gross", sequence: 30, computationType: "formula", formula: "BASIC + STA" },
  { id: "r16", structureId: "st2", name: "Professional Tax", code: "PT", category: "Deduction", sequence: 40, computationType: "fixed", amount: 200 },
  { id: "r17", structureId: "st2", name: "Net Salary", code: "NET", category: "Net", sequence: 50, computationType: "formula", formula: "GROSS - PT" },

  
  { id: "r18", structureId: "st3", name: "Basic Salary", code: "BASIC", category: "Basic", sequence: 10, computationType: "wage" },
  { id: "r19", structureId: "st3", name: "Gross Salary", code: "GROSS", category: "Gross", sequence: 20, computationType: "formula", formula: "BASIC" },
  { id: "r20", structureId: "st3", name: "Net Salary", code: "NET", category: "Net", sequence: 30, computationType: "formula", formula: "GROSS" },
];