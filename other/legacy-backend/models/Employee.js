const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
    {
        deviceUserId: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },

        name: {
            type: String,
            required: true,
            trim: true
        },

        deviceUid: {
            type: Number
        },

        role: {
            type: Number,
            default: 0
        },

        cardNumber: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "Employee",
    employeeSchema
);