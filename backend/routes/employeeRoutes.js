const express = require("express");

const {
    getAllEmployees,
    getEmployeeById,
    syncK30Employees
} = require("../controllers/employeeController");

const router = express.Router();

router.get("/", getAllEmployees);
router.get("/:deviceUserId", getEmployeeById);
router.post("/sync", syncK30Employees);

module.exports = router;
