const Zkteco = require("zkteco-js");

const connectK30 = async () => {
    const device = new Zkteco(
        process.env.K30_IP,
        Number(process.env.K30_PORT),
        10000,
        4000
    );

    await device.createSocket();

    return device;
};

module.exports = {
    connectK30
};