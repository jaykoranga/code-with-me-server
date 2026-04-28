
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User.model");

const SALT_ROUNDS = 10;

const RESPONSE_MESSAGES = {
  SIGNUP_SUCCESS: "User created successfully",
  LOGIN_SUCCESS: "Login successful",
  PROFILE_SUCCESS: "Profile fetched successfully",
  REQUIRED_FIELDS: "email, password are required",
  EMAIL_PASS_REQUIRED: "email and password are required",
  USER_EXISTS: "User already exists",
  INVALID_CREDENTIALS: "Invalid credentials",
  USER_NOT_FOUND: "User not found",
  TOKEN_INVALID: "Invalid or expired token",
  JWT_SECRET_MISSING: "JWT_SECRET is not configured",
  INTERNAL_ERROR: "Internal server error",
};

const toSafeUser = (userDoc) => ({
  id: userDoc._id,
  email: userDoc.email,
  username: userDoc.username??"",
  about: userDoc.about,
  profilePicture: userDoc.profilePicture,
  totalMatchesPlayed: userDoc.totalMatchesPlayed,
  wins: userDoc.wins,
  losses: userDoc.losses,
});

const createAuthToken = (userDoc) =>
  jwt.sign(
    {
      userId: String(userDoc._id),
      email: userDoc.email,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    }
  );

const signupUser = async (req, res) => {
  try {
    const { email, password, username, about, profilePicture } = req.body;

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ message: RESPONSE_MESSAGES.JWT_SECRET_MISSING });
    }

    if (!email || !password) {
      return res.status(400).json({ message: RESPONSE_MESSAGES.REQUIRED_FIELDS });
    }

    const existingUser = await User.findOne({ email: String(email).toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ message: RESPONSE_MESSAGES.USER_EXISTS });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const newUser = await User.create({
      email,
      password: hashedPassword,
     
    });

    const token = createAuthToken(newUser);

    return res.status(201).json({
      message: RESPONSE_MESSAGES.SIGNUP_SUCCESS,
      user: toSafeUser(newUser),
      token,
    });
  } catch (error) {
    return res.status(500).json({ message: RESPONSE_MESSAGES.INTERNAL_ERROR });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ message: RESPONSE_MESSAGES.JWT_SECRET_MISSING });
    }

    if (!email || !password) {
      return res.status(400).json({ message: RESPONSE_MESSAGES.EMAIL_PASS_REQUIRED });
    }

    const user = await User.findOne({ email: String(email).toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: RESPONSE_MESSAGES.INVALID_CREDENTIALS });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: RESPONSE_MESSAGES.INVALID_CREDENTIALS });
    }

    const token = createAuthToken(user);

    return res.status(200).json({
      message: RESPONSE_MESSAGES.LOGIN_SUCCESS,
      user: toSafeUser(user),
      token,
    });
  } catch (error) {
    return res.status(500).json({ message: RESPONSE_MESSAGES.INTERNAL_ERROR });
  }
};

const getProfile = async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: RESPONSE_MESSAGES.TOKEN_INVALID });
    }

    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ message: RESPONSE_MESSAGES.USER_NOT_FOUND });
    }

    return res.status(200).json({
      message: RESPONSE_MESSAGES.PROFILE_SUCCESS,
      user: toSafeUser(user),
    });
  } catch (error) {
    return res.status(500).json({ message: RESPONSE_MESSAGES.INTERNAL_ERROR });
  }
};

module.exports = {
  signupUser,
  loginUser,
  getProfile,
};
