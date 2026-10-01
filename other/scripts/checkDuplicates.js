require("dotenv").config();

const connectDB = require("./config/db");
const Attendance = require("./models/Attendance");

const checkDuplicates = async () => {
    try {
        await connectDB();

        const duplicates = await Attendance.aggregate([
            {
                $group: {
                    _id: "$recordKey",
                    count: { $sum: 1 }
                }
            },
            {
                $match: {
                    count: { $gt: 1 }
                }
            }
        ]);

        console.log("=================================");
        console.log("DUPLICATE CHECK");
        console.log("=================================");

        console.log(
            "Duplicate record groups:",
            duplicates.length
        );

        if (duplicates.length > 0) {
            console.log("\nFirst 10 duplicates:");
            console.log(duplicates.slice(0, 10));
        } else {
            console.log(
                "\n✅ No duplicate recordKeys found."
            );
        }

        process.exit(0);

    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
};

checkDuplicates();