const Employee = require("../models/Employee");
const { connectK30, disconnectK30 } = require("./k30Service");
const deviceManager = require("./k30DeviceManager");

const syncEmployees = async () => {
    return await deviceManager.withDeviceLock("syncEmployees", async () => {
        let device;
        try {
            console.log("Connecting to K30 for employee synchronization...");
            device = await connectK30(10000);
            console.log("✅ K30 connected for employee synchronization");

            const result = await device.getUsers();
            const users = result.data || result;

            console.log(`Users received from K30: ${users.length}`);

            let created = 0;
            let updated = 0;

            for (const user of users) {
                const userIdStr = String(user.userId);
                const existingEmployee = await Employee.findOne({
                    deviceUserId: userIdStr
                });

                await Employee.findOneAndUpdate(
                    { deviceUserId: userIdStr },
                    {
                        deviceUserId: userIdStr,
                        name: user.name || "Unknown",
                        deviceUid: user.uid ?? 0,
                        role: user.role ?? 0,
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

            console.log(`✅ Employees sync finished: ${created} created, ${updated} updated`);

            return {
                total: users.length,
                created,
                updated
            };

        } finally {
            await disconnectK30(device);
        }
    });
};

module.exports = {
    syncEmployees
};
