const express = require('express');
const router = express.Router();

const adminRoute = require('./adminRoute');
const usersRoute = require('./usersRoute');
const ccaRoute = require('./ccaRoute');
const merchRoute = require('./merchRoute');
const orderRoute = require('./orderRoute');
const reviewRoute = require('./reviewRoute');
const checkoutRoute = require('./checkoutRoute');
const aiRoute = require("./aiRoute");
const authRoute = require('./authRoute')
const usersManagementRoute = require('./usersManagementRoute');
const ordersManagementRoute = require('./ordersManagementRoute');
const leaderboardRoute = require('./leaderboardRoute');

const usersController = require('../controllers/usersController');

const bcryptMiddleware = require('../middlewares/bcryptMiddleware');
const jwtMiddleware = require('../middlewares/jwtMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');

// Register
router.post("/register",
  // usersController.checkUsernameOrEmailExist, 
  bcryptMiddleware.hashPassword,
  usersController.register,
  jwtMiddleware.generateToken,
  jwtMiddleware.sendToken
);

// Login
router.post("/login",
  usersController.login,
  bcryptMiddleware.comparePassword,
  jwtMiddleware.generateToken,
  jwtMiddleware.sendToken
);

// Admin
router.get("/admin/stats",
  jwtMiddleware.verifyToken,
  adminMiddleware.verifyAdmin,
  (req, res) => {
    res.json({ secretAdminData: true });
  }
);

router.use("/admin", 
  jwtMiddleware.verifyToken,
  adminMiddleware.verifyAdmin,
  adminRoute
);

// Admin - Users Management
router.use("/admin/users",
  jwtMiddleware.verifyToken,
  adminMiddleware.verifyAdmin,
  usersManagementRoute
);

// Admin - Orders Management
router.use('/admin/orders',
  jwtMiddleware.verifyToken,
  adminMiddleware.verifyAdmin,
  ordersManagementRoute
)

router.use("/users", usersRoute);
router.use("/CCA", ccaRoute);
router.use("/merch", merchRoute);
router.use("/reviews", reviewRoute);
router.use("/checkout", checkoutRoute);
router.use ("/ai", aiRoute);
router.use("/auth", authRoute);
router.use("/leaderboard", leaderboardRoute);

// cart routes
router.use("/order", orderRoute);

module.exports = router;