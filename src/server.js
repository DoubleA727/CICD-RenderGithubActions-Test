require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");
const { PrismaClient } = require("@prisma/client");

const app = require("./app");
const registerSockets = require("./sockets");

// Initialize Prisma Client
const prisma = new PrismaClient();

const port = process.env.PORT || 3000;

// Create HTTP server
const server = http.createServer(app);

// Setup Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_ORIGIN || "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"] // Ensure compatibility
});

// Make io accessible in routes/controllers
app.set("io", io);

// Mount all socket modules
registerSockets(io);

// Database connection test
async function testDatabaseConnection() {
  try {
    await prisma.$connect();
    console.log("✅ Database connected successfully");
    return true;
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    
    // Don't exit in production, just log
    if (process.env.NODE_ENV === 'production') {
      console.log("Continuing without database connection...");
      return false;
    }
    
    process.exit(1);
  }
}

// Graceful shutdown
async function gracefulShutdown() {
  console.log("Shutting down gracefully...");
  
  // Close Socket.IO
  io.close();
  
  // Close Prisma connection
  await prisma.$disconnect();
  
  // Close HTTP server
  server.close(() => {
    console.log("HTTP server closed");
    process.exit(0);
  });
  
  // Force shutdown after 10 seconds
  setTimeout(() => {
    console.error("Forcing shutdown after timeout");
    process.exit(1);
  }, 10000);
}

// Handle shutdown signals
process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);

// Unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

// Uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  gracefulShutdown();
});

// Start server
async function startServer() {
  try {
    // Test DB connection
    await testDatabaseConnection();
    
    // Start listening
    server.listen(port, () => {
      console.log(`
🚀 Server is running!
📍 Port: ${port}
🌍 Environment: ${process.env.NODE_ENV || "development"}
📡 Socket.IO: Enabled
🛠️ Ready to handle requests
      `);
      
      // Health check URL
      console.log(`✅ Health check: http://localhost:${port}/api/health`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

// Start the server
startServer();

module.exports = { app, server, io, prisma };