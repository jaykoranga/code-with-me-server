const { Question } = require("../../../models/question.model");
const Submission = require("../../../models/submission.model");
const Match = require("../../../models/match.model");
const MatchQuestionScore = require("../../../models/matchQuestionScore.model");
const judgeService = require("../../judge/services/judgeService");
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
      const passed = judgeService.evaluate(execution.stdout, tc.output, question.judgeConfig);

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
      const passed = judgeService.evaluate(execution.stdout, tc.output, question.judgeConfig);

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

    // If the submission is accepted and is part of an active match, record the score
    if (finalStatus === submissionStatus.ACCEPTED && matchId) {
      try {
        // Ensure we only record score for the first successful solve
        const existingScore = await MatchQuestionScore.findOne({
          matchId,
          questionId,
          userId
        });

        if (!existingScore) {
          // Fetch match details to calculate solve duration and player counts
          const match = await Match.findById(matchId);
          if (match) {
            const startedAtTime = match.startedAt ? new Date(match.startedAt).getTime() : Date.now();
            const solveDuration = Date.now() - startedAtTime;

            // Calculate question rank: count other users who already solved this question in this match
            const solversCount = await MatchQuestionScore.countDocuments({
              matchId,
              questionId,
              isSolved: true
            });
            const rankOnQuestion = solversCount + 1;

            // Determine base score by question difficulty
            let baseScore = 100;
            if (question.difficulty === "medium") {
              baseScore = 200;
            } else if (question.difficulty === "hard") {
              baseScore = 300;
            }

            // Calculate speed bonus based on maximum players allowed in the match, capped at 50% of baseScore
            const totalPlayers = match.maxPlayers || 2;
            const calculatedBonus = Math.max(0, (totalPlayers - rankOnQuestion) * 15);
            const maxAllowedBonus = Math.floor(baseScore / 2);
            const bonusPoints = Math.min(calculatedBonus, maxAllowedBonus);

            const score = baseScore + bonusPoints;

            // Create scoreboard solve entry
            await MatchQuestionScore.create({
              matchId,
              questionId,
              userId,
              score,
              isSolved: true,
              firstAcceptedSubmissionId: submission._id,
              firstSolvedAt: new Date(),
              solveDuration,
              rankOnQuestion,
              bonusPoints
            });
            console.log(`MatchQuestionScore created: user=${userId}, match=${matchId}, question=${questionId}, rank=${rankOnQuestion}, score=${score}`);
          }
        }
      } catch (scoreError) {
        console.error("Error creating MatchQuestionScore:", scoreError);
        // Fallback: don't block the API response if score calculation fails
      }
    }

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
