const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/biometricAttendance";
        
        await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 5000,
        });

        console.log(`✅ MongoDB connected successfully to ${mongoose.connection.name}`);

        mongoose.connection.on("error", (err) => {
            console.error("❌ MongoDB connection error:", err.message);
        });

        mongoose.connection.on("disconnected", () => {
            console.warn("⚠️ MongoDB disconnected. Waiting for reconnection...");
        });

    } catch (error) {
        console.error("❌ MongoDB connection failed:", error.message);
        process.exit(1);
    }
};

module.exports = connectDB;
