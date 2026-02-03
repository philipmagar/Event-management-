const errorMiddleware = (err, req, res, next) => {
    console.error(err.stack);
    
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    
    const response = {
        message: err.message,
    };

    if (process.env.NODE_ENV !== "production") {
        response.stack = err.stack;
    }

    res.status(statusCode).json(response);
};

const loggerMiddleware = (req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
};

module.exports = { errorMiddleware, loggerMiddleware };
