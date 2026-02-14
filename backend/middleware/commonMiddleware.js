const logger = require("../utils/logger");

const errorMiddleware = (err, req, res, next) => {
  logger.error(`${req.method} ${req.url}: ${err.message}`, {
    stack: err.stack,
  });

  let statusCode =
    err.status || (res.statusCode === 200 ? 500 : res.statusCode);
  let message = err.message || "Internal Server Error";

  if (err.name === "CastError" && err.kind === "ObjectId") {
    statusCode = 404;
    message = "Resource not found";
  }

  if (err.message === "Not allowed by CORS") {
    statusCode = 403;
    message = "CORS Blocked: Origin not allowed";
  }

  if (process.env.NODE_ENV === "production" && statusCode === 500) {
    message = "An unexpected error occurred. Please try again later.";
  }

  const response = {
    message: message,
    status: "error",
  };

  if (process.env.NODE_ENV !== "production") {
    response.stack = err.stack;
    response.details = err;
  }

  res.status(statusCode).json(response);
};

const loggerMiddleware = (req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    logger.info(
      `${req.method} ${req.originalUrl || req.url} - ${res.statusCode} (${duration}ms)`,
    );
  });
  next();
};

module.exports = { errorMiddleware, loggerMiddleware };
