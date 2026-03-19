import { io } from "socket.io-client";

// Simulate a customer connection
// User ID 2 is usually a customer based on the flow. Adjust if needed.
const CUSTOMER_ID = 2; // Fake customer ID for testing
const ADMIN_ID = 1; // Likely the first admin user ID in DB

console.log(`📡 Connecting to Chat Server as Customer (User ${CUSTOMER_ID})...`);

const socket = io("http://localhost:8080");

socket.on("connect", () => {
    console.log("✅ Custom test script connected! Socket ID:", socket.id);
    
    // Join our own room
    socket.emit("join_room", CUSTOMER_ID);

    setTimeout(() => {
        const message = `Automated TEST message from Customer (ID ${CUSTOMER_ID}) at ${new Date().toLocaleTimeString()}!`;
        console.log(`📤 Sending message to Admin (ID ${ADMIN_ID}): "${message}"`);
        
        socket.emit("send_message", {
            senderId: CUSTOMER_ID,
            receiverId: ADMIN_ID,
            message: message
        });
    }, 2000); // Send message 2s after connecting
});

socket.on("receive_message", (data) => {
    console.log("📥 [Customer received message]:", data);
    
    // If the admin replies, we automatically echo back so the user can test the full flow
    if (String(data.sender_id) !== String(CUSTOMER_ID)) {
        console.log(`🤖 Auto-replying to Admin (ID ${data.sender_id})...`);
        setTimeout(() => {
            socket.emit("send_message", {
                senderId: CUSTOMER_ID,
                receiverId: data.sender_id,
                message: `Got it! Thanks Admin. (Auto-reply sent at ${new Date().toLocaleTimeString()})`
            });
        }, 1500); // Send auto-reply after 1.5 seconds
    }
});

socket.on("connect_error", (error) => {
    console.log("❌ Connection error:", error);
});

socket.on("disconnect", () => {
    console.log("🔌 Disconnected from server.");
});
