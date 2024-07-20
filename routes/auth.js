const express = require("express");
const passport = require("passport");
const router = express.Router();

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

// router.get(
//   "/google/callback",
//   passport.authenticate("google", { failureRedirect: "/" }),
//   (req, res) => {
//     res.redirect("http://localhost:3000/");
//   }
// );

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  async (req, res) => {
    // This callback function is executed after successful authentication
    try {
      const { id, displayName, emails, photos } = req.user;

      const email = emails[0].value;
      const name = displayName;
      const image = photos[0].value;

      // Find the user by email and update the document if it exists
      const updatedUser = await User.findOneAndUpdate(
        { email },
        { name, email, image }, // Fields to update
        { new: true, upsert: true, setDefaultsOnInsert: true } // Options: create if doesn't exist
      );

      // Save the updated or new user to the request session
      req.user = updatedUser;
      
      // Redirect to the home page
      res.redirect("http://localhost:3000/");
    } catch (error) {
      console.error("Error processing Google callback:", error);
      res.redirect("/"); // Redirect to the home page in case of an error
    }
  }
);
router.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect("/");
  });
});

router.get("/current_user", (req, res) => {
  res.send(req.user);
});

module.exports = router;
