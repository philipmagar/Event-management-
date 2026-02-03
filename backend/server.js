const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const connectDB = require("./config/db");
const { errorMiddleware, loggerMiddleware } = require("./middleware/commonMiddleware");
require("dotenv").config();
const app = express();

app.use(helmet()); // Set security HTTP headers

// Rate limiting: 100 requests per 10 minutes
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 100,
    message: "Too many requests from this IP, please try again later."
});
app.use(limiter);

app.use(cors({
    origin: (origin, callback) => {
        const allowed = ["http://localhost:5173", process.env.FRONTEND_URL];
        if (!origin || allowed.includes(origin) || process.env.NODE_ENV === "production") {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
}));

/* -------------------- Environment Check -------------------- */
if (!process.env.MONGO_URI) {
    console.error("CRITICAL ERROR: MONGO_URI is not defined in environment variables.");
} else {
    console.log("MONGO_URI is defined.");
}

/* -------------------- Middleware -------------------- */
app.use(loggerMiddleware);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use("/api", mongoSanitize()); // Data sanitization against NoSQL query injection
app.use("/api", xss()); // Data sanitization against XSS

// Debug middleware to log request path
app.use((req, res, next) => {
    console.log(`Incoming Request: ${req.method} ${req.url}`);
    next();
});

/* -------------------- DB Connection -------------------- */
connectDB().catch(err => {
    console.error("Database connection failed during startup:", err.message);
});

/* -------------------- Routes -------------------- */
const authRoutes = require("./routes/authRoutes");
const eventRoutes = require("./routes/eventRoutes");
const bookingRoutes = require("./routes/bookingRoutes");

// Mount on /api path (standard)
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/bookings", bookingRoutes);

/* -------------------- Root -------------------- */
app.get("/", (req, res) => {
    res.json({ message: "Welcome to Event Management API" });
});

/* -------------------- Health -------------------- */
app.get("/api/health", (req, res) => {
    res.json({ status: "OK", timestamp: new Date().toISOString() });
});

/* -------------------- 404 Handler -------------------- */
app.use((req, res) => {
    res.status(404).json({ message: "Route not found" });
});

/* -------------------- Error Handler -------------------- */
app.use(errorMiddleware);

/* -------------------- START SERVER -------------------- */
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5000;
    const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    
    // Initialize Socket.io
    const { init } = require("./utils/socket");
    init(server);
}

module.exports = app;
