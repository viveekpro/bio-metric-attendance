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

        console.log("✅ K30 connected\n");

        // 1. General device information
        console.log("========== DEVICE INFO ==========");

        const info = await device.getInfo();
        console.log(info);

        // 2. Device name
        console.log("\n========== DEVICE NAME ==========");

        const name = await device.getDeviceName();
        console.log(name);

        // 3. Firmware version
        console.log("\n========== FIRMWARE ==========");

        const version = await device.getDeviceVersion();
        console.log(version);

        // 4. Platform
        console.log("\n========== PLATFORM ==========");

        const platform = await device.getPlatform();
        console.log(platform);

        // 5. OS
        console.log("\n========== OS ==========");

        const os = await device.getOS();
        console.log(os);

        // 6. Device time
        console.log("\n========== DEVICE TIME ==========");

        const time = await device.getTime();
        console.log(time);

        // 7. Attendance count
        console.log("\n========== ATTENDANCE COUNT ==========");

        const attendanceSize = await device.getAttendanceSize();
        console.log(attendanceSize);

        await device.disconnect();

        console.log("\n✅ Disconnected from K30");

    } catch (error) {
        console.error("\n❌ ERROR:");
        console.error(error);
    }
}

testDevice();