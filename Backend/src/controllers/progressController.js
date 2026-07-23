const Document = require('../models/document');
const Flashcard = require('../models/flashCard');
const Quiz = require('../models/quiz');


exports.getDashboard = async (req, res, next) => {
    try {
        const userId = req.user._id;

        const [
            totalDocuments,
            totalFlashcardSets,
            totalQuizzes,
            completedQuizzes,
            flashcardSets,
            completedQuizList,
            recentDocuments,
            recentQuizzes,
        ] = await Promise.all([
            Document.countDocuments({ userId }),
            Flashcard.countDocuments({ userId }),
            Quiz.countDocuments({ userId }),
            Quiz.countDocuments({ userId, completed: true }),
            Flashcard.find({ userId }).select('cards.reviewCount cards.isStarred'),
            Quiz.find({ userId, completed: true }).select('score'),
            Document.find({ userId })
                .sort({ lastAccessed: -1 })
                .limit(5)
                .select('title fileName lastAccessed status'),
            Quiz.find({ userId })
                .sort({ createdAt: -1 })
                .limit(5)
                .populate('documentId', 'title')
                .select('title score totalQuestions completed createdAt updatedAt'),
        ]);

        let totalFlashcards = 0;
        let reviewedFlashcards = 0;
        let starredFlashcards = 0;

        flashcardSets.forEach((set) => {
            totalFlashcards += set.cards.length;
            reviewedFlashcards += set.cards.filter((card) => card.reviewCount > 0).length;
            starredFlashcards += set.cards.filter((card) => card.isStarred).length;
        });

        const averageScore = completedQuizList.length > 0 
            ? Math.round(completedQuizList.reduce((sum, quiz) => sum + quiz.score, 0) / completedQuizList.length) 
            : 0;

        const studyStreak = 0;

        return res.status(200).json({
            success: true,
            data: {
                overview: {
                    totalDocuments,
                    totalFlashcardSets,
                    totalFlashcards,
                    reviewedFlashcards,
                    starredFlashcards,
                    totalQuizzes,
                    completedQuizzes,
                    averageScore,
                    studyStreak
                },
                recentActivity: {
                    documents: recentDocuments,
                    quizzes: recentQuizzes
                }
            }
        });

    } catch (error) {
        next(error);
    }
};
