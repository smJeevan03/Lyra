const express = require("express");

const {
  generateFlashcards,
  generateQuiz,
  generateSummary,
  chat,
  explainConcept,
  getChatHistory,
} = require("../controllers/aiController");

const protect = require("../middlewares/auth");

const router = express.Router();

// Protect all routes
router.use(protect);

// Generate flashcards
router.post("/generate-flashcards", generateFlashcards);

// Generate quiz
router.post("/generate-quiz", generateQuiz);

// Generate summary
router.post("/generate-summary", generateSummary);

// Chat with AI
router.post("/chat", chat);

// Explain a concept
router.post("/explain-concept", explainConcept);

// Get chat history for a document
router.get("/chat-history/:documentId", getChatHistory);

module.exports = router;