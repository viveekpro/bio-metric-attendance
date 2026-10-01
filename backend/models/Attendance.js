const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
    {
        employee: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Employee",
            required: true,
            index: true
        },

        deviceUserId: {
            type: String,
            required: true,
            index: true
        },

        recordTime: {
            type: Date,
            required: true,
            index: true
        },

        type: {
            type: Number,
            default: 0
        },

        state: {
            type: Number,
            default: 0
        },

        deviceIp: {
            type: String,
            required: true
        },

        recordKey: {
            type: String,
            required: true,
            unique: true,
            index: true
        }
    },
    {
        timestamps: true
    }
);

// Compound index for querying an employee's attendance by time range efficiently
attendanceSchema.index({ employee: 1, recordTime: -1 });
attendanceSchema.index({ deviceUserId: 1, recordTime: -1 });

module.exports = mongoose.model("Attendance", attendanceSchema);
