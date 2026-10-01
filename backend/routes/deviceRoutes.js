const express = require("express");

const {
    getDeviceStatus,
    syncDeviceTime
} = require("../controllers/deviceController");

const router = express.Router();

router.get("/status", getDeviceStatus);
router.post("/sync-time", syncDeviceTime);

module.exports = router;
