const express = require("express");
const { verifyToken } = require("../middlewares/authMiddleware");
const { runCode, submitCode } = require("../modules/submission/controllers/submission.controller");

const router = express.Router();

router.post("/run", verifyToken, runCode);
router.post("/submit", verifyToken, submitCode);

module.exports = router;
