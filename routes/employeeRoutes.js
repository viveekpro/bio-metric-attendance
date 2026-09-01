const express = require("express");

const {
    syncK30Employees
} = require("../controllers/employeeController");

const router = express.Router();

router.post("/sync", syncK30Employees);

module.exports = router;