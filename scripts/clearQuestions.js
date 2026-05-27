require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const mongoose = require("mongoose");
const { Question } = require("../src/models/question.model");

const clearQuestions = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error("MONGO_URI is not defined in environmental variables");
    }

    console.log("Connecting to database for clearing...");
    await mongoose.connect(mongoUri);
    console.log("Database connected successfully.");

    console.log("Deleting all questions...");
    const result = await Question.deleteMany({});
    console.log(`Successfully deleted ${result.deletedCount} questions.`);
  } catch (error) {
    console.error("Error during clearing process:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Database disconnected.");
    process.exit(0);
  }
};

clearQuestions();
