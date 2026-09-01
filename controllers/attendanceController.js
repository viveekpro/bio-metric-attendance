const Attendance = require("../models/Attendance");
const Employee = require("../models/Employee");

const {
    syncAttendance
} = require("../services/attendanceSyncService");


// ==========================================
// SYNC K30 ATTENDANCE
// ==========================================

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


// ==========================================
// GET TODAY'S ATTENDANCE
// ==========================================

const getTodayAttendance = async (req, res) => {
    try {

        const start = new Date();
        start.setHours(0, 0, 0, 0);

        const end = new Date();
        end.setHours(23, 59, 59, 999);

        const attendance = await Attendance.find({
            recordTime: {
                $gte: start,
                $lte: end
            }
        })
            .populate("employee", "deviceUserId name")
            .sort({
                recordTime: -1
            });

        res.status(200).json({
            success: true,
            date: start.toISOString().split("T")[0],
            total: attendance.length,
            data: attendance
        });

    } catch (error) {

        console.error(
            "Today's attendance error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to fetch today's attendance",
            error: error.message
        });
    }
};


// ==========================================
// GET ATTENDANCE BY EMPLOYEE
// ==========================================

const getEmployeeAttendance = async (req, res) => {
    try {

        const {
            deviceUserId
        } = req.params;

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
        })
            .sort({
                recordTime: -1
            });

        res.status(200).json({
            success: true,

            employee: {
                deviceUserId: employee.deviceUserId,
                name: employee.name
            },

            total: attendance.length,

            data: attendance
        });

    } catch (error) {

        console.error(
            "Employee attendance error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to fetch employee attendance",
            error: error.message
        });
    }
};


// ==========================================
// GET ATTENDANCE BY DATE
// ==========================================

const getAttendanceByDate = async (req, res) => {
    try {

        const {
            date
        } = req.params;

        const start = new Date(`${date}T00:00:00`);
        const end = new Date(`${date}T23:59:59.999`);

        if (
            isNaN(start.getTime()) ||
            isNaN(end.getTime())
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid date. Use YYYY-MM-DD"
            });
        }

        const attendance = await Attendance.find({
            recordTime: {
                $gte: start,
                $lte: end
            }
        })
            .populate("employee", "deviceUserId name")
            .sort({
                recordTime: -1
            });

        res.status(200).json({
            success: true,

            date,

            total: attendance.length,

            data: attendance
        });

    } catch (error) {

        console.error(
            "Date attendance error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to fetch attendance",
            error: error.message
        });
    }
};


// ==========================================
// GET MONTHLY ATTENDANCE
// ==========================================

const getMonthlyAttendance = async (req, res) => {
    try {

        const {
            year,
            month
        } = req.params;

        const monthNumber = Number(month);

        if (
            !/^\d{4}$/.test(year) ||
            monthNumber < 1 ||
            monthNumber > 12
        ) {
            return res.status(400).json({
                success: false,
                message: "Use year/month format such as 2026/09"
            });
        }

        const start = new Date(
            Number(year),
            monthNumber - 1,
            1
        );

        const end = new Date(
            Number(year),
            monthNumber,
            1
        );

        const attendance = await Attendance.find({
            recordTime: {
                $gte: start,
                $lt: end
            }
        })
            .populate("employee", "deviceUserId name")
            .sort({
                recordTime: 1
            });

        res.status(200).json({
            success: true,

            year: Number(year),

            month: monthNumber,

            total: attendance.length,

            data: attendance
        });

    } catch (error) {

        console.error(
            "Monthly attendance error:",
            error
        );

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