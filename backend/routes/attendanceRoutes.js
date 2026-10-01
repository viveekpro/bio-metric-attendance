const express = require("express");

const {
    syncK30Attendance,
    getTodayAttendance,
    getEmployeeAttendance,
    getAttendanceByDate,
    getMonthlyAttendance
} = require("../controllers/attendanceController");

const router = express.Router();

router.post("/sync", syncK30Attendance);
router.get("/today", getTodayAttendance);
router.get("/employee/:deviceUserId", getEmployeeAttendance);
router.get("/date/:date", getAttendanceByDate);
router.get("/month/:year/:month", getMonthlyAttendance);

module.exports = router;
