const usersModel = require("../models/usersModel");

// 3) PUT /users/:userId
module.exports.updateUserById = (req, res) => {
  const user_id = req.params.user_id;

  if (!user_id || user_id == undefined) {
    return res.status(400).json({ message: "Missing user_id, please log in again." });
  }

  const { username, firstName, lastName, email, password } = req.body;

  const data = {
    user_id,
    username,
    firstName,
    lastName,
    email,
    password
  };

  usersModel.updateUser(data, (error, results) => {
    if (error) {
      console.error(error);
      return res.status(500).json({ message: "Database error", error });
    }

    return res.status(200).json({
      message: "User updated successfully",
      user: {
        user_id,
        username,
        firstName,
        lastName,
        email
      }
    });
  });
};

// getUserById
module.exports.getUserById = (req, res) => {
  const user_id = parseInt(req.params.user_id);

  if (!user_id) {
    return res.status(400).json({ message: "User ID is required" });
  }

  const data = { user_id };

  usersModel.findUserById(data, (error, result) => {
    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }

    const rows = result.rows;

    if (!rows || rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = {
      userId: rows[0].userid,
      username: rows[0].username,
      firstName: rows[0].firstname,
      lastName: rows[0].lastname,
      email: rows[0].email,
      imageUrl: rows[0].imageurl,
      createdAt: rows[0].createdat,
      achievements: [],
      merch: [],
      orders: []
    };

    const achievementMap = new Map();
    const merchMap = new Map();
    const orderMap = new Map();

    rows.forEach(row => {
      // Achievements
      if (row.achievementid && !achievementMap.has(row.achievementid)) {
        const achievement = {
          achievementId: row.achievementid,
          name: row.achievement_name,
          description: row.achievement_description,
          unlockedAt: row.unlockedat
        };
        achievementMap.set(row.achievementid, achievement);
        user.achievements.push(achievement);
      }

      // Merch
      if (row.merchid && !merchMap.has(row.merchid)) {
        const merch = {
          merchId: row.merchid,
          name: row.merch_name,
          price: row.merch_price,
          imageUrl: row.merch_imageurl,
          collectedAt: row.collectedat
        };
        merchMap.set(row.merchid, merch);
        user.merch.push(merch);
      }

      // Orders + Order Items
      if (row.order_id) {
        let order;
        if (!orderMap.has(row.order_id)) {
          order = {
            orderId: row.order_id,
            shippingPrice: row.shippingprice,
            totalPrice: row.totalprice,
            createdAt: row.order_createdat,
            items: []
          };
          orderMap.set(row.order_id, order);
          user.orders.push(order);
        } else {
          order = orderMap.get(row.order_id);
        }

        if (row.order_item_id) {
          order.items.push({
            orderItemId: row.order_item_id,
            merchId: row.order_merchid,
            quantity: row.quantity,
            subtotal: row.subtotal
          });
        }
      }
    });

    return res.status(200).json(user);
  });
};

// 7) DELETE
module.exports.deleteUser = (req, res, next) => {
  const user_id = req.params.user_id

  const data = {
    user_id: user_id
  };

  usersModel.deleteUser(data, (error, results) => {
    if (error) {
      // console.log(results)
      return res.status(500);
    } else {
      // console.log(results)
      const deletedValue = results?.rows?.[0]?.deleteuser;

      if (deletedValue == 0) {
        return res.status(404).json({
          message: `User ${user_id} not found.`,
          success: false
        });
      }

      return res.status(200).json({
        "message": "User " + user_id + " Successfully deleted.",
        "success": true
      })
    }
  });
};

// get tier for user
module.exports.getUserTier = (req, res, next) => {
  const user_id = parseInt(req.body.user_id);

  if (!user_id) {
    return res.status(400).json({ message: "User ID is required" });
  }

  const data = { user_id };

  usersModel.gettingUserTier(data, (error, result) => {
    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }

    const rows = result.rows[0];

    if (!rows || rows.length === 0) {
      return res.status(404).json({ message: "Tier not found" });
    }

    return res.status(200).json(rows.tierId);
  });
};

