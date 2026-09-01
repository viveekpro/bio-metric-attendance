const express = require("express");

const {
    syncK30Attendance,
    getTodayAttendance,
    getEmployeeAttendance,
    getAttendanceByDate,
    getMonthlyAttendance
} = require("../controllers/attendanceController");

const router = express.Router();


// ==========================================
// SYNC
// ==========================================

router.post(
    "/sync",
    syncK30Attendance
);


// ==========================================
// TODAY
// ==========================================

router.get(
    "/today",
    getTodayAttendance
);


// ==========================================
// EMPLOYEE
// ==========================================

router.get(
    "/employee/:deviceUserId",
    getEmployeeAttendance
);


// ==========================================
// DATE
// ==========================================

router.get(
    "/date/:date",
    getAttendanceByDate
);


// ==========================================
// MONTH
// ==========================================

router.get(
    "/month/:year/:month",
    getMonthlyAttendance
);


module.exports = router;
