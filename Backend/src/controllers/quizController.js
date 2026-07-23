const mongoose = require("mongoose");
const Quiz = require("../models/quiz");

const getQuizzes = async (req, res, next) => {
    try {
        const filter = { userId: req.user._id };

        if (req.params.documentId) {
            if (!mongoose.Types.ObjectId.isValid(req.params.documentId)) {
                return res.status(400).json({ success: false, error: "Invalid document ID" });
            }
            filter.documentId = req.params.documentId;
        }

        const quizzes = await Quiz.find(filter)
            .populate("documentId", "title fileName")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: quizzes.length,
            data: quizzes,
        });
    } catch (error) {
        next(error);
    }
};

const getQuizById = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).json({ success: false, error: "Quiz not found" });
        }

        const quiz = await Quiz.findOne({ _id: id, userId: req.user._id });

        if (!quiz) {
            return res.status(404).json({ success: false, error: "Quiz not found" });
        }

        return res.status(200).json({ success: true, data: quiz });
    } catch (error) {
        next(error);
    }
};

const submitQuiz = async (req, res, next) => {
    try {
        const { answers } = req.body;

        if (!Array.isArray(answers)) {
            return res.status(400).json({ success: false, error: "Please provide answers array" });
        }

        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(404).json({ success: false, error: "Quiz not found" });
        }

        const quiz = await Quiz.findOne({ _id: req.params.id, userId: req.user._id });

        if (!quiz) {
            return res.status(404).json({ success: false, error: "Quiz not found" });
        }

        if (quiz.completed) {
            return res.status(400).json({ success: false, error: "Quiz already completed" });
        }

        if (answers.length > quiz.questions.length) {
            return res.status(400).json({
                success: false,
                error: "Too many answers submitted"
            });
        }

        let correctCount = 0;
        const userAnswers = [];
        const answeredQuestions = new Set();

        for (const answer of answers) {
            const { questionIndex, selectedAnswer } = answer;

            if (!Number.isInteger(questionIndex) || questionIndex < 0 || questionIndex >= quiz.questions.length) {
                return res.status(400).json({ success: false, error: "Invalid question index" });
            }

            if (answeredQuestions.has(questionIndex)) {
                return res.status(400).json({ success: false, error: "Duplicate question index" });
            }

            if (typeof selectedAnswer !== "string" || selectedAnswer.trim() === "") {
                return res.status(400).json({ success: false, error: "Please provide selectedAnswer for each answer" });
            }

            const question = quiz.questions[questionIndex];
            if (!question.options.includes(selectedAnswer)) {
                return res.status(400).json({ success: false, error: "Invalid answer option" });
            }

            answeredQuestions.add(questionIndex);
            const isCorrect =selectedAnswer.trim().toLowerCase() ===question.correctAnswer.trim().toLowerCase();
            if (isCorrect) correctCount++;

            userAnswers.push({ questionIndex, selectedAnswer, isCorrect });
        }

        const totalQuestions = quiz.questions.length;
        const score = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

        quiz.userAnswers = userAnswers;
        quiz.score = score;
        quiz.completed = true;
        quiz.completedAt = new Date();

        await quiz.save();

        return res.status(200).json({
            success: true,
            data: {
                quizId: quiz._id,
                score,
                correctCount,
                totalQuestions,
                percentage: score,
                userAnswers,
            },
            message: "Quiz submitted successfully",
        });
    } catch (error) {
        next(error);
    }
};

const getQuizResults = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).json({ success: false, error: "Quiz not found" });
        }

        const quiz = await Quiz.findOne({ _id: id, userId: req.user._id }).populate("documentId", "title");

        if (!quiz) {
            return res.status(404).json({ success: false, error: "Quiz not found" });
        }

        if (!quiz.completed) {
            return res.status(400).json({ success: false, error: "Quiz not completed yet" });
        }

        const detailedResults = quiz.questions.map((question, index) => {
            const userAnswer = quiz.userAnswers.find((a) => a.questionIndex === index);
            return {
                questionIndex: index,
                question: question.question,
                options: question.options,
                correctAnswer: question.correctAnswer,
                selectedAnswer: userAnswer?.selectedAnswer || null,
                isCorrect: userAnswer?.isCorrect || false,
                explanation: question.explanation,
            };
        });

        return res.status(200).json({
            success: true,
            data: {
                quiz: {
                    id: quiz._id,
                    title: quiz.title,
                    document: quiz.documentId,
                    score: quiz.score,
                    totalQuestions: quiz.totalQuestions || quiz.questions.length,
                    completed: quiz.completed,
                    completedAt: quiz.completedAt,
                },
                results: detailedResults,
            },
        });
    } catch (error) {
        next(error);
    }
};

const deleteQuiz = async (req, res, next) => {
    try {
        const quiz = await Quiz.findOne({ _id: req.params.id, userId: req.user._id });

        if (!quiz) {
            return res.status(404).json({ success: false, error: "Quiz not found" });
        }

        await quiz.deleteOne();
        return res.status(200).json({ success: true, message: "Quiz deleted successfully" });
    } catch (error) {
        next(error);
    }
};

module.exports = { getQuizzes, getQuizById, submitQuiz, getQuizResults, deleteQuiz };
