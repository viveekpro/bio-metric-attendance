const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
    {
        deviceUserId: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            index: true
        },

        name: {
            type: String,
            required: true,
            trim: true
        },

        deviceUid: {
            type: Number,
            default: 0
        },

        role: {
            type: Number,
            default: 0
        },

        cardNumber: {
            type: Number,
            default: 0,
            index: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Employee", employeeSchema);
