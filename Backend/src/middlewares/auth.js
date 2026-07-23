const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const protect = async (req, res, next) => {
  try {
    let token;

    // Check for Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    // No token found
    if (!token) {
      return res.status(401).json({
        success: false,
        error: "Not authorized, no token",
      });
    }

    // Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "User not found",
      });
    }

    // Attach user to request
    req.user = user;

    next();
  } catch (err) {
    console.error("Auth Middleware Error:", err.message);

    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        error: "Token has expired",
      });
    }

    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        error: "Invalid token",
      });
    }

    return res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
};

module.exports = protect;