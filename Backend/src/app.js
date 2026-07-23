const express = require("express");
const cors = require("cors");
const path = require("path");
const errorHandler = require("./middlewares/errorHandler");
const authRoutes = require("./routes/authRoutes");
const documentRoutes = require("./routes/documentRoutes");
const flashCardRoutes = require("./routes/flashCardRoutes");
const aiRoutes = require("./routes/aiRoutes");
const quizRoutes = require("./routes/quizRoutes");
const progressRoutes = require("./routes/progressRoutes");

const app = express();
const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, // Allows cookies and Authorization headers to be sent
  })
);

// Instead of app.options('*', cors()), use this:
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204); // No Content response for preflight
  }
  next();
});

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/flashcards", flashCardRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/progress", progressRoutes);

app.use((req, res) => {
    res.status(404).json({ success: false, error: "Route not found" });
});

app.use(errorHandler);

module.exports = app;
