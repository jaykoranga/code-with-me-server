 const jwt = require("jsonwebtoken");
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

  module.exports=createAuthToken