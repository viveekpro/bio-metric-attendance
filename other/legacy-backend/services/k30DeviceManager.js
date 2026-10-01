const { connectK30, disconnectK30, K30_IP, K30_PORT } = require("./k30Service");
const Employee = require("../models/Employee");
const Attendance = require("../models/Attendance");

class K30DeviceManager {
    constructor() {
        this.realtimeDevice = null;
        this.isRealtimeRunning = false;
        this.isPausedForBatch = false;
        this.isBusy = false;
        this.reconnectTimer = null;
        this.reconnectDelay = 10000; // 10 seconds
        this.lastHeartbeat = null;
    }

    /**
     * Executes an exclusive operation on the K30 machine.
     * If the real-time listener is running, it temporarily pauses it,
     * performs the operation, and resumes real-time listening afterwards.
     */
    async withDeviceLock(operationName, fn) {
        while (this.isBusy) {
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        this.isBusy = true;
        const wasRealtimeRunning = this.isRealtimeRunning;

        try {
            if (wasRealtimeRunning) {
                console.log(`[K30 Lock] Pausing real-time listener for: ${operationName}...`);
                this.isPausedForBatch = true;
                await this.stopRealtime();
                // Brief pause to allow K30 socket to reset cleanly
                await new Promise(resolve => setTimeout(resolve, 1000));
            }

            console.log(`[K30 Lock] Executing exclusive task: ${operationName}...`);
            const result = await fn();
            return result;

        } finally {
            this.isBusy = false;
            this.isPausedForBatch = false;

            if (wasRealtimeRunning) {
                console.log(`[K30 Lock] Resuming real-time listener after ${operationName}...`);
                // Delay briefly before re-engaging realtime socket
                setTimeout(() => {
                    this.startRealtime().catch(err => {
                        console.error("[K30 Lock] Failed to resume real-time listener:", err.message);
                    });
                }, 1000);
            }
        }
    }

    /**
     * Starts the real-time attendance log listener.
     */
    async startRealtime() {
        if (this.isRealtimeRunning || this.isBusy) {
            return;
        }

        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }

        try {
            console.log("=================================");
            console.log("STARTING K30 REAL-TIME SERVICE");
            console.log(`Target: ${K30_IP}:${K30_PORT}`);
            console.log("=================================");

            this.realtimeDevice = await connectK30(10000);
            this.isRealtimeRunning = true;
            this.lastHeartbeat = new Date();

            console.log("🟢 K30 real-time listener active");

            await this.realtimeDevice.getRealTimeLogs(async (data) => {
                await this.handleRealtimeLog(data);
            });

        } catch (error) {
            console.error("❌ Error starting K30 real-time listener:", error.message);
            this.isRealtimeRunning = false;
            await disconnectK30(this.realtimeDevice);
            this.realtimeDevice = null;

            // Schedule auto-reconnect if not paused for batch work
            if (!this.isPausedForBatch) {
                this.scheduleReconnect();
            }
        }
    }

    /**
     * Automatically attempts to reconnect the real-time listener if dropped.
     */
    scheduleReconnect() {
        if (this.reconnectTimer || this.isPausedForBatch) return;

        console.log(`⏳ Will attempt K30 reconnection in ${this.reconnectDelay / 1000}s...`);
        this.reconnectTimer = setTimeout(async () => {
            this.reconnectTimer = null;
            if (!this.isRealtimeRunning && !this.isPausedForBatch) {
                console.log("🔄 Attempting K30 auto-reconnection...");
                await this.startRealtime();
            }
        }, this.reconnectDelay);
    }

    /**
     * Stops the real-time listener gracefully.
     */
    async stopRealtime() {
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }

        this.isRealtimeRunning = false;

        if (this.realtimeDevice) {
            try {
                await disconnectK30(this.realtimeDevice);
                console.log("🛑 K30 real-time listener stopped");
            } catch (err) {
                console.log("Disconnect notice:", err.message);
            } finally {
                this.realtimeDevice = null;
            }
        }
    }

    /**
     * Handles an incoming real-time attendance log event.
     */
    async handleRealtimeLog(data) {
        try {
            this.lastHeartbeat = new Date();
            const userId = String(data.userId);
            const attTime = new Date(data.attTime);

            if (!userId || userId === "undefined" || isNaN(attTime.getTime())) {
                console.log("⚠️ Attendance ignored: invalid log payload", data);
                return;
            }

            console.log(`\n🔔 Real-Time Punch: User ${userId} at ${attTime.toISOString()}`);

            // Find employee
            const employee = await Employee.findOne({ deviceUserId: userId });
            if (!employee) {
                console.log(`⚠️ Employee not enrolled for K30 userId: ${userId}`);
                return;
            }

            const deviceIp = K30_IP;
            const recordKey = `${userId}_${attTime.toISOString()}_${deviceIp}`;

            // Check duplicate
            const existing = await Attendance.findOne({ recordKey });
            if (existing) {
                console.log(`ℹ️ Attendance already logged (${recordKey})`);
                return;
            }

            // Save record
            const attendance = await Attendance.create({
                employee: employee._id,
                deviceUserId: userId,
                recordTime: attTime,
                type: data.verifyType ?? 0,
                state: data.attState ?? 0,
                deviceIp,
                recordKey
            });

            console.log(`✅ Logged: ${employee.name} (${userId}) - MongoDB ID: ${attendance._id}`);

        } catch (error) {
            console.error("❌ Error processing real-time log:", error.message);
        }
    }

    /**
     * Checks device health, time, and firmware status.
     */
    async getDeviceStatus() {
        return await this.withDeviceLock("getDeviceStatus", async () => {
            const device = await connectK30(5000);
            try {
                const [time, info] = await Promise.all([
                    device.getTime().catch(() => null),
                    device.getInfo().catch(() => null)
                ]);

                return {
                    online: true,
                    ip: K30_IP,
                    port: K30_PORT,
                    deviceTime: time,
                    serverTime: new Date(),
                    info
                };
            } finally {
                await disconnectK30(device);
            }
        });
    }

    /**
     * Synchronizes the K30 hardware clock to match the current server time.
     */
    async syncDeviceTime() {
        return await this.withDeviceLock("syncDeviceTime", async () => {
            const device = await connectK30(6000);
            try {
                const now = new Date();
                await device.setTime(now);
                const updatedTime = await device.getTime();

                return {
                    success: true,
                    serverTime: now,
                    deviceTime: updatedTime
                };
            } finally {
                await disconnectK30(device);
            }
        });
    }
}

// Singleton instance
const deviceManager = new K30DeviceManager();

module.exports = deviceManager;
