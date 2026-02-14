const { Server } = require("socket.io");
const logger = require("./logger");

let io;

const init = (server) => {
  const allowedOrigins = [
    process.env.FRONTEND_URL,
    "https://event-management-frontend-phi.vercel.app",
  ].filter(Boolean);

  io = new Server(server, {
    cors: {
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (
          allowedOrigins.indexOf(origin) !== -1 ||
          process.env.NODE_ENV !== "production"
        ) {
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS"));
        }
      },
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    logger.info(`Client connected via Socket.io: ${socket.id}`);

    socket.on("disconnect", () => {
      logger.info(`Client disconnected: ${socket.id}`);
    });
  });

  logger.info("Socket.io initialized successfully.");
  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};

const emitUpdate = (event, data) => {
  if (io) {
    io.emit(event, data);
  }
};

module.exports = { init, getIO, emitUpdate };
