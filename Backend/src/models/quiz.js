const mongoose = require("mongoose");

const quizSchema = new mongoose.Schema({
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    questions: [
      {
        question: {
          type: String,
          required: true,
          trim: true,
        },

        options: {
          type: [String],
          required: true,
          validate: {
            validator: (arr) => arr.length === 4,
            message: "A question must have exactly 4 options.",
          },
        },

        correctAnswer: {
          type: String,
          required: true,
        },

        explanation: {
          type: String,
          default: "",
        },

        difficulty: {
          type: String,
          enum: ["easy", "medium", "hard"],
          default: "easy",
        },
      },
    ],

    userAnswers: [
      {
        questionIndex: {
          type: Number,
          required: true,
        },

        selectedAnswer: {
          type: String,
          required: true,
        },

        isCorrect: {
          type: Boolean,
          required: true,
        },
      },
    ],

    score: {
      type: Number,
      default: 0,
    },

    totalQuestions: {
      type: Number,
      default: 0,
    },

    completed: {
      type: Boolean,
      default: false,
    },

    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

//index for faster queries
quizSchema.index({ userId: 1, documentId: 1 });
quizSchema.index({ userId: 1, createdAt: -1 });

const Quiz = mongoose.model("Quiz", quizSchema);

module.exports = Quiz;