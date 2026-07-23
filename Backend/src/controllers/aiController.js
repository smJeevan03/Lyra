const Document = require("../models/document");
const Flashcard = require("../models/flashCard");
const Quiz = require("../models/quiz");
const ChatHistory = require("../models/chatHistory");
const geminiService = require("../utils/geminiServices");
const { findRelevantChunks } = require("../utils/textChunker");

async function generateFlashcards(req, res, next) {
    try {
        const { documentId, count = 10 } = req.body;
        const requestedCount = Number.parseInt(count, 10);

        // 1. Validate input
        if (!documentId) {
            return res.status(400).json({
                success: false,
                error: 'Please provide documentId',
                statusCode: 400
            });
        }

        // 2. Find the document in the database
        const document = await Document.findOne({
            _id: documentId,
            userId: req.user._id,
            status: 'ready'
        });

        if (!document) {
            return res.status(404).json({
                success: false,
                error: 'Document not found or not ready',
                statusCode: 404
            });
        }

        if (!Number.isInteger(requestedCount) || requestedCount < 1 || requestedCount > 50) {
            return res.status(400).json({
                success: false,
                error: "count must be an integer between 1 and 50",
            });
        }

        // 3. Generate flashcards using Gemini
        const cards = await geminiService.generateFlashcards(
            document.extractedText,
            requestedCount
        );

        if (cards.length !== requestedCount) {
            return res.status(502).json({
                success: false,
                error: "AI generated an incomplete flashcard set. Please try again.",
            });
        }

        // 4. Save the flashcard set to the database
        const flashcardSet = await Flashcard.create({
            userId: req.user._id,
            documentId: document._id,
            cards: cards.map(card => ({
                question: card.question,
                answer: card.answer,
                difficulty: card.difficulty,
                reviewCount: 0,
                isStarred: false
            }))
        });

        // 5. Send a successful response
        res.status(201).json({
            success: true,
            data: flashcardSet,
            message: 'Flashcards generated successfully'
        });
    } catch (err) {
        // Pass any errors to the Express error handling middleware
        next(err);
    }
}

const generateQuiz = async (req, res, next) => {
    try {
        const { documentId, numQuestions = 5, title } = req.body;
        const requestedQuestions = Number.parseInt(numQuestions, 10);

        // 1. Validate request body
        if (!documentId) {
            return res.status(400).json({
                success: false,
                error: 'Please provide documentId',
                statusCode: 400
            });
        }

        // 2. Find the source document
        const document = await Document.findOne({
            _id: documentId,
            userId: req.user._id,
            status: 'ready'
        });

        if (!document) {
            return res.status(404).json({
                success: false,
                error: 'Document not found or not ready',
                statusCode: 404
            });
        }

        if (!Number.isInteger(requestedQuestions) || requestedQuestions < 1 || requestedQuestions > 50) {
            return res.status(400).json({
                success: false,
                error: "numQuestions must be an integer between 1 and 50",
            });
        }

        // 👇 STEP 1: GENERATE THE SUMMARY FIRST 👇
        const summary = await geminiService.generateSummary(document.extractedText);

        if (!summary || summary.length < 20) {
            return res.status(502).json({
                success: false,
                error: "Failed to generate a valid summary from the document.",
            });
        }

        // 👇 STEP 2: PASS THE SUMMARY TO YOUR STRICT PARSING FUNCTION 👇
        const questions = await geminiService.generateQuiz(
            summary, // <--- Passing the summary instead of raw text
            requestedQuestions
        );

        if (questions.length !== requestedQuestions) {
            return res.status(502).json({
                success: false,
                error: "AI generated an incomplete quiz. Please try again.",
            });
        }

        // 3. Save the generated quiz to the database
        const quiz = await Quiz.create({
            userId: req.user._id,
            documentId: document._id,
            title: title || `${document.title} - Quiz`,
            questions: questions,
            totalQuestions: questions.length,
            userAnswers: [],
            score: 0
        });

        // 4. Send successful response
        res.status(201).json({
            success: true,
            data: quiz,
            message: 'Quiz generated successfully'
        });

    } catch (err) {
        next(err);
    }
}

