const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    const authHeader = req.header("Authorization");
    
    if (!authHeader) {
        console.log("Auth Error: No Authorization header provided");
        return res.status(401).json({ message: "Unauthorized: No token provided" });
    }
    
    const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader;
    
    if (!token || token === "null" || token === "undefined") {
        console.log("Auth Error: Token is empty or invalid string");
        return res.status(401).json({ message: "Unauthorized: Invalid token format" });
    }

    // Check if JWT_SECRET is set
    if (!process.env.JWT_SECRET) {
        console.error("CRITICAL: JWT_SECRET is not set in environment variables!");
        return res.status(500).json({ message: "Server configuration error" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            console.log("JWT Verification Error:", err.name, err.message);
            
            if (err.name === "TokenExpiredError") {
                return res.status(401).json({ message: "Unauthorized: Token has expired" });
            }
            if (err.name === "JsonWebTokenError") {
                return res.status(401).json({ message: "Unauthorized: Invalid token" });
            }
            return res.status(401).json({ message: "Unauthorized: Token verification failed" });
        }
        
        req.user = decoded;
        next();
    });
};