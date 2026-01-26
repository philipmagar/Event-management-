const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const { errorMiddleware, loggerMiddleware } = require("./middleware/commonMiddleware");

require("dotenv").config();
const app = express();

/* -------------------- CORS -------------------- */
/* -------------------- CORS -------------------- */
// permissive CORS for debugging Vercel deployment
app.use(cors({
    origin: true, // Reflect any requesting origin
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    credentials: true,
    optionsSuccessStatus: 200
}));

// CORS is already handled by app.use(cors(...)) above

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

// Mount on root path (fallback for serverless rewrites)
app.use("/auth", authRoutes);
app.use("/events", eventRoutes);
app.use("/bookings", bookingRoutes);

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

/* -------------------- Export -------------------- */
const PORT = process.env.PORT || 5000;
module.exports = app;

/* -------------------- Local Dev -------------------- */
if (require.main === module) {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}