const express = require('express');
const router = express.Router();

const usersManagementController = require('../controllers/usersManagementController');
const bcryptMiddleware = require('../middlewares/bcryptMiddleware');

router.get('/', usersManagementController.getAllUsers); // GET users
router.put('/:userId', 
    bcryptMiddleware.hashPasswordOnEdit, 
    usersManagementController.updateUser); // PUT users/:userId
router.delete('/:userId', usersManagementController.deleteUserById); // DELETE users/:userId

module.exports = router;


