const path = require("path");
const fs = require("fs");
const dotenv = require("dotenv");

// Load primary environment variables
dotenv.config();

// Load gitignored credentials file if present
const credentialCandidates = [
    path.join(__dirname, "credentials.env"),
    path.join(__dirname, "../credentials.env"),
    path.join(__dirname, ".credentials"),
    path.join(__dirname, "../.credentials")
];

for (const credFile of credentialCandidates) {
    if (fs.existsSync(credFile)) {
        dotenv.config({ path: credFile, override: true });
        break;
    }
}

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const employeeRoutes = require("./routes/employeeRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const deviceRoutes = require("./routes/deviceRoutes");

const { protect } = require("./middleware/authMiddleware");
const { seedInitialAdmin } = require("./controllers/authController");

const {
    startRealtimeAttendance,
    stopRealtimeAttendance
} = require("./services/biometricRealtimeService");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Public Auth Routes
app.use("/api/auth", authRoutes);

// Protected API Routes (requires Bearer token)
app.use("/api/employees", protect, employeeRoutes);
app.use("/api/attendance", protect, attendanceRoutes);
app.use("/api/device", protect, deviceRoutes);

// Root and Health check
app.get("/", (req, res) => {
    res.json({
        name: "ZK-K30 Attendance Server",
        version: "2.0.0",
        status: "running",
        auth: "JWT enabled",
        endpoints: {
            auth: "/api/auth/login",
            employees: "/api/employees",
            attendance: "/api/attendance",
            device: "/api/device"
        }
    });
});

app.get("/api/health", (req, res) => {
    res.json({
        status: "healthy",
        uptime: process.uptime(),
        timestamp: new Date()
    });
});

// Central Error Handler
app.use((err, req, res, next) => {
    console.error("Unhandled error:", err);
    res.status(500).json({
        success: false,
        message: "Internal server error",
        error: err.message
    });
});

const startServer = async () => {
    try {
        // Connect to MongoDB
        await connectDB();

        // Seed default admin account if database is empty
        await seedInitialAdmin();

        const PORT = process.env.PORT || 5000;

        const server = app.listen(PORT, async () => {
            console.log(`🚀 K30 Backend Server running on http://localhost:${PORT}`);

            // Start K30 real-time listener
            await startRealtimeAttendance();
        });

        // Graceful shutdown
        const shutdown = async (signal) => {
            console.log(`\nReceived ${signal}. Shutting down gracefully...`);
            await stopRealtimeAttendance();
            server.close(() => {
                console.log("HTTP server closed.");
                process.exit(0);
            });
        };

        process.on("SIGINT", () => shutdown("SIGINT"));
        process.on("SIGTERM", () => shutdown("SIGTERM"));

    } catch (error) {
        console.error("❌ Server startup failed:", error);
        process.exit(1);
    }
};

startServer();
