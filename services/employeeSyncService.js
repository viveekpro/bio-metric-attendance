const Employee = require("../models/Employee");
const { connectK30 } = require("./k30Service");

const syncEmployees = async () => {
    let device;

    try {
        console.log("Connecting to K30...");

        device = await connectK30();

        console.log("✅ K30 connected");

        const result = await device.getUsers();

        const users = result.data || result;

        console.log(`Users received from K30: ${users.length}`);

        let created = 0;
        let updated = 0;

        for (const user of users) {
            const existingEmployee = await Employee.findOne({
                deviceUserId: String(user.userId)
            });

            await Employee.findOneAndUpdate(
                {
                    deviceUserId: String(user.userId)
                },
                {
                    deviceUserId: String(user.userId),
                    name: user.name || "Unknown",
                    deviceUid: user.uid,
                    role: user.role,
                    cardNumber: user.cardno || 0
                },
                {
                    new: true,
                    upsert: true,
                    runValidators: true
                }
            );

            if (existingEmployee) {
                updated++;
            } else {
                created++;
            }
        }

        return {
            total: users.length,
            created,
            updated
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
    syncEmployees
};