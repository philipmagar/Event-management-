const { Server } = require("socket.io");

let io;

const init = (server) => {
    console.log("Initializing Socket.io...");
    io = new Server(server, {
        cors: {
            origin: [
                "http://localhost:5173", 
                "http://localhost:3000",
                process.env.FRONTEND_URL
            ].filter(Boolean),
            methods: ["GET", "POST"],
            credentials: true
        }
    });

    io.on("connection", (socket) => {
        console.log("Client connected via Socket.io:", socket.id);
        
        socket.on("disconnect", () => {
            console.log("Client disconnected:", socket.id);
        });
    });

    console.log("Socket.io initialized successfully.");
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
