const {
    syncEmployees
} = require("../services/employeeSyncService");

const syncK30Employees = async (req, res) => {
    try {
        const result = await syncEmployees();

        res.status(200).json({
            success: true,
            message: "Employees synchronized successfully",
            data: result
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Employee synchronization failed",
            error: error.message
        });
    }
};

module.exports = {
    syncK30Employees
};