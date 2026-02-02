require("dotenv").config();

const jwt = require("jsonwebtoken");

const secretKey = process.env.JWT_SECRET_KEY;
const tokenDuration = process.env.JWT_EXPIRES_IN;   // e.g. "1h"
const tokenAlgorithm = process.env.JWT_ALGORITHM;   // e.g. "HS256"

const isProduction = process.env.NODE_ENV === "production";

module.exports.generateToken = (req, res, next) => {
  const payload = {
    userId: res.locals.userId,
    role: res.locals.role,
    created_on: res.locals.created_on,
    last_login_on: res.locals.last_login_on,
    timestamp: new Date(),
  };

  const options = {
    algorithm: tokenAlgorithm,
    expiresIn: tokenDuration,
  };

  const callback = (err, token) => {
    if (err) {
      console.error("Error jwt:", err);
      return res.status(500).json({ error: "Failed to generate token" });
    }

    // Attach to res.locals (frontend still expects this)
    res.locals.token = token;

    // Also set cookie for session-style auth
    res.cookie("authToken", token, {
      httpOnly: true,                    // JS cannot read it
      secure: isProduction,              // true when using HTTPS in prod
      sameSite: "lax",
      maxAge: 60 * 60 * 1000,            // 1h
    });

    next();
  };

  jwt.sign(payload, secretKey, options, callback);
};

module.exports.sendToken = (req, res, next) => {
  // IMPORTANT: send token back again so your login.js can store it
  res.status(200).json({
    message: res.locals.message,
    role: res.locals.role,
    token: res.locals.token,   // <--- put this back
    userId: res.locals.userId
  });
};

module.exports.verifyToken = (req, res, next) => {
  let token = null;
  const authHeader = req.headers.authorization;

  // 1) Bearer header (if you ever use it)
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.substring(7);
  }

  // 2) Or cookie (browser session)
  if (!token && req.cookies && req.cookies.authToken) {
    token = req.cookies.authToken;
  }

  if (!token) {
    return res.status(401).json({ error: "Unauthorized. No token provided." });
  }

  const callback = (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: "Invalid token" });
    }

    res.locals.userId = decoded.userId;
    res.locals.role = decoded.role;
    res.locals.tokenTimestamp = decoded.timestamp;

    next();
  };

  jwt.verify(token, secretKey, callback);
};

module.exports.logout = (req, res) => {
  res.clearCookie("authToken");
  return res.status(200).json({ message: "Logged out" });
};
