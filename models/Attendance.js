const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
    {
        employee: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Employee",
            required: true
        },

        deviceUserId: {
            type: String,
            required: true
        },

        recordTime: {
            type: Date,
            required: true
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
            unique: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Attendance", attendanceSchema);