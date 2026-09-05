export const mockWorkingSchedules = [
  {
    id: "ws1",
    name: "40 Hours / Week",
    daysPerWeek: 5,
    hoursPerWeek: 40,
    company: "My Company",
    timezone: "Company timezone",
    status: "active",
    days: [
      { day: "Monday", start: "9:00 AM", end: "6:00 PM", breakTime: "1h", hours: "8h" },
      { day: "Tuesday", start: "9:00 AM", end: "6:00 PM", breakTime: "1h", hours: "8h" },
      { day: "Wednesday", start: "9:00 AM", end: "6:00 PM", breakTime: "1h", hours: "8h" },
      { day: "Thursday", start: "9:00 AM", end: "6:00 PM", breakTime: "1h", hours: "8h" },
      { day: "Friday", start: "9:00 AM", end: "6:00 PM", breakTime: "1h", hours: "8h" },
    ],
  },
  { id: "ws2", name: "Night Shift", daysPerWeek: 5, hoursPerWeek: 40, company: "My Company", timezone: "Company timezone", status: "active", days: [] },
  { id: "ws3", name: "Retail Weekend", daysPerWeek: 5, hoursPerWeek: 40, company: "My Company", timezone: "Company timezone", status: "active", days: [] },
  { id: "ws4", name: "Flexible Hybrid", daysPerWeek: 5, hoursPerWeek: 37.5, company: "My Company", timezone: "Company timezone", status: "active", days: [] },
  { id: "ws5", name: "Part-time 20h", daysPerWeek: 4, hoursPerWeek: 20, company: "My Company", timezone: "Company timezone", status: "inactive", days: [] },
];