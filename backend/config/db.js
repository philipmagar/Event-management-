const mongoose = require("mongoose");
const logger = require("../utils/logger");
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing in environment variables");
    }

    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000, // Increased for serverless cold starts
      socketTimeoutMS: 45000,
      family: 4,
    };

    logger.info("Connecting to MongoDB...");
    mongoose.set("strictQuery", false);

    cached.promise = mongoose
      .connect(process.env.MONGO_URI, opts)
      .then((mongoose) => {
        logger.info("MongoDB connected successfully");
        return mongoose;
      });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (e) {
    cached.promise = null;
    logger.error(`CRITICAL: MongoDB connection error: ${e.message}`);
    throw e;
  }
};

module.exports = connectDB;
