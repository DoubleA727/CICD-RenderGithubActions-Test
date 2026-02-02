const usersManagementModel = require('../models/usersManagementModel');
const usersModel = require('../models/usersModel');

// GET /users
module.exports.getAllUsers = (req, res) => {
  usersManagementModel.getAllUsers((error, result) => {
    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }

    const rows = result?.rows || [];

    const users = rows.map(row => ({
      userId: row.userid,
      username: row.username,
      firstName: row.firstname,
      lastName: row.lastname,
      email: row.email,
      imageUrl: row.imageurl,
      role: row.role,
      createdAt: row.createdat
    }));

    return res.status(200).json(users);
  });
};

// UPDATE /users
module.exports.updateUser = (req, res) => {
  const { userId } = req.params;

  const {
    username,
    firstName,
    lastName,
    email,
    role,
    password
  } = req.body;

  usersManagementModel.updateUserById(
    userId,
    { username, firstName, lastName, email, role, password },
    (error, result) => {
      if (error) {
        console.error("Database error:", error);
        return res.status(500).json({ message: "Internal server error" });
      }

      if (result.rowCount === 0) {
        return res.status(404).json({
          message: "User not found or no updates applied"
        });
      }

      return res.status(200).json({
        message: "User updated successfully"
      });
    }
  );
};


// DELETE /users/:userId  (soft delete)
module.exports.deleteUserById = (req, res) => {
  const { userId } = req.params;

  usersManagementModel.softDeleteUserById(userId, (error, result) => {
    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }

    if (result.rowCount === 0) {
      return res.status(404).json({
        message: "User not found or already deleted"
      });
    }

    return res.status(200).json({
      message: "User deleted successfully"
    });
  });
};
