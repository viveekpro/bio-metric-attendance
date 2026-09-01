const fs = require("fs");
const path = require("path");
const Zkteco = require("zkteco-js");

const DEVICE_IP = "192.168.1.201";
const DEVICE_PORT = 4370;

const backupDir = path.join(__dirname, "k30-backup");

if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
}

const device = new Zkteco(
    DEVICE_IP,
    DEVICE_PORT,
    10000,
    4000
);

function saveJson(filename, data) {
    const filePath = path.join(backupDir, filename);

    fs.writeFileSync(
        filePath,
        JSON.stringify(data, null, 2),
        "utf8"
    );

    console.log(`✅ Saved: ${filename}`);
}

async function fullBackup() {
    let connected = false;

    try {
        console.log("======================================");
        console.log("       K30 COMPLETE BACKUP");
        console.log("======================================\n");

        console.log(`Device: ${DEVICE_IP}:${DEVICE_PORT}`);
        console.log("Connecting to K30...\n");

        await device.createSocket();
        connected = true;

        console.log("✅ K30 connected\n");

        // -----------------------------------------
        // 1. DEVICE INFORMATION
        // -----------------------------------------

        console.log("========== DEVICE INFORMATION ==========");

        const info = await device.getInfo();

        console.dir(info, { depth: null });

        saveJson("device-info.json", {
            exportedAt: new Date().toISOString(),
            deviceIp: DEVICE_IP,
            info: info
        });

        // -----------------------------------------
        // 2. DEVICE NAME
        // -----------------------------------------

        let deviceName = null;

        try {
            deviceName = await device.getDeviceName();
        } catch (error) {
            console.log("⚠️ Could not read device name");
        }

        // -----------------------------------------
        // 3. FIRMWARE
        // -----------------------------------------

        let firmware = null;

        try {
            firmware = await device.getDeviceVersion();
        } catch (error) {
            console.log("⚠️ Could not read firmware");
        }

        // -----------------------------------------
        // 4. PLATFORM
        // -----------------------------------------

        let platform = null;

        try {
            platform = await device.getPlatform();
        } catch (error) {
            console.log("⚠️ Could not read platform");
        }

        // -----------------------------------------
        // 5. OS
        // -----------------------------------------

        let os = null;

        try {
            os = await device.getOS();
        } catch (error) {
            console.log("⚠️ Could not read OS");
        }

        // -----------------------------------------
        // 6. DEVICE TIME
        // -----------------------------------------

        let deviceTime = null;

        try {
            deviceTime = await device.getTime();
        } catch (error) {
            console.log("⚠️ Could not read device time");
        }

        saveJson("device-settings.json", {
            exportedAt: new Date().toISOString(),
            deviceIp: DEVICE_IP,
            deviceName,
            firmware,
            platform,
            os,
            deviceTime
        });

        // -----------------------------------------
        // 7. USERS
        // -----------------------------------------

        console.log("\n========== USERS ==========");

        const userResult = await device.getUsers();

        const users = userResult.data || userResult;

        console.log(`Users received: ${users.length}`);

        /*
         * Do NOT store password/PIN fields.
         * We only keep the information needed
         * to identify employees.
         */

        const safeUsers = users.map(user => ({
            uid: user.uid,
            userId: user.userId,
            name: user.name,
            role: user.role,
            cardno: user.cardno
        }));

        saveJson("users.json", {
            exportedAt: new Date().toISOString(),
            totalUsers: safeUsers.length,
            users: safeUsers
        });

        // -----------------------------------------
        // 8. ATTENDANCE
        // -----------------------------------------

        console.log("\n========== ATTENDANCE ==========");

        const attendanceResult = await device.getAttendances();

        const attendance =
            attendanceResult.data || attendanceResult;

        console.log(
            `Attendance records received: ${attendance.length}`
        );

        saveJson("attendance.json", {
            exportedAt: new Date().toISOString(),
            totalRecords: attendance.length,
            records: attendance
        });

        // -----------------------------------------
        // 9. BACKUP SUMMARY
        // -----------------------------------------

        const summary = {
            backupDate: new Date().toISOString(),

            device: {
                ip: DEVICE_IP,
                port: DEVICE_PORT
            },

            deviceInfo: {
                name: deviceName,
                firmware,
                platform,
                os,
                deviceTime
            },

            totals: {
                users: safeUsers.length,
                attendanceRecords: attendance.length
            },

            files: [
                "device-info.json",
                "device-settings.json",
                "users.json",
                "attendance.json"
            ]
        };

        saveJson("backup-summary.json", summary);

        console.log("\n======================================");
        console.log("       BACKUP COMPLETED");
        console.log("======================================");

        console.log(`\nBackup location:`);
        console.log(backupDir);

        console.log("\nBackup contents:");

        console.log("✅ device-info.json");
        console.log("✅ device-settings.json");
        console.log("✅ users.json");
        console.log("✅ attendance.json");
        console.log("✅ backup-summary.json");

        console.log(`\nUsers backed up: ${safeUsers.length}`);
        console.log(
            `Attendance backed up: ${attendance.length}`
        );

    } catch (error) {

        console.error("\n❌ BACKUP ERROR:");
        console.error(error);

    } finally {

        /*
         * The library can sometimes timeout while
         * sending the disconnect command after
         * reading a large attendance dataset.
         */

        if (connected) {
            try {
                await device.disconnect();
                console.log("\n✅ K30 disconnected");
            } catch (error) {
                console.log(
                    "\n⚠️ Disconnect warning:",
                    error.message
                );
            }
        }
    }
}

fullBackup();