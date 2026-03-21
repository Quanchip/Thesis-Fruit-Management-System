import initModels from "../models/init-models.js";
import sequelize from "../models/connect.js";
import { Op, QueryTypes } from "sequelize";

let model = initModels(sequelize);

// Ensure the chat_messages table exists
const ensureTable = async () => {
    try {
        await sequelize.query(`
      CREATE TABLE IF NOT EXISTS chat_messages (
        message_id INT AUTO_INCREMENT PRIMARY KEY,
        sender_id INT NOT NULL,
        receiver_id INT NOT NULL,
        message TEXT NOT NULL,
        is_read BOOLEAN NOT NULL DEFAULT FALSE,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX sender_id (sender_id),
        INDEX receiver_id (receiver_id),
        FOREIGN KEY (sender_id) REFERENCES users(user_id),
        FOREIGN KEY (receiver_id) REFERENCES users(user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    } catch (err) {
        console.error("Error ensuring chat_messages table:", err.message);
    }
};
ensureTable();

// Get all admin user IDs
const getAdminUserIds = async () => {
    const admins = await model.users.findAll({
        where: { role_id: 1 },
        attributes: ["user_id"],
    });
    return admins.map((a) => a.user_id);
};

// Get chat history between two users
export const getChatHistory = async (userId1, userId2) => {
    const adminIds = await getAdminUserIds();
    
    // If either user is an admin, expand their ID to include all admins so multiple admins can reply to a user seamlessly
    const u1IsAdmin = adminIds.includes(userId1);
    const u2IsAdmin = adminIds.includes(userId2);
    
    const target1 = u1IsAdmin ? { [Op.in]: adminIds } : userId1;
    const target2 = u2IsAdmin ? { [Op.in]: adminIds } : userId2;

    const messages = await model.chat_messages.findAll({
        where: {
            [Op.or]: [
                { sender_id: target1, receiver_id: target2 },
                { sender_id: target2, receiver_id: target1 },
            ],
        },
        order: [["created_at", "ASC"]],
        include: [
            {
                model: model.users,
                as: "sender",
                attributes: ["user_id", "full_name"],
            },
            {
                model: model.users,
                as: "receiver",
                attributes: ["user_id", "full_name"],
            },
        ],
    });
    return messages;
};

// Get all conversations for admin — finds messages involving ANY admin user
export const getConversations = async (adminId) => {
    // Get all admin user IDs
    const adminIds = await getAdminUserIds();

    // Find messages where one side is any admin
    const messages = await model.chat_messages.findAll({
        where: {
            [Op.or]: [
                { sender_id: { [Op.in]: adminIds } },
                { receiver_id: { [Op.in]: adminIds } },
            ],
        },
        order: [["created_at", "DESC"]],
        include: [
            {
                model: model.users,
                as: "sender",
                attributes: ["user_id", "full_name"],
            },
            {
                model: model.users,
                as: "receiver",
                attributes: ["user_id", "full_name"],
            },
        ],
    });

    // Group by the non-admin user and count unread messages
    const conversationMap = new Map();
    const unreadCountMap = new Map();

    for (const msg of messages) {
        // Determine which user is the customer (non-admin)
        const senderIsAdmin = adminIds.includes(msg.sender_id);
        const otherUserId = senderIsAdmin ? msg.receiver_id : msg.sender_id;
        const otherUser = senderIsAdmin ? msg.receiver : msg.sender;

        // Skip if both are admins
        if (adminIds.includes(otherUserId)) continue;

        // Count unread messages from the customer (not from admin)
        if (!senderIsAdmin && !msg.is_read) {
            unreadCountMap.set(otherUserId, (unreadCountMap.get(otherUserId) || 0) + 1);
        }

        if (!conversationMap.has(otherUserId)) {
            conversationMap.set(otherUserId, {
                user_id: otherUserId,
                full_name: otherUser?.full_name || "Unknown",
                last_message: msg.message,
                last_message_time: msg.created_at,
                is_read: msg.is_read,
                unread_count: 0, // will be set below
            });
        }
    }

    // Attach unread counts
    for (const [userId, conv] of conversationMap) {
        conv.unread_count = unreadCountMap.get(userId) || 0;
    }

    return Array.from(conversationMap.values());
};

// Get chat history for admin — finds messages between a customer and ANY admin
export const getAdminChatHistory = async (customerId) => {
    const adminIds = await getAdminUserIds();

    const messages = await model.chat_messages.findAll({
        where: {
            [Op.or]: [
                { sender_id: customerId, receiver_id: { [Op.in]: adminIds } },
                { sender_id: { [Op.in]: adminIds }, receiver_id: customerId },
            ],
        },
        order: [["created_at", "ASC"]],
        include: [
            {
                model: model.users,
                as: "sender",
                attributes: ["user_id", "full_name"],
            },
            {
                model: model.users,
                as: "receiver",
                attributes: ["user_id", "full_name"],
            },
        ],
    });
    return messages;
};

// Save a message to the database
export const saveMessage = async (senderId, receiverId, message) => {
    const newMessage = await model.chat_messages.create({
        sender_id: senderId,
        receiver_id: receiverId,
        message: message,
    });
    return newMessage;
};

// Mark messages as read (for customer viewing an admin's messages)
export const markAsRead = async (senderId, receiverId) => {
    await model.chat_messages.update(
        { is_read: true },
        {
            where: {
                sender_id: senderId,
                receiver_id: receiverId,
                is_read: false,
            },
        }
    );
};

// Mark messages as read (for admin viewing a customer's messages)
export const markAsReadForAdmin = async (customerId) => {
    const adminIds = await getAdminUserIds();
    await model.chat_messages.update(
        { is_read: true },
        {
            where: {
                sender_id: customerId,
                receiver_id: { [Op.in]: adminIds },
                is_read: false,
            },
        }
    );
};

// Find the first admin user
export const getAdminUser = async () => {
    const admin = await model.users.findOne({
        where: { role_id: 1 },
        attributes: ["user_id", "full_name"],
    });
    return admin;
};
