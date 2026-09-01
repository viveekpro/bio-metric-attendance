const { connectK30 } = require("./k30Service");
const Employee = require("../models/Employee");
const Attendance = require("../models/Attendance");

let device = null;

const startRealtimeAttendance = async () => {
    try {
        console.log("=================================");
        console.log("STARTING K30 REAL-TIME SERVICE");
        console.log("=================================");

        device = await connectK30();

        console.log("🟢 K30 real-time listener started");
        console.log(
            `Device: ${process.env.K30_IP}:${process.env.K30_PORT}`
        );

        await device.getRealTimeLogs(async (data) => {
            try {
                console.log("\n=================================");
                console.log("🔔 REAL-TIME ATTENDANCE");
                console.log("=================================");

                console.log(data);

                const userId = String(data.userId);
                const attTime = new Date(data.attTime);

                // -----------------------------
                // Validate user ID
                // -----------------------------
                if (!userId || userId === "undefined") {
                    console.log("⚠️ Attendance ignored: userId missing");
                    return;
                }

                // -----------------------------
                // Validate date
                // -----------------------------
                if (isNaN(attTime.getTime())) {
                    console.log("⚠️ Attendance ignored: invalid date");
                    return;
                }

                console.log(`👤 Device User ID: ${userId}`);
                console.log(
                    `🕐 Attendance Time: ${attTime.toISOString()}`
                );

                // -----------------------------
                // Find employee
                // -----------------------------
                const employee = await Employee.findOne({
                    deviceUserId: userId
                });

                if (!employee) {
                    console.log(
                        `⚠️ Employee not found for K30 userId: ${userId}`
                    );
                    return;
                }

                console.log(
                    `✅ Employee found: ${employee.name}`
                );

                // -----------------------------
                // Create unique record key
                // -----------------------------
                const deviceIp = process.env.K30_IP;

                const recordKey =
                    `${userId}_${attTime.toISOString()}_${deviceIp}`;

                console.log(`🔑 Record Key: ${recordKey}`);

                // -----------------------------
                // Check duplicate
                // -----------------------------
                const existing = await Attendance.findOne({
                    recordKey
                });

                if (existing) {
                    console.log("ℹ️ Attendance already exists");
                    console.log(`RecordKey: ${recordKey}`);
                    return;
                }

                // -----------------------------
                // Save attendance
                // -----------------------------
                const attendance = await Attendance.create({
                    employee: employee._id,
                    deviceUserId: userId,
                    recordTime: attTime,
                    type: 0,
                    state: 0,
                    deviceIp,
                    recordKey
                });

                console.log("=================================");
                console.log("✅ REAL-TIME ATTENDANCE SAVED");
                console.log("=================================");

                console.log(`Employee : ${employee.name}`);
                console.log(`User ID  : ${userId}`);
                console.log(`Time     : ${attTime.toISOString()}`);
                console.log(`MongoDB  : ${attendance._id}`);

            } catch (error) {
                console.error(
                    "❌ Real-time attendance error:",
                    error.message
                );
            }
        });

    } catch (error) {
        console.error(
            "❌ Error starting K30 real-time service:",
            error.message
        );
    }
};

const stopRealtimeAttendance = async () => {
    if (!device) {
        return;
    }

    try {
        await device.disconnect();
        console.log("🛑 K30 real-time service stopped");
    } catch (error) {
        console.log(
            "⚠️ Disconnect warning:",
            error.message
        );
    } finally {
        device = null;
    }
};

module.exports = {
    startRealtimeAttendance,
    stopRealtimeAttendance
};