const generateSummary = async (req, res, next) => {
    try {
        const { documentId } = req.body;

        // 1. Validate request body
        if (!documentId) {
            return res.status(400).json({
                success: false,
                error: 'Please provide documentId',
                statusCode: 400
            });
        }

        // 2. Find the source document
        const document = await Document.findOne({
            _id: documentId,
            userId: req.user._id,
            status: 'ready'
        });

        if (!document) {
            return res.status(404).json({
                success: false,
                error: 'Document not found or not ready',
                statusCode: 404
            });
        }

        // 3. Generate summary using Gemini service
        const summary = await geminiService.generateSummary(document.extractedText);

        // 4. Send successful response
        res.status(200).json({
            success: true,
            data: {
                documentId: document._id,
                title: document.title,
                summary
            },
            message: 'Summary generated successfully'
        });

    } catch (err) {
        next(err);
    }
}

const chat = async (req, res, next) => {
    try {
        const { documentId, question } = req.body;

        // 1. Validate request body
        if (!documentId || !question) {
            return res.status(400).json({
                success: false,
                error: 'Please provide documentId and question',
                statusCode: 400
            });
        }

        // 2. Find the source document
        const document = await Document.findOne({
            _id: documentId,
            userId: req.user._id,
            status: 'ready'
        });

        if (!document) {
            return res.status(404).json({
                success: false,
                error: 'Document not found or not ready',
                statusCode: 404
            });
        }

        // 3. Find relevant chunks
        let relevantChunks = findRelevantChunks(document.chunks, question, 3);

        // Fallback if the chunk finder returns 0 results
        if (relevantChunks.length === 0) {
            relevantChunks = document.chunks.slice(0, 3);
        }

        const chunkIndices = relevantChunks.map(c => c.chunkIndex);

        // 4. Generate response using Gemini service
        const answer = await geminiService.chatWithContext(question, relevantChunks);

        // 5. Atomically create/update chat history to avoid concurrent-request races
        const chatHistory = await ChatHistory.findOneAndUpdate(
            { userId: req.user._id, documentId: document._id },
            {
                $setOnInsert: { userId: req.user._id, documentId: document._id },
                $push: {
                    messages: {
                        $each: [
                            { role: 'user', content: question, timestamp: new Date(), relevantChunks: [] },
                            { role: 'assistant', content: answer, timestamp: new Date(), relevantChunks: chunkIndices },
                        ],
                    },
                },
            },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        // 7. Send successful response
        res.status(200).json({
            success: true,
            data: {
                question,
                answer,
                relevantChunks: chunkIndices,
                chatHistoryId: chatHistory._id
            },
            message: 'Response generated successfully'
        });

    } catch (err) {
        next(err);
    }
}

const explainConcept = async (req, res, next) => {
    try {
        const { documentId, concept } = req.body;

        // 1. Validate request body
        if (!documentId || !concept) {
            return res.status(400).json({
                success: false,
                error: 'Please provide documentId and concept',
                statusCode: 400
            });
        }

        // 2. Find the source document
        const document = await Document.findOne({
            _id: documentId,
            userId: req.user._id,
            status: 'ready'
        });

        if (!document) {
            return res.status(404).json({
                success: false,
                error: 'Document not found or not ready',
                statusCode: 404
            });
        }

        // 3. Find relevant chunks for the concept
        const relevantChunks = findRelevantChunks(document.chunks, concept, 3);
        const context = relevantChunks.map(c => c.content).join('\n\n');

        // 4. Generate explanation using Gemini
        const explanation = await geminiService.explainConcept(concept, context);

        // 5. Send successful response
        res.status(200).json({
            success: true,
            data: {
                concept,
                explanation,
                relevantChunks: relevantChunks.map(c => c.chunkIndex)
            },
            message: 'Explanation generated successfully'
        });

    } catch (err) {
        next(err);
    }
}

const getChatHistory = async (req, res, next) => {
    try {
        const { documentId } = req.params;

        // 1. Validate request params
        if (!documentId) {
            return res.status(400).json({
                success: false,
                error: 'Please provide documentId',
                statusCode: 400
            });
        }

        // 2. Find the chat history (only retrieving the messages array)
        const chatHistory = await ChatHistory.findOne({
            userId: req.user._id,
            documentId: documentId
        }).select('messages');

        // 3. Return empty array if no chat history exists for this document
        if (!chatHistory) {
            return res.status(200).json({
                success: true,
                data: [], // Return an empty array if no chat history found
                message: 'No chat history found for this document'
            });
        }

        // 4. Send successful response with the chat messages
        res.status(200).json({
            success: true,
            data: chatHistory.messages,
            message: 'Chat history retrieved successfully'
        });

    } catch (err) {
        next(err);
    }
}

module.exports = {
    generateFlashcards,
    generateQuiz,
    generateSummary,
    chat,
    explainConcept,
    getChatHistory,
};