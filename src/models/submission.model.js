const mongoose=require("mongoose");
const submissionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
  },

  status: {
    type: String,
    enum: Object.values(SUBMISSION_STATUS),
    default: "pending",
  },

  questionId:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Question",
  },

  match:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Match",
  }

  


 
});
