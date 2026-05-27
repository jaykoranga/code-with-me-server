const mongoose = require("mongoose");
const { QUESTION_DIFFICULTY, LANGUAGES } = require("../constants/enums");

const questionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    difficulty: {
      type: String,
      enum: Object.values(QUESTION_DIFFICULTY),
      default: QUESTION_DIFFICULTY.EASY,
    },

    testCases: [
      {
        input: {
          type: String,
          required: true,
        },

        output: {
          type: String,
          required: true,
        },

        visibility: {
          type: String,
          enum: ["public", "hidden"],
          default: "hidden",
        },
      },
    ],

    boilerPlate: [
      {
        language: {
          type: String,
          enum: Object.values(LANGUAGES),
        },

        code: {
          type: String,
        },

        description:{
          type: String,
          trim: true,
          
        }
      },
    ],

    category: [String],

    constraints: [String],
    examples: [
      {
        input: {
          type: String,
          required: true,
        },
        output: {
          type: String,
          required: true,
        },
      },
    ],
  },
  { timestamps: true },
);
const Question = mongoose.model("Question", questionSchema);
module.exports = { Question,questionSchema };
