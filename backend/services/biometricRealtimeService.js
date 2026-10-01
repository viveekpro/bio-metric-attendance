const deviceManager = require("./k30DeviceManager");

const startRealtimeAttendance = async () => {
    return await deviceManager.startRealtime();
};

const stopRealtimeAttendance = async () => {
    return await deviceManager.stopRealtime();
};

module.exports = {
    startRealtimeAttendance,
    stopRealtimeAttendance
};
