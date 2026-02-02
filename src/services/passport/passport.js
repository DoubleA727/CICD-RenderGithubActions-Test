const GoogleStrategy = require("passport-google-oauth20").Strategy;

module.exports = function configurePassport(passport) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
      },
      (accessToken, refreshToken, profile, done) => {
        const email = profile.emails?.[0]?.value || null;

        return done(null, {
          provider: "google",
          providerUserId: profile.id,
          email,
          firstName: profile.name?.givenName || "",
          lastName: profile.name?.familyName || "",
          displayName: profile.displayName || "",
        });
      }
    )
  );
};
