const Zkteco = require("zkteco-js");

const device = new Zkteco(
    "192.168.1.201",
    4370,
    10000,
    4000
);

async function testDevice() {
    try {
        console.log("Connecting to K30...");

        await device.createSocket();

        console.log("✅ K30 connected successfully!");

        await device.enableDevice();

        console.log("✅ Device communication enabled.");

        await device.disconnect();

        console.log("✅ Disconnected from K30.");
    } catch (error) {
        console.error("❌ K30 Error:");
        console.error(error);
    }
}

testDevice();