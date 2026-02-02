const socket = io();

// Admin userId from URL (must match Users.userId, e.g. 1,2,3,4,5)
const params = new URLSearchParams(window.location.search);
const ME = params.get("me") || "1"; // default admin1

let currentConversationId = "admins";
let typingTimer = null;

const messagesEl = document.getElementById("messages");
const chatNameEl = document.getElementById("chatName");
const chatAvatarEl = document.getElementById("chatAvatar");
const typingEl = document.getElementById("typing");
const inputEl = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const connStatusEl = document.getElementById("connStatus");

// Optional: hide left chat list panel if your HTML has it
const chatListEl = document.getElementById("chatList");
if (chatListEl) chatListEl.style.display = "none";

// Set header UI
chatNameEl.textContent = "Admin Group Chat";
chatAvatarEl.textContent = "A";

// Join admin chat once connected
socket.on("connect", () => {
  if (connStatusEl) connStatusEl.textContent = "online";
  socket.emit("joinAdminChat", { userId: ME });
});

socket.on("disconnect", () => {
  if (connStatusEl) connStatusEl.textContent = "offline";
});

// Render a message bubble
function addBubble(msg) {
  const bubble = document.createElement("div");

  const isMe = Number(msg.senderId) === Number(ME);
  bubble.className = "bubble " + (isMe ? "me" : "them");

  const time = new Date(msg.createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const senderName = isMe ? "You" : msg.sender?.username || "Admin";

  bubble.innerHTML = `
    <div class="sender">${escapeHtml(senderName)}</div>
    <div class="text">${escapeHtml(msg.text)}</div>
    <div class="meta">${time}</div>
  `;

  messagesEl.appendChild(bubble);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

// History from server
socket.on("chatHistory", ({ conversationId, messages }) => {
  if (conversationId !== currentConversationId) return;

  messagesEl.innerHTML = "";
  messages.forEach(addBubble);
});

// New incoming message
socket.on("newMessage", ({ conversationId, message }) => {
  if (conversationId !== currentConversationId) return;
  addBubble(message);
});

// Typing indicator (optional)
inputEl.addEventListener("input", () => {
  socket.emit("typing", {
    conversationId: currentConversationId,
    userId: ME,
    isTyping: true,
  });

  clearTimeout(typingTimer);
  typingTimer = setTimeout(() => {
    socket.emit("typing", {
      conversationId: currentConversationId,
      userId: ME,
      isTyping: false,
    });
  }, 800);
});

socket.on("typing", ({ userId, isTyping }) => {
  // show typing for other admins only
  if (String(userId) === String(ME)) return;

  typingEl.textContent = isTyping ? `Admin ${userId} is typing...` : "";
});

// Send admin message
function send() {
  const text = inputEl.value.trim();
  if (!text) return;

  socket.emit("sendAdminMessage", { userId: ME, text });
  inputEl.value = "";

  socket.emit("typing", {
    conversationId: currentConversationId,
    userId: ME,
    isTyping: false,
  });
}

sendBtn.addEventListener("click", send);
inputEl.addEventListener("keydown", (e) => {
  if (e.key === "Enter") send();
});

// basic XSS-safe output
function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
