const Attendance = require("../models/Attendance");
const Employee = require("../models/Employee");
const { connectK30, disconnectK30, K30_IP } = require("./k30Service");
const deviceManager = require("./k30DeviceManager");

const CHUNK_SIZE = 500;

const syncAttendance = async () => {
    return await deviceManager.withDeviceLock("syncAttendance", async () => {
        let device;

        try {
            console.log("Connecting to K30 for attendance synchronization...");
            device = await connectK30(15000);
            console.log("✅ K30 connected for attendance sync");

            console.log("Reading attendance records from device...");
            const result = await device.getAttendances();
            const records = result.data || result;

            console.log(`Attendance records received from device: ${records.length}`);

            // Fetch all employees to cache in a map for O(1) lookup
            const employees = await Employee.find().lean();
            const employeeMap = new Map();
            for (const emp of employees) {
                employeeMap.set(String(emp.deviceUserId), emp);
            }

            const operations = [];
            const missingEmployeeIds = new Set();
            let invalidDateCount = 0;

            for (const record of records) {
                const deviceUserId = String(record.user_id);
                const employee = employeeMap.get(deviceUserId);

                if (!employee) {
                    missingEmployeeIds.add(deviceUserId);
                    continue;
                }

                const recordTime = new Date(record.record_time);
                if (isNaN(recordTime.getTime())) {
                    invalidDateCount++;
                    continue;
                }

                const deviceIp = record.ip || K30_IP;
                const recordKey = `${deviceUserId}_${recordTime.toISOString()}_${deviceIp}`;

                operations.push({
                    updateOne: {
                        filter: { recordKey },
                        update: {
                            $setOnInsert: {
                                employee: employee._id,
                                deviceUserId,
                                recordTime,
                                type: record.type ?? 0,
                                state: record.state ?? 0,
                                deviceIp,
                                recordKey
                            }
                        },
                        upsert: true
                    }
                });
            }

            console.log(`Valid operations prepared: ${operations.length}`);

            if (operations.length === 0) {
                return {
                    totalRecordsFromDevice: records.length,
                    validRecords: 0,
                    created: 0,
                    alreadyExists: 0,
                    missingEmployeeIds: Array.from(missingEmployeeIds),
                    invalidDateCount
                };
            }

            // Execute in batches of CHUNK_SIZE to prevent MongoDB memory spikes
            let totalCreated = 0;
            for (let i = 0; i < operations.length; i += CHUNK_SIZE) {
                const chunk = operations.slice(i, i + CHUNK_SIZE);
                const bulkResult = await Attendance.bulkWrite(chunk, { ordered: false });
                totalCreated += bulkResult.upsertedCount || 0;
            }

            const alreadyExists = operations.length - totalCreated;
            console.log(`✅ Attendance sync completed. New: ${totalCreated}, Existing: ${alreadyExists}`);

            return {
                totalRecordsFromDevice: records.length,
                validRecords: operations.length,
                created: totalCreated,
                alreadyExists,
                missingEmployeeIds: Array.from(missingEmployeeIds),
                invalidDateCount
            };

        } finally {
            await disconnectK30(device);
        }
    });
};

module.exports = {
    syncAttendance
};
