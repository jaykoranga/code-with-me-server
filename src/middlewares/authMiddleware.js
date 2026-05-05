
const jwt = require("jsonwebtoken");

const AUTH_MESSAGES = {
  TOKEN_REQUIRED: "Authorization token is required",
  TOKEN_INVALID: "Invalid or expired token",
  JWT_SECRET_MISSING: "JWT_SECRET is not configured",
};

const verifyToken = async(req, res, next) => {
  if (!process.env.JWT_SECRET) {
    return res.status(500).json({ message: AUTH_MESSAGES.JWT_SECRET_MISSING });
  }

  try {
     const token = req.cookies.accessToken
     if(!token){
      return res.status(401).json({ message: AUTH_MESSAGES.TOKEN_REQUIRED });
     }
      
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
    };
    return next();
  } catch (error) {
    console.error("Token verification error:", error.message);
    return res.status(401).json({ message: AUTH_MESSAGES.TOKEN_INVALID });
  }
};

module.exports = {
  verifyToken,
};
