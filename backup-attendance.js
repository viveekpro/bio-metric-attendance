const fs = require("fs");
const Zkteco = require("zkteco-js");

const device = new Zkteco(
    "192.168.1.201",
    4370,
    10000,
    4000
);

async function backupAttendance() {
    try {
        console.log("Connecting to K30...");

        await device.createSocket();

        console.log("✅ Connected");

        console.log("Reading attendance...");

        const result = await device.getAttendances();

        const attendance = result.data || result;

        console.log(`Received ${attendance.length} records`);

        const backup = {
            deviceIp: "192.168.1.201",
            exportedAt: new Date().toISOString(),
            totalRecords: attendance.length,
            records: attendance
        };

        fs.writeFileSync(
            "attendance-backup.json",
            JSON.stringify(backup, null, 2)
        );

        console.log("✅ Backup created:");
        console.log("attendance-backup.json");

        // Don't send another command after the large read.
        // The library's disconnect can sometimes timeout.
        try {
            await device.disconnect();
        } catch (disconnectError) {
            console.log(
                "Disconnect warning:",
                disconnectError.message
            );
        }

        console.log("Done.");

    } catch (error) {
        console.error("❌ ERROR:", error);
    }
}

backupAttendance();