require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");

const employeeRoutes = require("./routes/employeeRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");

const {
    startRealtimeAttendance,
    stopRealtimeAttendance
} = require("./services/biometricRealtimeService");

const app = express();

app.use(cors());
app.use(express.json());

const startServer = async () => {
    try {
        // Connect MongoDB
        await connectDB();

        // API routes
        app.use("/api/employees", employeeRoutes);
        app.use("/api/attendance", attendanceRoutes);

        app.get("/", (req, res) => {
            res.json({
                message: "K30 Attendance Server is running"
            });
        });

        const PORT = process.env.PORT || 5000;

        app.listen(PORT, async () => {
            console.log(
                `🚀 Server running on http://localhost:${PORT}`
            );

            // Start K30 real-time listener
            await startRealtimeAttendance();
        });

        // Graceful shutdown
        process.on("SIGINT", async () => {
            console.log("\nShutting down server...");

            await stopRealtimeAttendance();

            process.exit(0);
        });

    } catch (error) {
        console.error("❌ Server startup failed:", error);
        process.exit(1);
    }
};

startServer();