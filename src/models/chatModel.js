const prisma = require("../services/prismaClient");

async function createMessage(data) {
  return prisma.message.create({
    data,
    include: {
      sender: {
        select: {
          userId: true,
          username: true,
        },
      },
    },
  });
}

async function getMessages(conversationId, limit = 50) {
  return prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: "asc" },
    take: limit,
    include: {
      sender: {
        select: {
          userId: true,
          username: true,
        },
      },
    },
  });
}

async function upsertConversation(conversationId) {
  return prisma.conversation.upsert({
    where: { conversationId },
    update: {},
    create: { conversationId },
  });
}

async function markRead(messageId) {
  return prisma.message.update({
    where: { messageId },
    data: { status: "read" },
  });
}

module.exports = {
  createMessage,
  getMessages,
  upsertConversation,
  markRead,
};
