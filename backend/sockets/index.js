const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const { getMembership } = require("../models/projectModel");

let io = null;

const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: { origin: "http://localhost:5173" },
  });

  // Every socket connection must send a valid JWT
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Unauthorized"));
    try {
      socket.user = jwt.verify(token, process.env.JWT_SECRET);
      next();
    } catch {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    // Personal room for notifications
    socket.join(`user:${socket.user.id}`);

    // Project room for board, comment and activity updates
    socket.on("project:join", async (projectId, ack) => {
      const id = Number(projectId);
      const allowed =
        socket.user.role === "admin" || (await getMembership(id, socket.user.id));

      if (!allowed) return ack?.({ ok: false });
      socket.join(`project:${id}`);
      ack?.({ ok: true });
    });

    socket.on("project:leave", (projectId) => {
      socket.leave(`project:${Number(projectId)}`);
    });
  });

  return io;
};

const emitToUser = (userId, event, payload) => {
  io?.to(`user:${userId}`).emit(event, payload);
};

const emitToProject = (projectId, event, payload) => {
  io?.to(`project:${projectId}`).emit(event, payload);
};

module.exports = { initSocket, emitToUser, emitToProject };