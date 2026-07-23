const express = require("express");

const {
  getFlashcards,
  getAllFlashcardSets,
  reviewFlashcard,
  toggleStarFlashcard,
  deleteFlashcardSet,
} = require("../controllers/flashcardController");

const protect = require("../middlewares/auth");

const router = express.Router();

// Protect all routes
router.use(protect);

// Get all flashcard sets
router.get("/", getAllFlashcardSets);

// Get flashcards for a document
router.get("/:documentId", getFlashcards);

// Review a flashcard
router.post("/:cardId/review", reviewFlashcard);

// Star/Unstar a flashcard
router.put("/:cardId/star", toggleStarFlashcard);

// Delete a flashcard set
router.delete("/:id", deleteFlashcardSet);

module.exports = router;