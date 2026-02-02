const adminModel = require("../models/adminModel.js");

module.exports.verifyAdmin = (req, res, next) => {
  const userId = res.locals.userId; // set by verifyToken

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized: No user session" });
  }

  adminModel.verifyAdmin(userId, (err, result) => {
    if (err) {
      console.error("verifyAdmin DB error:", err);
      return res.status(500).json({ error: "Internal server error" });
    }

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = result.rows[0];

    if (user.role !== "admin") {
      return res.status(403).json({ error: "Forbidden: Admins only" });
    }

    res.locals.userRole = user.role;

    next();
  });
};
