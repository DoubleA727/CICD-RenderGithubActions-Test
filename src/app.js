const express = require("express");
const cookieParser = require("cookie-parser");
const path = require("path");
const cors = require("cors");
const passport = require("passport");
const configurePassport = require("./services/passport/passport");

const app = express();

// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || "*",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Cookie"]
}));

// Middlewares
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));
app.use(cookieParser());

// Passport setup
configurePassport(passport);
app.use(passport.initialize());

// Serve static files from src/public
app.use(express.static(path.join(__dirname, "public")));

// API routes
const mainRoute = require("./routers/mainRoute");
app.use("/api", mainRoute);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    service: "Express API"
  });
});

// Catch-all route to serve SPA
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Ignore Chrome devtools probe
app.get("/.well-known/*", (req, res) => res.status(204).end());

// Ignore missing source maps quietly
app.get(/^\/assets\/.*\.(map)$/, (req, res) => res.status(404).end());

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  
  // Set default status code
  const statusCode = err.status || 500;
  
  // Don't expose internal errors in production
  const message = process.env.NODE_ENV === 'production' && statusCode === 500 
    ? "Internal server error" 
    : err.message || "Unknown Server Error!";
  
  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

module.exports = app;