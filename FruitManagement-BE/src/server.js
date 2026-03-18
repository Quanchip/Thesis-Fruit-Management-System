import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import rootRoute from "./routes/rootRoutes.js";
import swaggerRouter from "./swagger/swagger.js";
import { saveMessage } from "./services/chatService.js";
import initModels from "./models/init-models.js";
import sequelize from "./models/connect.js";

const model = initModels(sequelize);

const app = express();
app.use(express.json());
app.use(cors());

app.use(express.static("."));

app.use(swaggerRouter);
app.use(rootRoute);

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Socket.IO event handling
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // User joins their own room (identified by user_id)
  socket.on("join_room", (userId) => {
    socket.join(`user_${userId}`);
    console.log(`User ${userId} joined room user_${userId}`);
  });

  // Admin joins a shared admin room so all admins get customer messages
  socket.on("join_admin_room", () => {
    socket.join("admin_room");
    console.log(`Socket ${socket.id} joined admin_room`);
  });

  // Handle sending messages
  socket.on("send_message", async (data) => {
    try {
      const { senderId, receiverId, message } = data;

      // Save message to database
      const savedMessage = await saveMessage(senderId, receiverId, message);

      // Look up sender's name so admin sees real names
      const senderUser = await model.users.findOne({
        where: { user_id: senderId },
        attributes: ["full_name"],
      });

      const now = new Date().toISOString();

      const messageData = {
        message_id: savedMessage.message_id,
        sender_id: senderId,
        receiver_id: receiverId,
        message: message,
        is_read: false,
        created_at: now,
        sender_name: senderUser?.full_name || "Unknown",
      };

      // Send to receiver's room
      io.to(`user_${receiverId}`).emit("receive_message", messageData);

      // Also send to admin_room so any logged-in admin sees it
      io.to("admin_room").emit("receive_message", messageData);

      // Send back to sender for confirmation
      io.to(`user_${senderId}`).emit("receive_message", messageData);
    } catch (error) {
      console.error("Error saving message:", error);
      socket.emit("message_error", { error: "Failed to send message" });
    }
  });

  // Handle typing indicator
  socket.on("typing", (data) => {
    const { senderId, receiverId } = data;
    io.to(`user_${receiverId}`).emit("user_typing", { userId: senderId });
    io.to("admin_room").emit("user_typing", { userId: senderId });
  });

  socket.on("stop_typing", (data) => {
    const { senderId, receiverId } = data;
    io.to(`user_${receiverId}`).emit("user_stop_typing", {
      userId: senderId,
    });
    io.to("admin_room").emit("user_stop_typing", { userId: senderId });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

const host = process.env.HOST || "127.0.0.1";
const preferredPort = Number(process.env.PORT || 8080);
const maxPortRetries = Number(process.env.PORT_RETRIES || 10);

const startServer = (port, retriesLeft) => {
  httpServer.listen(port, host, () => {
    console.log(`Server is running at http://${host}:${port}`);
  });

  httpServer.on("error", (error) => {
    if ((error.code === "EADDRINUSE" || error.code === "EPERM") && retriesLeft > 0) {
      console.warn(
        `Port ${port} is unavailable (${error.code}). Retrying on ${port + 1}...`
      );
      startServer(port + 1, retriesLeft - 1);
      return;
    }

    console.error("Failed to start server:", error.message);
    console.warn("Will retry startup in 2 seconds...");
    setTimeout(() => startServer(preferredPort, maxPortRetries), 2000);
  });
};

startServer(preferredPort, maxPortRetries);
export default app;
