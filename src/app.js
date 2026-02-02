const express = require("express");
const cookieParser = require("cookie-parser");
const path = require("path");
const passport = require("passport");
const configurePassport = require("./services/passport/passport");

const app = express();

// Middlewares
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));
app.use(cookieParser());

// Passport setup
configurePassport(passport);
app.use(passport.initialize());

// API routes
const mainRoute = require("./routers/mainRoute");
app.use("/api", mainRoute);

// Serve frontend build folder
app.use(express.static(path.join(__dirname, "build")));

// Catch-all route to serve SPA
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

// Ignore Chrome devtools probe
app.get("/.well-known/*", (req, res) => res.status(204).end());

// Ignore missing source maps quietly
app.get(/^\/assets\/.*\.(map)$/, (req, res) => res.status(404).end());

// Error handling
app.use((err, req, res, next) => {
  console.error(err);
  res
    .status(err.status || 500)
    .json({ error: err.message || "Unknown Server Error!" });
});

module.exports = app;
