require("dotenv").config();

const connectDB = require("./config/db");
const Attendance = require("./models/Attendance");

const checkAttendance = async () => {
    try {
        await connectDB();

        const total = await Attendance.countDocuments();

        console.log("=================================");
        console.log("ATTENDANCE DATABASE CHECK");
        console.log("=================================");
        console.log(`Total attendance records: ${total}`);

        const latestRecords = await Attendance
            .find()
            .sort({ recordTime: -1 })
            .limit(5);

        console.log("\nLatest 5 records:");

        console.log(latestRecords);

        process.exit(0);

    } catch (error) {
        console.error("Error:", error.message);
        process.exit(1);
    }
};

checkAttendance();