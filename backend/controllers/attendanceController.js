const Attendance = require("../models/Attendance");
const Employee = require("../models/Employee");
const { syncAttendance } = require("../services/attendanceSyncService");

/**
 * Trigger batch synchronization from K30 to MongoDB
 */
const syncK30Attendance = async (req, res) => {
    try {
        const result = await syncAttendance();

        res.status(200).json({
            success: true,
            message: "Attendance synchronized successfully",
            data: result
        });

    } catch (error) {
        console.error("Attendance sync error:", error);
        res.status(500).json({
            success: false,
            message: "Attendance synchronization failed",
            error: error.message
        });
    }
};

/**
 * Get all attendance punches recorded today
 */
const getTodayAttendance = async (req, res) => {
    try {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
        const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

        const attendance = await Attendance.find({
            recordTime: { $gte: start, $lte: end }
        })
            .populate("employee", "deviceUserId name cardNumber role")
            .sort({ recordTime: -1 });

        const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

        res.status(200).json({
            success: true,
            date: dateStr,
            total: attendance.length,
            data: attendance
        });

    } catch (error) {
        console.error("Today's attendance error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch today's attendance",
            error: error.message
        });
    }
};

/**
 * Get attendance records for a specific employee by deviceUserId
 */
const getEmployeeAttendance = async (req, res) => {
    try {
        const { deviceUserId } = req.params;

        const employee = await Employee.findOne({
            deviceUserId: String(deviceUserId)
        });

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: "Employee not found"
            });
        }

        const attendance = await Attendance.find({
            employee: employee._id
        }).sort({ recordTime: -1 });

        res.status(200).json({
            success: true,
            employee: {
                deviceUserId: employee.deviceUserId,
                name: employee.name,
                cardNumber: employee.cardNumber,
                role: employee.role
            },
            total: attendance.length,
            data: attendance
        });

    } catch (error) {
        console.error("Employee attendance error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch employee attendance",
            error: error.message
        });
    }
};

/**
 * Get attendance records for a specific calendar date (YYYY-MM-DD)
 */
const getAttendanceByDate = async (req, res) => {
    try {
        const { date } = req.params;

        const dateParts = date.split("-").map(Number);
        if (dateParts.length !== 3 || isNaN(dateParts[0]) || isNaN(dateParts[1]) || isNaN(dateParts[2])) {
            return res.status(400).json({
                success: false,
                message: "Invalid date format. Please use YYYY-MM-DD"
            });
        }

        const [year, month, day] = dateParts;
        const start = new Date(year, month - 1, day, 0, 0, 0, 0);
        const end = new Date(year, month - 1, day, 23, 59, 59, 999);

        const attendance = await Attendance.find({
            recordTime: { $gte: start, $lte: end }
        })
            .populate("employee", "deviceUserId name cardNumber")
            .sort({ recordTime: -1 });

        res.status(200).json({
            success: true,
            date,
            total: attendance.length,
            data: attendance
        });

    } catch (error) {
        console.error("Date attendance error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch attendance for date",
            error: error.message
        });
    }
};

/**
 * Get attendance records for a specific month (YYYY/MM)
 */
const getMonthlyAttendance = async (req, res) => {
    try {
        const { year, month } = req.params;
        const yearNum = Number(year);
        const monthNum = Number(month);

        if (!/^\d{4}$/.test(year) || isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
            return res.status(400).json({
                success: false,
                message: "Invalid year/month. Please use format such as 2026/09"
            });
        }

        const start = new Date(yearNum, monthNum - 1, 1, 0, 0, 0, 0);
        const end = new Date(yearNum, monthNum, 0, 23, 59, 59, 999);

        const attendance = await Attendance.find({
            recordTime: { $gte: start, $lte: end }
        })
            .populate("employee", "deviceUserId name cardNumber")
            .sort({ recordTime: 1 });

        res.status(200).json({
            success: true,
            year: yearNum,
            month: monthNum,
            total: attendance.length,
            data: attendance
        });

    } catch (error) {
        console.error("Monthly attendance error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch monthly attendance",
            error: error.message
        });
    }
};

module.exports = {
    syncK30Attendance,
    getTodayAttendance,
    getEmployeeAttendance,
    getAttendanceByDate,
    getMonthlyAttendance
};
