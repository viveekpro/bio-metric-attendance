const Employee = require("../models/Employee");
const {
    syncEmployees
} = require("../services/employeeSyncService");

const getAllEmployees = async (req, res) => {
    try {
        const employees = await Employee.find().sort({ deviceUserId: 1 });

        res.status(200).json({
            success: true,
            total: employees.length,
            data: employees
        });

    } catch (error) {
        console.error("Failed to fetch employees:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch employees",
            error: error.message
        });
    }
};

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
    getAllEmployees,
    syncK30Employees
};