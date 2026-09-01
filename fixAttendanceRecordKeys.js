require("dotenv").config();

const connectDB = require("./config/db");
const Attendance = require("./models/Attendance");

const fixRecordKeys = async () => {
    try {
        await connectDB();

        console.log("=================================");
        console.log("FIXING ATTENDANCE RECORD KEYS");
        console.log("=================================");

        const records = await Attendance.find({
            $or: [
                { recordKey: null },
                { recordKey: { $exists: false } },
                { recordKey: "" }
            ]
        });

        console.log(
            `Records without recordKey: ${records.length}`
        );

        let updated = 0;
        let skipped = 0;

        for (const record of records) {
            try {
                if (
                    !record.deviceUserId ||
                    !record.recordTime
                ) {
                    skipped++;
                    continue;
                }

                const deviceIp =
                    record.deviceIp ||
                    process.env.K30_IP ||
                    "192.168.1.201";

                const recordTime =
                    new Date(record.recordTime);

                if (isNaN(recordTime.getTime())) {
                    skipped++;
                    continue;
                }

                const recordKey =
                    `${record.deviceUserId}_${recordTime.toISOString()}_${deviceIp}`;

                await Attendance.updateOne(
                    {
                        _id: record._id
                    },
                    {
                        $set: {
                            recordKey
                        }
                    }
                );

                updated++;

            } catch (error) {
                console.log(
                    `⚠️ Skipped record ${record._id}:`,
                    error.message
                );

                skipped++;
            }
        }

        console.log("\n=================================");
        console.log("RESULT");
        console.log("=================================");

        console.log(`Updated: ${updated}`);
        console.log(`Skipped: ${skipped}`);

        process.exit(0);

    } catch (error) {
        console.error("❌ Error:", error);
        process.exit(1);
    }
};

fixRecordKeys();