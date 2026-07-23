const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: [true, "Please provide a document title"],
    },

    fileName: {
      type: String,
      required: true,
    },

    filePath: {
      type: String,
      required: true,
    },

    fileUrl: {
      type: String,
      required: true,
    },

    fileSize: {
      type: Number,
      required: true,
    },

    extractedText: {
      type: String,
      default: "",
    },

    chunks: [
      {
        content: {
          type: String,
          required: true,
        },
        pageNumber: {
          type: Number,
          default: 0,
        },
        chunkIndex: {
          type: Number,
          required: true,
        },
      },
    ],

    uploadDate: {
      type: Date,
      default: Date.now,
    },

    lastAccessed: {
      type: Date,
      default: Date.now,
    },

    status: {
      type: String,
      enum: ["processing", "ready", "failed"],
      default: "processing",
    },
  },
  {
    timestamps: true,
  }
);

documentSchema.index({ userId: 1 });

module.exports = mongoose.model("Document", documentSchema);