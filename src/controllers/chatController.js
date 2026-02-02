const chatModel = require("../models/chatModel");
const prisma = require("../services/prismaClient");

function makeId() {
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

async function isAdmin(userId) {
  const id = Number(userId);
  if (!Number.isInteger(id)) return false;

  const user = await prisma.users.findUnique({
    where: { userId: id },
    select: { role: true },
  });

  return user?.role === "admin";
}

/* =========================
   DM / normal conversations
   ========================= */
async function joinConversation(socket, conversationId) {
  if (!conversationId) return;

  socket.join(conversationId);

  await chatModel.upsertConversation(conversationId);
  const messages = await chatModel.getMessages(conversationId, 100);

  socket.emit("chatHistory", { conversationId, messages });
}

async function sendMessage(io, conversationId, message) {
  if (!conversationId || !message?.text?.trim()) return;

  const senderId = Number(message.senderId);
  if (!Number.isInteger(senderId)) return;

  const saved = await chatModel.createMessage({
    messageId: message.id ?? makeId(),
    conversationId,
    senderId,
    text: message.text.trim(),
    status: message.status ?? "sent",
  });

  io.to(conversationId).emit("newMessage", { conversationId, message: saved });
}

/* =========================
   Admin group chat only
   conversationId is fixed: "admins"
   ========================= */
async function joinAdminChat(socket, userId) {
  if (!(await isAdmin(userId))) return;

  const conversationId = "admins";
  socket.join(conversationId);

  await chatModel.upsertConversation(conversationId);
  const messages = await chatModel.getMessages(conversationId, 200);

  socket.emit("chatHistory", { conversationId, messages });
}

async function sendAdminMessage(io, userId, text) {
  if (!(await isAdmin(userId))) return;
  if (!text?.trim()) return;

  const conversationId = "admins";
  const senderId = Number(userId);

  const saved = await chatModel.createMessage({
    messageId: makeId(),
    conversationId,
    senderId,
    text: text.trim(),
    status: "sent",
  });

  io.to(conversationId).emit("newMessage", { conversationId, message: saved });
}

/* =========================
   Typing + read receipts
   ========================= */
function typing(socket, conversationId, userId, isTyping) {
  if (!conversationId) return;
  socket.to(conversationId).emit("typing", { userId, isTyping: !!isTyping });
}

async function readMessage(io, conversationId, messageId, readerId) {
  if (!conversationId || !messageId) return;

  await chatModel.markRead(messageId);

  io.to(conversationId).emit("readReceipt", {
    conversationId,
    messageId,
    readerId,
    status: "read",
  });
}

module.exports = {
  joinConversation,
  sendMessage,
  joinAdminChat,
  sendAdminMessage,
  typing,
  readMessage,
};