// 1) POST 
module.exports.register = (req, res, next) => {
  const { username, firstName, lastName, email } = req.body;
  // bcryptMiddleware.hashPassword already ran and put the hash in res.locals.hash
  const passwordHash = res.locals.hash;

  if (!username || !email || !passwordHash) return res.sendStatus(400);

  const data = { username, firstName, lastName, email, password: passwordHash };

  usersModel.insertUser(data, (err, result) => {
    if (err) {
      if (err.code === '23505') {
        const field = err.constraint?.includes('email') ? 'Email'
          : err.constraint?.includes('username') ? 'Username' : 'Field';
        return res.status(409).json({ success: false, message: `${field} already exists` });
      }
      console.error('DB insert error:', err);
      return res.status(500).json({ success: false, message: 'Server error' });
    }

    const row = result.rows?.[0];
    if (!row) return res.status(500).json({ success: false, message: 'No result returned' });

    // If function says failure, return 400/409; don't generate JWT
    if (!row.success) {
      const status = /exists/i.test(row.message) ? 409
        : /invalid email/i.test(row.message) ? 400
          : 400;
      return res.status(status).json({ success: false, message: row.message });
    }

    // Success: hand off to JWT
    res.locals.userId = row.user_id;          // ← IMPORTANT: use user_id, not insertId
    res.locals.message = row.message || 'OK';
    return next();
  });
};

// 2) 
module.exports.login = (req, res, next) => {
  const identifier = req.body.identifier || req.body.username || req.body.email;
  const { password } = req.body;

  if (!identifier || !password) {
    return res.status(400).json({ message: "Username/Email and Password are required." });
  }

  usersModel.login({ identifier }, (error, result) => {
    if (error) {
      console.error("DB login error:", error);
      return res.status(500).json({ message: "Server error" });
    }

    const row = result?.rows?.[0];
    if (!row) {
      // Don’t reveal which field failed
      return res.status(401).json({ message: "Invalid username/email or password." });
    }

    // store hash for bcrypt comparison
    res.locals.userId = row.userId;
    res.locals.hash = row.password;
    res.locals.role = row.role;
    next(); // → bcryptMiddleware.comparePassword → jwtMiddleware.generateToken → jwtMiddleware.sendToken
  });
};

module.exports.updateProfilePic = function (req, res) {
  const userId = parseInt(req.params.id);

  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const imageUrl = req.file.path;

  usersModel.updateProfilePic({ userId, imageUrl }, function (error, results) {
    if (error) {
      console.error(error);

      // Check for Cloudinary file-size error
      if (error.http_code === 400 && error.message.includes("File size too large")) {
        return res.status(413).json({
          message: "File is too large. Maximum allowed size is 10MB.",
        });
      }

      return res.status(500).json({ message: "Upload failed" });
    }

    return res.status(200).json({
      message: "Profile picture updated",
      imageUrl: results.imageUrl,
    });
  });
};



module.exports.testDeleteUserByEmail = (req, res) => {
  if (process.env.NODE_ENV === "production") {
    return res.status(403).json({ ok: false, message: "Forbidden" });
  }

  const { email } = req.body;
  if (!email) return res.status(400).json({ ok: false, message: "email required" });

  usersModel.findUserIdByEmail({ email }, async (err, result) => {
    if (err) return res.status(500).json({ ok: false, message: err.message });

    const row = result?.rows?.[0];
    if (!row) return res.status(200).json({ ok: true, deleted: false });

    try {
      await usersModel.hardDeleteUserById(row.userId);
      return res.status(200).json({ ok: true, deleted: true });
    } catch (e) {
      console.error("hardDeleteUserById failed:", e);
      return res.status(500).json({
        ok: false,
        message: e.message,
        code: e.code,
        detail: e.detail,
        constraint: e.constraint,
      });
    }
  });
};


