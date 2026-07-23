const express = require("express");

const {
  uploadDocument,
  getDocuments,
  getDocument,
  deleteDocument,
} = require("../controllers/documentController");

const protect = require("../middlewares/auth");
const upload = require("../config/multer");

const router = express.Router();

// Protect all routes
router.use(protect);

// Upload document
router.post("/upload", upload.single("file"), uploadDocument);

// Get all documents
router.get("/", getDocuments);

// Get a single document by ID
router.get("/:id", getDocument);

// Delete a document
router.delete("/:id", deleteDocument);

module.exports = router;