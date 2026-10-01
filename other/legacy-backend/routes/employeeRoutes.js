const express = require("express");

const {
    getAllEmployees,
    syncK30Employees
} = require("../controllers/employeeController");

const router = express.Router();

router.get("/", getAllEmployees);
router.post("/sync", syncK30Employees);

module.exports = router;