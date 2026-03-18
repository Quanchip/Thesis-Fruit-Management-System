import { responseData } from "../config/response.js";
import {
    getChatHistory,
    getConversations,
    getAdminChatHistory,
    markAsRead,
    getAdminUser,
} from "../services/chatService.js";

// GET /chat/history/:userId - get chat history between logged-in user and :userId
export const getChatHistoryController = async (req, res) => {
    try {
        const { userId } = req.params;
        const currentUserId = req.query.currentUserId;

        if (!currentUserId) {
            return responseData(res, "currentUserId query param is required", "", 400);
        }

        const messages = await getChatHistory(
            parseInt(currentUserId),
            parseInt(userId)
        );

        // Mark messages from the other user as read
        await markAsRead(parseInt(userId), parseInt(currentUserId));

        responseData(res, "Success", messages, 200);
    } catch (error) {
        console.error("Error getting chat history:", error);
        responseData(res, "Error ...", "", 500);
    }
};

// GET /chat/admin-history/:customerId - get chat history for admin viewing a customer
export const getAdminChatHistoryController = async (req, res) => {
    try {
        const { customerId } = req.params;

        const messages = await getAdminChatHistory(parseInt(customerId));
        responseData(res, "Success", messages, 200);
    } catch (error) {
        console.error("Error getting admin chat history:", error);
        responseData(res, "Error ...", "", 500);
    }
};

// GET /chat/conversations?adminId=X - get all conversations for admin
export const getConversationsController = async (req, res) => {
    try {
        const { adminId } = req.query;

        if (!adminId) {
            return responseData(res, "adminId query param is required", "", 400);
        }

        const conversations = await getConversations(parseInt(adminId));
        responseData(res, "Success", conversations, 200);
    } catch (error) {
        console.error("Error getting conversations:", error);
        responseData(res, "Error ...", "", 500);
    }
};

// GET /chat/admin - get the admin user info for customers to know who to chat with
export const getAdminInfoController = async (req, res) => {
    try {
        const admin = await getAdminUser();
        if (!admin) {
            return responseData(res, "No admin found", "", 404);
        }
        responseData(res, "Success", admin, 200);
    } catch (error) {
        console.error("Error getting admin info:", error);
        responseData(res, "Error ...", "", 500);
    }
};
