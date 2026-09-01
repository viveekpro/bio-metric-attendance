const net = require("net");

const client = new net.Socket();

client.connect(4370, "192.168.1.201", () => {
    console.log("Connected to K30");
});

client.on("error", (err) => {
    console.log(err.message);
});

client.on("close", () => {
    console.log("Disconnected");
});