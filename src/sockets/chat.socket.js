const chatController = require("../controllers/chatController");

module.exports = (io) => {
  io.on("connection", (socket) => {
    /* =========================
       DM / normal chat
       ========================= */
    socket.on("joinConversation", async ({ conversationId }) => {
      try {
        await chatController.joinConversation(socket, conversationId);
      } catch (e) {
        console.error("joinConversation error:", e);
      }
    });

    socket.on("sendMessage", async ({ conversationId, message }) => {
      try {
        await chatController.sendMessage(io, conversationId, message);
      } catch (e) {
        console.error("sendMessage error:", e);
      }
    });

    /* =========================
       Admin group chat
       ========================= */
    socket.on("joinAdminChat", async ({ userId }) => {
      try {
        await chatController.joinAdminChat(socket, userId);
      } catch (e) {
        console.error("joinAdminChat error:", e);
      }
    });

    socket.on("sendAdminMessage", async ({ userId, text }) => {
      try {
        await chatController.sendAdminMessage(io, userId, text);
      } catch (e) {
        console.error("sendAdminMessage error:", e);
      }
    });

    /* =========================
       Shared events (typing/read)
       ========================= */
    socket.on("typing", ({ conversationId, userId, isTyping }) => {
      chatController.typing(socket, conversationId, userId, isTyping);
    });

    socket.on(
      "readMessage",
      async ({ conversationId, messageId, readerId }) => {
        try {
          await chatController.readMessage(
            io,
            conversationId,
            messageId,
            readerId
          );
        } catch (e) {
          console.error("readMessage error:", e);
        }
      }
    );
  });
};
