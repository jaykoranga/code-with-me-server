
const express = require("express");
const { USER_ROUTES } = require("../constants/routes");
const { signupUser, loginUser, getProfile } = require("../controllers/userController");
const { verifyToken } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post(USER_ROUTES.SIGNUP, signupUser);
router.post(USER_ROUTES.LOGIN, loginUser);
router.get(USER_ROUTES.PROFILE, verifyToken, getProfile);

module.exports = router;
