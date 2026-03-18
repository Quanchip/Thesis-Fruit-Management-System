import express from "express";
import {
    getChatHistoryController,
    getAdminChatHistoryController,
    getConversationsController,
    getAdminInfoController,
} from "../controllers/chatController.js";

const chatRoutes = express.Router();

// Get chat history between current user and another user
chatRoutes.get("/history/:userId", getChatHistoryController);

// Get chat history for admin viewing a customer (finds messages involving ANY admin)
chatRoutes.get("/admin-history/:customerId", getAdminChatHistoryController);

// Get all conversations (admin only)
chatRoutes.get("/conversations", getConversationsController);

// Get admin user info (for customers to know who to chat with)
chatRoutes.get("/admin", getAdminInfoController);

export default chatRoutes;
