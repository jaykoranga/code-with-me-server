const { Question } = require("../../../models/question.model");
const Submission = require("../../../models/submission.model");
const pistonService = require("../services/pistonService");
const { STATUS_CODES } = require("../../../constants/statusCodes");
const { submissionStatus } = require("../../../constants/enums");

/**
 * Runs user code against public test cases only.
 */
const runCode = async (req, res) => {
  try {
    const { questionId, language, code } = req.body;

    if (!questionId) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({ message: "Question ID is required" });
    }
    if (!language) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({ message: "Language is required" });
    }
    if (!code) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({ message: "Source code is required" });
    }

    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(STATUS_CODES.NOT_FOUND).json({ message: "Question not found" });
    }

    const boilerplate = question.boilerPlate.find(
      (b) => b.language.toLowerCase().trim() === language.toLowerCase().trim()
    );
    if (!boilerplate) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({ message: `Language '${language}' is not supported for this question` });
    }

    const fullCode = boilerplate.runnerCode.replace("// {{USER_CODE}}", code);
    console.log('fullCode', fullCode)
    const publicTestCases = question.testCases.filter(tc => tc.visibility === "public");

    const results = [];
    let allPassed = true;

    for (let i = 0; i < publicTestCases.length; i++) {
      const tc = publicTestCases[i];
      const execution = await pistonService.executeCode(language, fullCode, tc.input);

      if (execution.error) {
        allPassed = false;
        results.push({
          input: tc.input,
          expected: tc.output,
          actual: "",
          passed: false,
          stdout: execution.stdout,
          stderr: execution.stderr,
          error: execution.error.message,
        });
        continue;
      }

      const actualOutput = execution.stdout.trim();
      const expectedOutput = tc.output.trim();
      const passed = actualOutput === expectedOutput;

      if (!passed) {
        allPassed = false;
      }

      results.push({
        input: tc.input,
        expected: expectedOutput,
        actual: actualOutput,
        passed,
        stdout: execution.stdout,
        stderr: execution.stderr,
        code: execution.code,
      });
    }

    return res.status(STATUS_CODES.OK).json({
      passed: allPassed,
      results
    });
  } catch (error) {
    console.error("Error running code:", error);
    return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ message: "Internal server error" });
  }
};

/**
 * Evaluates code against all test cases and writes to the DB.
 */
const submitCode = async (req, res) => {
  try {
    const { questionId, language, code, matchId } = req.body;
    const userId = req.user.userId;

    if (!questionId) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({ message: "Question ID is required" });
    }
    if (!language) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({ message: "Language is required" });
    }
    if (!code) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({ message: "Source code is required" });
    }

    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(STATUS_CODES.NOT_FOUND).json({ message: "Question not found" });
    }

    const boilerplate = question.boilerPlate.find(
      (b) => b.language.toLowerCase().trim() === language.toLowerCase().trim()
    );
    if (!boilerplate) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({ message: `Language '${language}' is not supported for this question` });
    }

    const fullCode = boilerplate.runnerCode.replace("// {{USER_CODE}}", code);
    const testCases = question.testCases;

    const results = [];
    let passedCount = 0;
    let finalStatus = submissionStatus.ACCEPTED;
    let runTimeErrorDetails = "";

    for (let i = 0; i < testCases.length; i++) {
      const tc = testCases[i];
      const execution = await pistonService.executeCode(language, fullCode, tc.input);

      if (execution.error) {
        finalStatus = submissionStatus.SYSTEMERROR;
        runTimeErrorDetails = execution.error.message;
        break;
      }

      if (execution.code !== 0 || execution.stderr) {
        finalStatus = execution.stderr.toLowerCase().includes("compile") 
          ? submissionStatus.COMPILEERROR 
          : submissionStatus.RUNTIMEERROR;
        runTimeErrorDetails = execution.stderr;
        break;
      }

      const actualOutput = execution.stdout.trim();
      const expectedOutput = tc.output.trim();
      const passed = actualOutput === expectedOutput;

      if (passed) {
        passedCount++;
      } else {
        if (finalStatus === submissionStatus.ACCEPTED) {
          finalStatus = submissionStatus.WRONGANSWER;
        }
      }

      results.push({
        visibility: tc.visibility,
        passed,
        input: tc.visibility === "public" ? tc.input : "[hidden]",
        expected: tc.visibility === "public" ? expectedOutput : "[hidden]",
        actual: tc.visibility === "public" ? actualOutput : "[hidden]"
      });
    }

    // Save the submission record to the database
    const submission = await Submission.create({
      user: userId,
      questionId,
      match: matchId || null,
      status: finalStatus,
      code,
      language,
      passedCount,
      totalCount: testCases.length,
      error: runTimeErrorDetails,
    });

    return res.status(STATUS_CODES.CREATED).json({
      message: "Submission evaluated successfully",
      submission,
      results
    });
  } catch (error) {
    console.error("Error submitting code:", error);
    return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ message: "Internal server error" });
  }
};

module.exports = {
  runCode,
  submitCode,
};
