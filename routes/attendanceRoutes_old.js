const express = require("express");

const {
    syncK30Attendance
} = require("../controllers/attendanceController");

const router = express.Router();

router.post("/sync", syncK30Attendance);

module.exports = router;