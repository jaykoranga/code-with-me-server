
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User.model");
const { generateUniqueUserName } = require("../utils/generateUniqueName");

const SALT_ROUNDS = 10;

const parseBooleanEnv = (value, defaultValue) => {
  if (value === undefined) return defaultValue;
  return String(value).toLowerCase() === "true";
};

const COOKIE_NAME = process.env.COOKIE_NAME || "accessToken";
const COOKIE_OPTIONS = {
  httpOnly: parseBooleanEnv(process.env.COOKIE_HTTP_ONLY, true),
  secure: parseBooleanEnv(process.env.COOKIE_SECURE, true),
  sameSite: process.env.COOKIE_SAME_SITE || "strict",
  maxAge: Number(process.env.COOKIE_MAX_AGE_MS) || 24 * 60 * 60 * 1000,
  path: process.env.COOKIE_PATH || "/",
};

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
  USER_CREATION_FAILED:'User creation was failed at db '
};

const toSafeUser = (userDoc) => ({
  id: userDoc._id,
  email: userDoc.email,
  userName: userDoc.userName??"",
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
    console.log("entered try catch ")
    const { email, password } = req.body;
    console.log("email fetched ")
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
    console.log("user does not exist in db ")

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    console.log("password hasshed")

    const newUser = await User.create({
      email:email,
      password: hashedPassword,
      userName:generateUniqueUserName()
     
     
    });
    console.log("new user created")
    if(!newUser){
      return res.status(409).json({ message: RESPONSE_MESSAGES.USER_CREATION_FAILED });
    }

    const token = createAuthToken(newUser);
    console.log("token created ")
    
    //cookie set up 
    res.cookie(COOKIE_NAME, token, COOKIE_OPTIONS)
    console.log("token attahced to cookie ")

    return res.status(201).json({
      message: RESPONSE_MESSAGES.SIGNUP_SUCCESS,
      user: toSafeUser(newUser),
    });
  } catch (error) {
    console.log("error while signing is ",error)
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
    res.cookie(COOKIE_NAME, token, COOKIE_OPTIONS)
    return res.status(200).json({
      message: RESPONSE_MESSAGES.LOGIN_SUCCESS,
      user: toSafeUser(user),
      
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
