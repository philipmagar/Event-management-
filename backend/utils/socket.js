const socketIo = require("socket.io");

let io;

const init = (server) => {
    io = socketIo(server, {
        cors: {
            origin: "*", // Adjust in production
            methods: ["GET", "POST"]
        }
    });

    io.on("connection", (socket) => {
        console.log("Client connected:", socket.id);
        
        socket.on("disconnect", () => {
            console.log("Client disconnected");
        });
    });

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
