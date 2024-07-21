const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const StudentModel = require("../models/Students");
require("dotenv").config();
passport.use(
  new GoogleStrategy(
    {
      clientID:
      process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "https://reactlvbackend.onrender.com/auth/google/callback",
    },
    (accessToken, refreshToken, profile, done) => {
      console.log();
      StudentModel.findOne({ googleId: profile.id }).then((existingUser) => {
        if (existingUser) {
          done(null, existingUser);
        } else {
          new StudentModel({
            googleId: profile.id,
            name: profile.displayName,
            email: profile.emails[0].value,
            image: profile.photos[0].value,
          })
            .save()
            .then((user) => done(null, user));
        }
      });
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  StudentModel.findById(id).then((user) => {
    done(null, user);
  });
});
