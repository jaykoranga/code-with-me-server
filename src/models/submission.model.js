const mongoose = require("mongoose");
const { submissionStatus } = require("../constants/enums");

const submissionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
      required: true,
    },
    match: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Match",
      default: null,
    },
    status: {
      type: String,
      enum: Object.values(submissionStatus),
      default: submissionStatus.PENDING,
    },
    code: {
      type: String,
      required: true,
    },
    language: {
      type: String,
      required: true,
    },
    executionTime: {
      type: Number,
      default: 0,
    },
    memory: {
      type: Number,
      default: 0,
    },
    error: {
      type: String,
      default: "",
    },
    passedCount: {
      type: Number,
      default: 0,
    },
    totalCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Submission", submissionSchema);
