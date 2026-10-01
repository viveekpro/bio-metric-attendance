const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET || "biometric_attendance_jwt_secret_key_2026_super_secure";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

const generateToken = (id) => {
    return jwt.sign({ id }, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN
    });
};

/**
 * User Login
 * POST /api/auth/login
 */
const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: "Please provide both username and password"
            });
        }

        const user = await User.findOne({ username: username.toLowerCase().trim() });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials"
            });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials"
            });
        }

        const token = generateToken(user._id);

        res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: {
                id: user._id,
                username: user.username,
                name: user.name,
                role: user.role
            }
        });

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({
            success: false,
            message: "Login failed",
            error: error.message
        });
    }
};

/**
 * Get current authenticated user
 * GET /api/auth/me
 */
const getMe = async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            user: {
                id: req.user._id,
                username: req.user.username,
                name: req.user.name,
                role: req.user.role,
                createdAt: req.user.createdAt
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch profile",
            error: error.message
        });
    }
};

/**
 * Register a new user (admin-only)
 * POST /api/auth/register
 */
const register = async (req, res) => {
    try {
        const { username, name, password, role } = req.body;

        if (!username || !name || !password) {
            return res.status(400).json({
                success: false,
                message: "Please provide username, name, and password"
            });
        }

        const existing = await User.findOne({ username: username.toLowerCase().trim() });
        if (existing) {
            return res.status(400).json({
                success: false,
                message: "Username already in use"
            });
        }

        const newUser = await User.create({
            username: username.toLowerCase().trim(),
            name: name.trim(),
            password,
            role: role || "admin"
        });

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            user: {
                id: newUser._id,
                username: newUser.username,
                name: newUser.name,
                role: newUser.role
            }
        });

    } catch (error) {
        console.error("Register error:", error);
        res.status(500).json({
            success: false,
            message: "User registration failed",
            error: error.message
        });
    }
};

/**
 * Change Password
 * PUT /api/auth/change-password
 */
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Please provide both current and new password"
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: "New password must be at least 6 characters"
            });
        }

        const user = await User.findById(req.user._id);
        const isMatch = await user.comparePassword(currentPassword);

        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Incorrect current password"
            });
        }

        user.password = newPassword;
        await user.save();

        res.status(200).json({
            success: true,
            message: "Password changed successfully"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to change password",
            error: error.message
        });
    }
};

/**
 * Automatic initialization of administrator account from gitignored credentials
 */
const seedInitialAdmin = async () => {
    try {
        const adminUsername = (process.env.ADMIN_USERNAME || "admin").toLowerCase().trim();
        const adminPassword = process.env.ADMIN_PASSWORD;

        if (!adminPassword) {
            console.warn("⚠️ Warning: ADMIN_PASSWORD is not set in credentials.env. Admin account initialization skipped.");
            return;
        }

        let adminUser = await User.findOne({ username: adminUsername });

        if (!adminUser) {
            console.log("⚡ Initializing administrator account from credentials file...");
            adminUser = new User({
                username: adminUsername,
                name: process.env.ADMIN_NAME || "System Administrator",
                password: adminPassword,
                role: "admin"
            });
            await adminUser.save();
            console.log(`✅ Administrator account initialized for user: ${adminUsername}`);
            console.log("   Password securely loaded from gitignored credentials file.");
        } else {
            // Optional sync if user changed password in credentials.env
            const isMatch = await adminUser.comparePassword(adminPassword);
            if (!isMatch && process.env.SYNC_CREDENTIALS_FILE === "true") {
                adminUser.password = adminPassword;
                await adminUser.save();
                console.log(`🔐 Administrator password synchronized from credentials file.`);
            }
        }
    } catch (error) {
        console.error("⚠️ Failed to initialize admin account:", error.message);
    }
};

module.exports = {
    login,
    getMe,
    register,
    changePassword,
    seedInitialAdmin
};
