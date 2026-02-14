const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");
const path = require("path");
const logger = require("./utils/logger");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const {
  errorMiddleware,
  loggerMiddleware,
} = require("./middleware/commonMiddleware");

const app = express();

app.get("/", (req, res) => {
  res.json({ message: "Welcome to Event Management API" });
});

app.use(helmet());

const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
  "http://localhost:3000",
  "https://event-management-frontend-phi.vercel.app",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || process.env.NODE_ENV !== "production")
        return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        logger.warn(`CORS Blocked: Origin ${origin} not in allowlist`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 1000,
  message: "Too many requests from this IP, please try again later.",
});
app.use(limiter);

app.use(loggerMiddleware);
app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use("/api", async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    next(err);
  }
});

connectDB().catch((err) => {
  logger.error("Database connection failed during startup:", {
    error: err.message,
  });
});

const authRoutes = require("./routes/authRoutes");
const eventRoutes = require("./routes/eventRoutes");
const bookingRoutes = require("./routes/bookingRoutes");

app.use("/api/auth", authRoutes);

app.use("/api", mongoSanitize());
app.use("/api", xss());

app.use("/api/events", eventRoutes);
app.use("/api/bookings", bookingRoutes);

if (process.env.NODE_ENV === "production") {
  app.use((req, res, next) => {
    if (req.header("x-forwarded-proto") !== "https") {
      return res.redirect(`https://${req.header("host")}${req.url}`);
    }
    next();
  });
}

app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use(errorMiddleware);

if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  const server = app.listen(PORT, () =>
    logger.info(`Server running on port ${PORT}`),
  );

  try {
    const { init } = require("./utils/socket");
    init(server);
  } catch (err) {
    logger.error("Socket.io initialization skipped or failed");
  }
}

module.exports = app;
