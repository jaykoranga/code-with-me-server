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
  LOGOUT_SUCCESS: "Logout successful",
  REQUIRED_FIELDS: "email, password are required",
  EMAIL_PASS_REQUIRED: "email and password are required",
  USER_EXISTS: "User already exists",
  INVALID_CREDENTIALS: "Invalid credentials",
  USER_NOT_FOUND: "User not found",
  TOKEN_INVALID: "Invalid or expired token",
  JWT_SECRET_MISSING: "JWT_SECRET is not configured",
  INTERNAL_ERROR: "Internal server error",
  USER_CREATION_FAILED: "User creation was failed at db ",
};

module.exports = {
  SALT_ROUNDS,
  COOKIE_NAME,
  COOKIE_OPTIONS,
  RESPONSE_MESSAGES,
};
