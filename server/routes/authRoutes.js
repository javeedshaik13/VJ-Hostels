const express = require('express');
const passport = require('passport');
const router = express.Router();

const jwt = require("jsonwebtoken");

function generateJwt(user) {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role || "admin"
    },
    process.env.JWT_SECRET, 
    { expiresIn: "1h" }
  );
}

module.exports = generateJwt;


// Student Google OAuth
router.get('/google', 
    passport.authenticate('google-student', { scope: ['profile', 'email'] })
);

router.get('/student/callback', 
    passport.authenticate('google-student', { failureRedirect: 'http://localhost:5173/login' }),
    (req, res) => {
        // Redirect student to frontend home page after login
        res.redirect('http://localhost:5173/home');
    }
);


// Admin Google OAuth
router.get('/google/admin', 
    passport.authenticate('google-admin', { scope: ['profile', 'email'] })
);

router.get('/admin/callback', 
    passport.authenticate('google-admin', { failureRedirect: 'http://localhost:5173/login' }),
    (req, res) => {

         const jwt = generateJwt(req.user);

        // Redirect admin to frontend dashboard after login
        res.redirect(`http://localhost:5173/auth/callback?token=${jwt}&admin=${req.user.email}`);
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
