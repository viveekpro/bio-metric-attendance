const {
    syncAttendance
} = require("../services/attendanceSyncService");

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

module.exports = {
    syncK30Attendance
};