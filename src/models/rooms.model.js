const mongoose = require("mongoose");
const {ROOM_STATUS,ROOM_DIFFICULTY}=require('../constants/enums')
const roomSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    inviteCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    numberOfUsers: {
      type: Number,
      default: 0,
      min: 0,
    },
    numberOfQuestions: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: Object.values(ROOM_STATUS),
      default: "waiting",
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    maxParticipants: {
      type: Number,
      default: 2,
      min: 1,
    },
    difficulty: {
      type: String,
      enum: Object.values(ROOM_DIFFICULTY),
      default: "easy",
      trim: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    matchID: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Room", roomSchema);
