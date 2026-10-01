require("dotenv").config();

const connectDB = require("./config/db");
const Attendance = require("./models/Attendance");
const Employee = require("./models/Employee");

const checkAttendanceUsers = async () => {
    try {
        await connectDB();

        const attendanceUsers =
            await Attendance.distinct("deviceUserId");

        const employees =
            await Employee.distinct("deviceUserId");

        const employeeSet = new Set(
            employees.map(id => String(id))
        );

        const unmatchedUsers =
            attendanceUsers.filter(
                id => !employeeSet.has(String(id))
            );

        console.log("=================================");
        console.log("ATTENDANCE USER CHECK");
        console.log("=================================");

        console.log(
            "Unique users in Attendance:",
            attendanceUsers.length
        );

        console.log(
            "Employees:",
            employees.length
        );

        console.log(
            "\nAttendance users not found in Employee:"
        );

        console.log(unmatchedUsers);

        process.exit(0);

    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
};

checkAttendanceUsers();