const express = require("express");
const passport = require("passport");
const oauthController = require("../controllers/oauthController");

const router = express.Router();

// Google OAuth start
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);

// Google callback
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${process.env.CLIENT_URL}/login.html#oauthError=google_failed`,
    session: false,
  }),
  oauthController.oauthCallback
);

module.exports = router;
