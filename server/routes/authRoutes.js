const express = require('express');
const passport = require('passport');
const router = express.Router();
const jwt = require("jsonwebtoken");

function generateJwt(user) {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role || "student"
    },
    process.env.JWT_SECRET, 
    { expiresIn: "1h" }
  );
}


// Student Google OAuth
router.get('/google', 
    passport.authenticate('google-student', { scope: ['profile', 'email'] })
);

router.get(
  '/student/callback',
  (req, res, next) => {
    passport.authenticate('google-student', (err, user, info) => {
      if (err) {
        console.error("Authentication error:", err);
        return res.redirect(`${process.env.CLIENT_URL}/login?error=auth_failed`);
      }

      if (!user) {
        console.log("No user found or unauthorized email");
        return res.redirect(`${process.env.CLIENT_URL}/login?error=unauthorized`);
      }

      req.logIn(user, (err) => {
        if (err) {
          console.error("Login error:", err);
          return res.redirect(`${process.env.CLIENT_URL}/login?error=login_failed`);
        }

        console.log("Successful login for user:", user);
        const token = generateJwt(user);

        // Redirect with token as URL parameter for frontend to handle
        return res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${token}`);
      });
    })(req, res, next);
  }
);


// Logout route
router.get('/logout', (req, res) => {
    req.logout(err => {
        if(err) return next(err);
        res.redirect('/');
    })
})

module.exports = router;
