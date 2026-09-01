const Zkteco = require("zkteco-js");

const device = new Zkteco(
    "192.168.1.201",
    4370,
    10000,
    4000
);

async function readLatestAttendance() {
    try {
        console.log("Connecting to K30...");

        await device.createSocket();

        console.log("✅ Connected\n");

        const result = await device.getAttendances();

        const attendance = result.data || result;

        console.log("Total records:", attendance.length);

        // Convert record_time to Date for sorting
        const sorted = [...attendance].sort(
            (a, b) =>
                new Date(b.record_time) -
                new Date(a.record_time)
        );

        console.log("\n========== LATEST 10 RECORDS ==========");

        console.dir(
            sorted.slice(0, 10),
            { depth: null }
        );

        try {
            await device.disconnect();
        } catch (error) {
            console.log(
                "Disconnect warning:",
                error.message
            );
        }

    } catch (error) {
        console.error("\n❌ ERROR:");
        console.error(error);
    }
}

readLatestAttendance();