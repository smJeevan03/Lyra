const express = require("express");
const {
    getQuizzes,
    getQuizById,
    submitQuiz,
    getQuizResults,
    deleteQuiz,
} = require("../controllers/quizController");
const protect = require("../middlewares/auth");

const router = express.Router();
router.use(protect);

router.get("/", getQuizzes);
router.get("/document/:documentId", getQuizzes);
router.get("/:id", getQuizById);
router.post("/:id/submit", submitQuiz);
router.get("/:id/results", getQuizResults);
router.delete("/:id", deleteQuiz);

module.exports = router;
