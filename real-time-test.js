const Zkteco = require("zkteco-js");

const device = new Zkteco(
    "192.168.1.201",
    4370,
    10000,
    4000
);

async function start() {
    try {
        console.log("Connecting to K30...");

        await device.createSocket();

        console.log("✅ K30 connected");
        console.log("Waiting for real-time attendance...");
        console.log("Please make one fingerprint/card verification on K30.");

        await device.getRealTimeLogs((data) => {
            console.log("\n=================================");
            console.log("🔔 REAL-TIME ATTENDANCE");
            console.log("=================================");

            console.log(data);
        });

    } catch (error) {
        console.error("❌ Error:", error);
    }
}

start();