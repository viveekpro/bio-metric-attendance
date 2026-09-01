const Attendance = require("../models/Attendance");
const Employee = require("../models/Employee");

const { connectK30 } = require("./k30Service");

const syncAttendance = async () => {
    let device;

    try {
        console.log("Connecting to K30...");

        device = await connectK30();

        console.log("✅ K30 connected");
        console.log("Reading attendance records...");

        const result = await device.getAttendances();

        const records = result.data || result;

        console.log(
            `Attendance records received: ${records.length}`
        );

        // Get all employees only once
        console.log("Loading employees from MongoDB...");

        const employees = await Employee.find();

        console.log(
            `Employees found in MongoDB: ${employees.length}`
        );

        // Create fast lookup map
        const employeeMap = new Map();

        for (const employee of employees) {
            employeeMap.set(
                String(employee.deviceUserId),
                employee
            );
        }

        const operations = [];
        const missingEmployeeIds = new Set();
        let invalidDateCount = 0;

        console.log("Preparing attendance records...");

        for (const record of records) {
            const deviceUserId = String(record.user_id);

            const employee = employeeMap.get(deviceUserId);

            if (!employee) {
                missingEmployeeIds.add(deviceUserId);
                continue;
            }

            const recordTime = new Date(record.record_time);

            // Skip invalid dates
            if (isNaN(recordTime.getTime())) {
                invalidDateCount++;
                continue;
            }

            const deviceIp =
                record.ip || process.env.K30_IP;

            const recordKey =
                `${deviceUserId}_${recordTime.toISOString()}_${deviceIp}`;

            operations.push({
                updateOne: {
                    filter: {
                        recordKey
                    },

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

        console.log(
            `Valid attendance records prepared: ${operations.length}`
        );

        console.log(
            `Missing employee IDs: ${
                missingEmployeeIds.size > 0
                    ? Array.from(missingEmployeeIds).join(", ")
                    : "None"
            }`
        );

        console.log(
            `Invalid dates skipped: ${invalidDateCount}`
        );

        if (operations.length === 0) {
            return {
                totalRecordsFromDevice: records.length,
                validRecords: 0,
                created: 0,
                alreadyExists: 0,
                missingEmployeeIds: Array.from(
                    missingEmployeeIds
                ),
                invalidDateCount
            };
        }

        console.log("Saving attendance records to MongoDB...");

        const bulkResult = await Attendance.bulkWrite(
            operations,
            {
                ordered: false
            }
        );

        const created =
            bulkResult.upsertedCount || 0;

        const alreadyExists =
            operations.length - created;

        console.log("✅ Attendance synchronization completed");

        return {
            totalRecordsFromDevice: records.length,

            validRecords: operations.length,

            created,

            alreadyExists,

            missingEmployeeIds: Array.from(
                missingEmployeeIds
            ),

            missingEmployeeRecordCount:
                records.filter(
                    record =>
                        !employeeMap.has(
                            String(record.user_id)
                        )
                ).length,

            invalidDateCount
        };

    } finally {
        if (device) {
            try {
                await device.disconnect();

                console.log("✅ K30 disconnected");

            } catch (error) {
                console.log(
                    "⚠️ Disconnect warning:",
                    error.message
                );
            }
        }
    }
};

module.exports = {
    syncAttendance
};