const jwt = require("jsonwebtoken");
const logger = require("../utils/logger");

module.exports = (req, res, next) => {
  const authHeader = req.header("Authorization");

  if (!authHeader) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  const token = authHeader.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : authHeader;

  if (!token || token === "null" || token === "undefined") {
    return res
      .status(401)
      .json({ message: "Unauthorized: Invalid token format" });
  }

  if (!process.env.JWT_SECRET) {
    logger.error("CRITICAL: JWT_SECRET is not set!");
    return res.status(500).json({ message: "Server configuration error" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      if (err.name === "TokenExpiredError") {
        return res
          .status(401)
          .json({ message: "Unauthorized: Token has expired" });
      }
      if (err.name === "JsonWebTokenError") {
        return res.status(401).json({ message: "Unauthorized: Invalid token" });
      }
      return res
        .status(401)
        .json({ message: "Unauthorized: Token verification failed" });
    }

    req.user = decoded;
    next();
  });
};
