const errorMiddleware = (err, req, res, next) => {
    // Log the full stack for the developer
    console.error(`[ERROR] ${req.method} ${req.url}:`, err.stack);
    
    // Default to 500 if no status code is set
    let statusCode = err.status || (res.statusCode === 200 ? 500 : res.statusCode);
    let message = err.message || "Internal Server Error";

    // Handle specific error types
    if (err.name === 'CastError' && err.kind === 'ObjectId') {
        statusCode = 404;
        message = 'Resource not found';
    }

    if (err.message === "Not allowed by CORS") {
        statusCode = 403; // Forbidden instead of 500
    }

    const response = {
        message: message,
        status: "error"
    };

    // Include stack trace and more info in development
    if (process.env.NODE_ENV !== "production") {
        response.stack = err.stack;
        response.details = err;
    }

    res.status(statusCode).json(response);
};

const loggerMiddleware = (req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
};

module.exports = { errorMiddleware, loggerMiddleware };
