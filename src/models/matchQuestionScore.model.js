const mongoose = require("mongoose");

const matchQuestionScoreSchema = new mongoose.Schema({
  matchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Match",
    required: true
  },

  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Question",
    required: true
  },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  score: {
    type: Number,
    default: 0
  },

  isSolved: {
    type: Boolean,
    default: false
  },

  firstAcceptedSubmissionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Submission"
  },

  firstSolvedAt: {
    type: Date
  },

  solveDuration: {
    type: Number // ms since match start
  },

  rankOnQuestion: {
    type: Number // 1st solver, 2nd solver, etc.
  },

  bonusPoints: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Guarantee a single scoring record per user per question in each match
matchQuestionScoreSchema.index({ matchId: 1, questionId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model("MatchQuestionScore", matchQuestionScoreSchema);
