const express = require('express');
const router = express.Router();

const uploadProfilePic = require("../middlewares/cloudinaryProfilePicMulter");

const usersController = require('../controllers/usersController');
const bcryptMiddleware = require('../middlewares/bcryptMiddleware')

// PUT /users/:user_id
router.put('/:user_id',
    bcryptMiddleware.hashPasswordOnEdit,
    usersController.updateUserById
);

// get user tier
router.post('/getUserTier',
    usersController.getUserTier
);

// Get a specific user
router.get('/:user_id',
    usersController.getUserById
);

//deleting user
router.delete('/:user_id',
    usersController.deleteUser
);

// POST /:id/profile-pic
router.post("/:id/profile-pic", uploadProfilePic.single("profilePic"), usersController.updateProfilePic);

// testing
router.post("/test/delete-user", usersController.testDeleteUserByEmail);

module.exports = router;
