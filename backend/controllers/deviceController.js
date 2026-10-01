const deviceManager = require("../services/k30DeviceManager");

/**
 * Check K30 device status, firmware, and clock
 */
const getDeviceStatus = async (req, res) => {
    try {
        const status = await deviceManager.getDeviceStatus();

        res.status(200).json({
            success: true,
            data: status
        });

    } catch (error) {
        console.error("Device status check failed:", error.message);
        res.status(503).json({
            success: false,
            message: "K30 device is unreachable or offline",
            error: error.message
        });
    }
};

/**
 * Synchronize K30 hardware clock with current server time
 */
const syncDeviceTime = async (req, res) => {
    try {
        const result = await deviceManager.syncDeviceTime();

        res.status(200).json({
            success: true,
            message: "K30 hardware clock synchronized successfully",
            data: result
        });

    } catch (error) {
        console.error("Device time sync failed:", error.message);
        res.status(500).json({
            success: false,
            message: "Failed to synchronize K30 clock",
            error: error.message
        });
    }
};

module.exports = {
    getDeviceStatus,
    syncDeviceTime
};
