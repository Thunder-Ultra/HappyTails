require("dotenv").config({
  path: "./googleClientCredintials.env",
  quiet: true,
});
const passport = require("passport");
const { Strategy: GoogleStrategy } = require("passport-google-oauth20");

function setupPassport(app) {
  app.use(passport.initialize());
  app.use(passport.session());

  // Configure Google Strategy
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        callbackURL: "/auth/google/callback",
      },
      (accessToken, refreshToken, profile, done) => {
        // console.log("accessToken", accessToken);
        // console.log("refreshToken", refreshToken);
        // console.log("profile", profile);
        // Called after google verifies the user
        return done(null, profile);
      }
    )
  );

  passport.serializeUser((user, done) => done(null, user));
  passport.deserializeUser((obj, done) => done(null, obj));
}

module.exports = setupPassport;
