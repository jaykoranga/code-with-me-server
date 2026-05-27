const bcrypt = require("bcrypt");
const User = require("../../../models/User.model");
const { generateUniqueUserName } = require("../../../utils/generateUniqueName");
const createAuthToken = require("../utils/createAuthToken");
const toSafeUser = require("../utils/toSafeUser");
const {
  SALT_ROUNDS,
  COOKIE_NAME,
  COOKIE_OPTIONS,
  RESPONSE_MESSAGES,
} = require("../constants/user.constants");


//signup 
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
      email: email,
      password: hashedPassword,
      userName: generateUniqueUserName()


    });
    console.log("new user created")

    if (!newUser) {
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

  }

  catch (error) {
    console.log("error while signing is ", error)
    return res.status(500).json({ message: RESPONSE_MESSAGES.INTERNAL_ERROR });
  }
};

//login 
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
  } 
  
  catch (error) {
    console.log("Error during login:", error);
    return res.status(500).json({ message: RESPONSE_MESSAGES.INTERNAL_ERROR });
  }
};

// get profile 
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

const logoutUser = async (req, res) => {
  try {
    res.clearCookie(COOKIE_NAME, COOKIE_OPTIONS);
    return res.status(200).json({ message: RESPONSE_MESSAGES.LOGOUT_SUCCESS });
  } catch (error) {
    console.log("Error during logout:", error);
    return res.status(500).json({ message: RESPONSE_MESSAGES.INTERNAL_ERROR });
  }
};

module.exports = {
  signupUser,
  loginUser,
  getProfile,
  logoutUser,
};
