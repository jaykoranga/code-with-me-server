const mongoose = require("mongoose");
const { questionSchema } = require("./question.model");
const { MATCH_TYPE, MATCH_STATUS } = require("../constants/enums");

const matchSchema = new mongoose.Schema({

  status: {
    type: String,
    enum: Object.values(MATCH_STATUS),
    default: "pending",
  },

  Room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Room",
  },

  players: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],

  maxPlayers: {
    type: Number,
    default: 2,
  },

  questionsSnapshots: [questionSchema],

  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 20 * 60 * 1000), // 20 minutes from now
  },

  startedAt: {
    type: Date,
    default: null,
  },

  resultType: {
    type: String,
    enum: ["player_win", "draw"],
    default: null,
  },

  winner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },

  type: {
    type: String,
    enum: Object.values(MATCH_TYPE),
    default: MATCH_TYPE.PROBLEM_SOLVING
  }


});

module.exports = mongoose.model("Match", matchSchema);

