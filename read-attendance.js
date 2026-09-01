const Zkteco = require("zkteco-js");

const device = new Zkteco(
    "192.168.1.201",
    4370,
    10000,
    4000
);

async function readAttendance() {
    try {
        console.log("Connecting to K30...");

        await device.createSocket();

        console.log("✅ K30 connected\n");

        console.log("Reading attendance records...");

        const result = await device.getAttendances();

        console.log("\n========== ATTENDANCE RESULT ==========");

        console.log("Result type:", typeof result);

        console.log("Result keys:", Object.keys(result));

        console.log("\nFirst 10 records:");

        console.dir(
            result.data
                ? result.data.slice(0, 10)
                : result.slice(0, 10),
            { depth: null }
        );

        const attendance = result.data || result;

        console.log("\nTotal records received:", attendance.length);

        await device.disconnect();

        console.log("\n✅ Disconnected from K30");

    } catch (error) {
        console.error("\n❌ ERROR:");
        console.error(error);
    }
}

readAttendance();