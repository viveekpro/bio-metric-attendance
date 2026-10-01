require("dotenv").config();

const connectDB = require("./config/db");
const Attendance = require("./models/Attendance");
const Employee = require("./models/Employee");

const { connectK30 } = require("./services/k30Service");

const findMissingAttendance = async () => {
    let device;

    try {
        await connectDB();

        console.log("Connecting to K30...");

        device = await connectK30();

        console.log("Reading attendance from K30...");

        const result = await device.getAttendances();

        const records = result.data || result;

        const employees = await Employee.find();

        const employeeSet = new Set(
            employees.map(employee =>
                String(employee.deviceUserId)
            )
        );

        // All valid K30 record keys
        const k30RecordKeys = new Set();

        for (const record of records) {
            const deviceUserId = String(record.user_id);

            if (!employeeSet.has(deviceUserId)) {
                continue;
            }

            const recordTime = new Date(
                record.record_time
            );

            if (isNaN(recordTime.getTime())) {
                continue;
            }

            const deviceIp =
                record.ip ||
                process.env.K30_IP ||
                "192.168.1.201";

            const recordKey =
                `${deviceUserId}_${recordTime.toISOString()}_${deviceIp}`;

            k30RecordKeys.add(recordKey);
        }

        console.log(
            `Valid unique K30 records: ${k30RecordKeys.size}`
        );

        // Get MongoDB record keys
        const mongoRecords = await Attendance.find(
            {},
            { recordKey: 1 }
        ).lean();

        const mongoRecordKeys = new Set(
            mongoRecords.map(record =>
                record.recordKey
            )
        );

        const missing = [];

        for (const recordKey of k30RecordKeys) {
            if (!mongoRecordKeys.has(recordKey)) {
                missing.push(recordKey);
            }
        }

        console.log("\n=================================");
        console.log("MISSING ATTENDANCE CHECK");
        console.log("=================================");

        console.log(
            `MongoDB records: ${mongoRecordKeys.size}`
        );

        console.log(
            `Missing records: ${missing.length}`
        );

        if (missing.length > 0) {
            console.log("\nMissing record keys:");

            console.log(missing);
        }

    } catch (error) {
        console.error("❌ Error:", error.message);

    } finally {
        if (device) {
            try {
                await device.disconnect();
            } catch (error) {
                // Ignore known K30 disconnect timeout
            }
        }

        process.exit();
    }
};

findMissingAttendance();