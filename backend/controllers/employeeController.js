const Employee = require("../models/Employee");
const { syncEmployees } = require("../services/employeeSyncService");

/**
 * Get all registered employees sorted by deviceUserId
 */
const getAllEmployees = async (req, res) => {
    try {
        const employees = await Employee.find().sort({ deviceUserId: 1 });

        res.status(200).json({
            success: true,
            total: employees.length,
            data: employees
        });

    } catch (error) {
        console.error("Fetch employees error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch employees",
            error: error.message
        });
    }
};

/**
 * Get single employee by deviceUserId
 */
const getEmployeeById = async (req, res) => {
    try {
        const { deviceUserId } = req.params;
        const employee = await Employee.findOne({ deviceUserId: String(deviceUserId) });

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: "Employee not found"
            });
        }

        res.status(200).json({
            success: true,
            data: employee
        });

    } catch (error) {
        console.error("Fetch employee error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch employee",
            error: error.message
        });
    }
};

/**
 * Synchronize employees from K30 machine into MongoDB
 */
const syncK30Employees = async (req, res) => {
    try {
        const result = await syncEmployees();

        res.status(200).json({
            success: true,
            message: "Employees synchronized successfully",
            data: result
        });

    } catch (error) {
        console.error("Employee sync error:", error);
        res.status(500).json({
            success: false,
            message: "Employee synchronization failed",
            error: error.message
        });
    }
};

module.exports = {
    getAllEmployees,
    getEmployeeById,
    syncK30Employees
};
