require("dotenv").config();

const connectDB = require("./config/db");
const Attendance = require("./models/Attendance");

const removeDuplicates = async () => {
    try {
        await connectDB();

        console.log("=================================");
        console.log("REMOVING DUPLICATE ATTENDANCE");
        console.log("=================================");

        const duplicateGroups = await Attendance.aggregate([
            {
                $group: {
                    _id: "$recordKey",
                    ids: { $push: "$_id" },
                    count: { $sum: 1 }
                }
            },
            {
                $match: {
                    _id: { $ne: null },
                    count: { $gt: 1 }
                }
            }
        ]);

        console.log(
            `Duplicate groups found: ${duplicateGroups.length}`
        );

        let deletedCount = 0;

        for (const group of duplicateGroups) {
            // Keep the first record
            const idsToDelete = group.ids.slice(1);

            if (idsToDelete.length > 0) {
                const result = await Attendance.deleteMany({
                    _id: {
                        $in: idsToDelete
                    }
                });

                deletedCount += result.deletedCount;
            }
        }

        console.log("\n=================================");
        console.log("CLEANUP COMPLETED");
        console.log("=================================");

        console.log(
            `Duplicate records deleted: ${deletedCount}`
        );

        const remaining =
            await Attendance.countDocuments();

        console.log(
            `Remaining attendance records: ${remaining}`
        );

        process.exit(0);

    } catch (error) {
        console.error("❌ Error:", error);
        process.exit(1);
    }
};

removeDuplicates();