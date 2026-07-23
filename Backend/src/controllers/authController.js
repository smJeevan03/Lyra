const jwt = require('jsonwebtoken')
const User = require("../models/userModel")


// Generate JWT token
const generateToken = (id) => {
    return jwt.sign(
        { id },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRE_TIME || "1d",
        }
    );
};

// @description Register a new user
// @route POST /api/auth/register
// @access Public
const register = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;

        // Check if user already exists
        const userExists = await User.findOne({
            $or: [
                { email },
                { username },
            ],
        });

        if (userExists) {
            return res.status(400).json({
                success: false,
                error:
                    userExists.email === email
                        ? "Email Already Registered"
                        : "Username Already Taken",
            });
        }

        // Create user
        const user = await User.create({
            username,
            email,
            password,
        });

        // Generate token
        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            message: "User Registered Successfully",
            data: {
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    profileImage: user.profileImage,
                    createdAt: user.createdAt,
                },
            },
            token
        });
    }
    catch (error) {
        console.error(error);
        console.error(error.stack);

        return res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};

// @description login user
// @route POST/api/auth/login
// @access Public
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: "Please provide email and password",
            });
        }

        // Find user and include password
        const user = await User.findOne({ email }).select("+password");

        if (!user) {
            return res.status(401).json({
                success: false,
                error: "Invalid credentials",
            });
        }

        // Compare password
        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                error: "Invalid credentials",
            });
        }

        // Generate JWT
        const token = generateToken(user._id);

        return res.status(200).json({
            success: true,
            message: "Login Successful",
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                profileImage: user.profileImage,
            },
            token
        });

    } catch (error) {
        next(error);
    }
};


// @description Get user profile
// @route GET/api/auth/profile
// @access private

const getProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);

        // Check if user exists
        if (!user) {
            return res.status(404).json({
                success: false,
                error: "User not found",
            });
        }

        return res.status(200).json({
            success: true,
            data: {
                id: user._id,
                username: user.username,
                email: user.email,
                profileImage: user.profileImage,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            },
        });
    } catch (error) {
        next(error);
    }
};


// @description Update user profile
// @route GET/api/auth/profile
// @access private

const updateProfile = async (req, res, next) => {
    try {
        const { username, email, profileImage } = req.body;

        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                success: false,
                error: "User not found",
            });
        }

        if (username) user.username = username;
        if (email) user.email = email;
        if (profileImage) user.profileImage = profileImage;

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            data: {
                id: user._id,
                username: user.username,
                email: user.email,
                profileImage: user.profileImage,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            },
        });
    } catch (error) {
        next(error);
    }
};

// @description change password
// @route GET/api/auth/change-password
// @access private

const changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                error: "Please provide current and new password",
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                error: "Password must be at least 6 characters long",
            });
        }

        if (currentPassword === newPassword) {
            return res.status(400).json({
                success: false,
                error: "New password must be different from current password",
            });
        }

        const user = await User.findById(req.user._id).select("+password");

        if (!user) {
            return res.status(404).json({
                success: false,
                error: "User not found",
            });
        }

        const isMatch = await user.matchPassword(currentPassword);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                error: "Current password is incorrect",
            });
        }

        user.password = newPassword;
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Password changed successfully",
        });
    } catch (error) {
        next(error);
    }
};


module.exports = {register,login,getProfile,updateProfile,changePassword}