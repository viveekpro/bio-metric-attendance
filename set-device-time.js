const Zkteco = require("zkteco-js");

const device = new Zkteco(
    "192.168.1.201",
    4370,
    10000,
    4000
);

async function setDeviceTime() {
    try {
        console.log("Connecting to K30...");

        await device.createSocket();

        console.log("✅ K30 connected");

        // Get Windows PC local time
        const pcTime = new Date();

        console.log("\n========== PC TIME ==========");
        console.log(pcTime.toString());

        console.log("\nSetting K30 time...");

        await device.setTime(pcTime);

        console.log("✅ K30 time set successfully");

        // Read time back from K30
        console.log("\n========== K30 TIME ==========");

        const k30Time = await device.getTime();

        console.log(k30Time);

        console.log("\n========== COMPARISON ==========");

        console.log("PC time : ", pcTime.toString());
        console.log("K30 time:", k30Time.toString());

        await device.disconnect();

        console.log("\n✅ Disconnected from K30");

    } catch (error) {
        console.error("\n❌ ERROR:");
        console.error(error);
    }
}

setDeviceTime();