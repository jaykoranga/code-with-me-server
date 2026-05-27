const express = require("express");
const { MATCH_ROUTES } = require("../constants/routes");
const { verifyToken } = require("../middlewares/authMiddleware");
const {
  initiateMatchmaking,
  getMatchDetails,
  forfeitMatch
} = require("../modules/match/controllers/match.controller");

const router = express.Router();

router.post(MATCH_ROUTES.INITIATE, verifyToken, initiateMatchmaking);
router.get(MATCH_ROUTES.GET, verifyToken, getMatchDetails);
router.post(MATCH_ROUTES.FORFEIT, verifyToken, forfeitMatch);

module.exports = router;
