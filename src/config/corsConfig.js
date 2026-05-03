const DEFAULT_ORIGIN = "http://localhost:5173";

const ALLOWED_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"];
const ALLOWED_HEADERS = ["Content-Type", "Authorization"];

const parseAllowedOrigins = (value) => {
  if (!value || typeof value !== "string") {
    return [DEFAULT_ORIGIN];
  }

  const origins = value
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  return origins.length ? origins : [DEFAULT_ORIGIN];
};

const corsConfig = {
  origin: parseAllowedOrigins(process.env.ALLOWED_ORIGINS),
  methods: ALLOWED_METHODS,
  allowedHeaders: ALLOWED_HEADERS,
  credentials: true,
};

module.exports = corsConfig;
