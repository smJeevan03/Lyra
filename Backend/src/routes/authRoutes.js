const express = require("express");
const { body } = require("express-validator");

const {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
} = require("../controllers/authController");

const protect = require("../middlewares/auth");
const handleValidationErrors = require("../middlewares/validation");

const router = express.Router();

// Register validation
const registerValidation = [
  body("username")
    .trim()
    .isLength({ min: 3 })
    .withMessage("Username must be at least 3 characters long"),

  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please enter a valid email address"),

  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
];

// Login validation
const loginValidation = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please enter a valid email address"),

  body("password")
    .notEmpty()
    .withMessage("Password cannot be empty"),
];

// Public Routes
router.post("/register", registerValidation, handleValidationErrors, register);
router.post("/login", loginValidation, handleValidationErrors, login);

// Change Password Validation
const changePasswordValidation = [
  body("currentPassword")
    .notEmpty()
    .withMessage("Current password is required"),
  body("newPassword")
    .isLength({ min: 6 })
    .withMessage("New password must be at least 6 characters long"),
];

// Protected Routes
router.get("/profile", protect, getProfile);
router.put("/profile", protect, [
  body("username").optional().trim().isLength({ min: 3 }).withMessage("Username must be at least 3 characters long"),
  body("email").optional().isEmail().normalizeEmail().withMessage("Please enter a valid email address"),
], handleValidationErrors, updateProfile);
router.post("/change-password", protect, changePasswordValidation, handleValidationErrors, changePassword);


module.exports = router;