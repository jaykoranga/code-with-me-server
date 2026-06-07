require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const mongoose = require("mongoose");
const { Question } = require("../src/models/question.model");

const questions = require("../generated_questions.json");

const seedQuestions = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error("MONGO_URI is not defined in environmental variables");
    }

    console.log("Connecting to database for seeding...");
    await mongoose.connect(mongoUri);
    console.log("Database connected successfully.");

    console.log("Clearing existing questions...");
    await Question.deleteMany({});
    console.log("Existing questions cleared.");

    console.log("Seeding questions...");
    const result = await Question.insertMany(questions);
    console.log(`Successfully seeded ${result.length} questions!`);
  } catch (error) {
    console.error("Error during seeding process:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Database disconnected.");
    process.exit(0);
  }
};

seedQuestions();
