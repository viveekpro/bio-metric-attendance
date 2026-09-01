require("dotenv").config();

const fs = require("fs");
const path = require("path");

const connectDB = require("./config/db");
const Attendance = require("./models/Attendance");

const backupAttendance = async () => {
    try {
        await connectDB();

        console.log("Creating attendance backup...");

        const records = await Attendance.find().lean();

        const backupFolder = path.join(
            __dirname,
            "backup"
        );

        if (!fs.existsSync(backupFolder)) {
            fs.mkdirSync(backupFolder);
        }

        const fileName = path.join(
            backupFolder,
            `attendance-backup-${Date.now()}.json`
        );

        fs.writeFileSync(
            fileName,
            JSON.stringify(records, null, 2)
        );

        console.log("=================================");
        console.log("BACKUP COMPLETED");
        console.log("=================================");
        console.log(`Records backed up: ${records.length}`);
        console.log(`Backup file: ${fileName}`);

        process.exit(0);

    } catch (error) {
        console.error("❌ Backup failed:", error);
        process.exit(1);
    }
};

backupAttendance();