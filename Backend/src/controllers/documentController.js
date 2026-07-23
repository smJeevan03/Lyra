const Document  = require("../models/document")
const Flashcard = require("../models/flashCard")
const Quiz = require("../models/quiz")
const ChatHistory = require("../models/chatHistory")
const {extractTextFromPDF} = require("../utils/pdfParser")
const {chunkText} = require("../utils/textChunker")
const fs = require("fs/promises")
const mongoose = require("mongoose")


const uploadDocument = async (req, res, next) => {
    try {
        // Check if file exists
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: "Please upload a PDF file",
                statusCode: 400,
            });
        }

        const { title } = req.body;

        // Title is required
        if (!title) {
            await fs.unlink(req.file.path);

            return res.status(400).json({
                success: false,
                error: "Please provide a document title",
                statusCode: 400,
            });
        }

        const baseUrl = process.env.SERVER_URL || `http://localhost:${process.env.PORT || 3000}`;
        const fileUrl = `${baseUrl}/uploads/documents/${req.file.filename}`;

        // Save document
        const document = await Document.create({
            userId: req.user._id,
            title,
            fileName: req.file.originalname,
            filePath: req.file.path,
            fileUrl,
            fileSize: req.file.size,
            status: "processing",
        });

        processPDF(document._id, req.file.path).catch(err => {
            console.error("PDF processing error:", err);
        });
        return res.status(201).json({
            success: true,
            message: "Document uploaded successfully",
            data: document,
        });

    } catch (error) {
        // Delete uploaded file if something goes wrong
        if (req.file) {
            await fs.unlink(req.file.path).catch(() => {});
        }
        next(error);
    }
};

// Helper function to process PDF
const processPDF = async (documentId, filePath) => {
  try {
    const { text } = await extractTextFromPDF(filePath);

    // Create chunks
    const chunks = chunkText(text, 500, 50);

    // Update document
    await Document.findByIdAndUpdate(documentId, {
      extractedText: text,
      chunks: chunks,
      status: "ready",
    });

    console.log(`Document ${documentId} processed successfully`);
  } catch (error) {
    console.error(`Error processing document ${documentId}:`, error);

    await Document.findByIdAndUpdate(documentId, {
      status: "failed",
    });
  }
};


const getDocuments = async (req, res, next) => {
    try {
        const documents = await Document.aggregate([
            {
                $match: {userId: new mongoose.Types.ObjectId(req.user._id)}
            },
            {
                $lookup: {
                    from: "flashcards",
                    localField: "_id",
                    foreignField: "documentId",
                    as: "flashcardSets",
                },
            },
            {
                $lookup: {
                    from: "quizzes",
                    localField: "_id",
                    foreignField: "documentId",
                    as: "quizzes",
                },
            },
            {
                $addFields: {
                    flashcardCount: { $size: "$flashcardSets" },
                    quizCount: { $size: "$quizzes" },
                },
            },
            {
                $project: {
                    flashcardSets: 0,
                    quizzes: 0,
                    extractedText: 0,
                    chunks: 0,
                },
            },
            {
                $sort: {createdAt: -1}
            },
        ]);

        return res.status(200).json({
            success: true,
            count: documents.length,
            data: documents,
        });
    } catch (error) {
        next(error);
    }
};


const getDocument = async (req, res, next) => {
    try {
        const document = await Document.findOne({
            _id: req.params.id,
            userId: req.user._id,
        });

        if (!document) {
            return res.status(404).json({
                success: false,
                error: "Document not found",
                statusCode: 404,
            });
        }

        // Get counts of associated flashcards and quizzes
        const flashcardCount = await Flashcard.countDocuments({
            documentId: document._id,
            userId: req.user._id,
        });

        const quizCount = await Quiz.countDocuments({
            documentId: document._id,
            userId: req.user._id,
        });

        // Update last accessed
        document.lastAccessed = new Date();
        await document.save();

        const documentData = document.toObject();

        documentData.flashcardCount = flashcardCount;
        documentData.quizCount = quizCount;

        return res.status(200).json({
            success: true,
            data: documentData,
        });
    } catch (error) {
        next(error);
    }
};


const deleteDocument = async (req, res, next) => {
    try {
        const document = await Document.findOne({
            _id: req.params.id,
            userId: req.user._id,
        });

        if (!document) {
            return res.status(404).json({
                success: false,
                error: "Document not found",
                statusCode: 404,
            });
        }

        await fs.unlink(document.filePath).catch(() => {});

        await Promise.all([
            Flashcard.deleteMany({ documentId: document._id, userId: req.user._id }),
            Quiz.deleteMany({ documentId: document._id, userId: req.user._id }),
            ChatHistory.deleteMany({ documentId: document._id, userId: req.user._id }),
        ]);

        await document.deleteOne();

        return res.status(200).json({
            success: true,
            message: "Document deleted successfully",
        });
    } catch (error) {
        next(error);
    }
};


module.exports = {uploadDocument,getDocuments,getDocument,deleteDocument}