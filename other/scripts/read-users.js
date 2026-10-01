const Zkteco = require("zkteco-js");

const device = new Zkteco(
    "192.168.1.201",
    4370,
    10000,
    4000
);

async function readUsers() {
    try {
        console.log("Connecting to K30...");

        await device.createSocket();

        console.log("✅ Connected\n");

        const users = await device.getUsers();

        console.log("========== USERS ==========");
        console.log(users);

        console.log("\n========== USER COUNT ==========");
        console.log("Total users:", users.data.length);

        await device.disconnect();

        console.log("\n✅ Disconnected");

    } catch (error) {
        console.error("\n❌ ERROR:");
        console.error(error);
    }
}

readUsers();