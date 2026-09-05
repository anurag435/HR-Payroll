const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const connectDB = require("./config/database");
const { errorHandler, notFound } = require("./middleware/errorHandler");

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

app.get("/api/health", (req, res) => {
  res.status(200).json({ success: true, message: "API is healthy" });
});

//Routers
const authRouter = require("./routes/authRoutes");
const workingScheduleRouter = require("./routes/workingSchedules");
const departmentRouter = require("./routes/departments");
const contractRouter = require("./routes/contracts");
const employeeRouter = require("./routes/employees");
const attendanceRouter = require("./routes/attendance");
const timeOffTypeRouter = require("./routes/timeOffTypes");
const timeOffAllocationRouter = require("./routes/timeOffAllocations");
const timeOffRequestRouter = require("./routes/timeOffRequests");


// --- Routes ---
app.use("/", authRouter);
app.use("/working-schedules", workingScheduleRouter);
app.use("/departments", departmentRouter);
app.use("/employees", employeeRouter);
app.use("/contracts", contractRouter);
app.use("/attendance", attendanceRouter);
app.use("/timeoff/types", timeOffTypeRouter);
app.use("/timeoff/allocations", timeOffAllocationRouter);
app.use("/timeoff/requests", timeOffRequestRouter);


app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

connectDB()
  .then(() => {
    console.log("Database Connected Succesfully");
    app.listen(PORT, () => {
      console.log("Server Started at Port " + PORT);
    });
  })
  .catch((err) => {
    console.log("Error : DataBase can't Connect " + err.message);
    process.exit(1);
  });

process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION:", err);
});