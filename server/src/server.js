import "dotenv/config";
import http from "http";
import { Server as SocketServer } from "socket.io";
import app from "./app.js";
import connectDB from "./config/db.js";
import { initializeSockets } from "./sockets/chat.socket.js";

const PORT = process.env.PORT || 5000;

const httpServer = http.createServer(app);

export const io = new SocketServer(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL,
    credentials: true,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

// Initialize all socket handlers
initializeSockets(io);

const start = async () => {
  await connectDB();
  httpServer.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`🔌 Socket.io ready`);
  });
};

start();
