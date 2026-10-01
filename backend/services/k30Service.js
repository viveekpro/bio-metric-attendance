const Zkteco = require("zkteco-js");

const K30_IP = process.env.K30_IP || "192.168.1.201";
const K30_PORT = Number(process.env.K30_PORT) || 4370;

const connectK30 = async (timeoutMs = 10000) => {
    const device = new Zkteco(
        K30_IP,
        K30_PORT,
        timeoutMs,
        4000
    );

    await device.createSocket();
    return device;
};

const disconnectK30 = async (device) => {
    if (!device) return;
    try {
        await device.disconnect();
    } catch (err) {
        // Disconnection timeouts on large datasets are expected in zkteco-js
    }
};

module.exports = {
    connectK30,
    disconnectK30,
    K30_IP,
    K30_PORT
};
