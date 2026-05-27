require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const { Question } = require("../src/models/question.model");

const printUsage = () => {
  console.log(`
Usage:
  node addQuestion.js <path-to-json-file>

Expected JSON format:
{
  "name": "Question Title",
  "description": "Full markdown-supported problem description",
  "difficulty": "easy | medium | hard",
  "category": ["Tag1", "Tag2"],
  "constraints": [
    "Constraint 1",
    "Constraint 2"
  ],
  "examples": [
    { "input": "Input representation", "output": "Output representation" }
  ],
  "testCases": [
    { "input": "actual_input_string", "output": "expected_output_string", "visibility": "public | hidden" }
  ],
  "boilerPlate": [
    {
      "language": "javascript",
      "code": "function myFunc() {\\n\\n}",
      "description": "Javascript boilerplate"
    }
  ]
}
  `);
};

const addQuestion = async () => {
  const filePathArg = process.argv[2];

  if (!filePathArg) {
    console.error("Error: Please provide the path to a JSON question file.");
    printUsage();
    process.exit(1);
  }

  const absolutePath = path.resolve(filePathArg);
  if (!fs.existsSync(absolutePath)) {
    console.error(`Error: File not found at path: ${absolutePath}`);
    process.exit(1);
  }

  let questionData;
  try {
    const rawData = fs.readFileSync(absolutePath, "utf8");
    questionData = JSON.parse(rawData);
  } catch (error) {
    console.error("Error: Failed to parse JSON file.", error.message);
    process.exit(1);
  }

  // Basic validation
  const requiredFields = ["name", "description", "difficulty", "testCases", "boilerPlate"];
  const missing = requiredFields.filter(field => !questionData[field]);
  if (missing.length > 0) {
    console.error(`Error: Missing required fields in JSON: ${missing.join(", ")}`);
    process.exit(1);
  }

  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error("MONGO_URI is not defined in environmental variables");
    }

    console.log("Connecting to database...");
    await mongoose.connect(mongoUri);
    console.log("Database connected successfully.");

    console.log(`Adding question "${questionData.name}" to database...`);
    const newQuestion = await Question.create(questionData);
    console.log("Question added successfully!");
    console.log("Database record ID:", newQuestion._id);
  } catch (error) {
    console.error("Error: Failed to add question to database:", error.message);
  } finally {
    await mongoose.disconnect();
    console.log("Database disconnected.");
    process.exit(0);
  }
};

addQuestion();
