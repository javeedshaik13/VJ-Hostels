const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const Student = require('../models/StudentModel.js');
const Admin = require('../models/AdminModel.js');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
}, async (accessToken, refreshToken, profile, done) => {
    console.log('Google email:', profile.emails?.[0]?.value);
    try {
        // Only allow emails from @vnrvjiet.in
        const email = profile.emails[0].value;
        // if (!email.endsWith('@vnrvjiet.in')) {
        //     return done(null, false, { message: 'Only institutional emails allowed' });
        // }

        // Check if user exists as Student
        let user = await Student.findOne({ googleId: profile.id });
        if (!user) {
            // Or check if exists as Admin
            user = await Admin.findOne({ googleId: profile.id });
        }

        // If not found, create a new Student by default
        if (!user) {
            user = await Student.create({
                googleId: profile.id,
                username: profile.displayName, 
                name: profile.displayName,
                email: email,
                password: 'N/A', 
                rollNumber: 'N/A', 
                phoneNumber: 'N/A',
                parentMobileNumber: 'N/A',
            });
        }

        return done(null, user);
    } catch (err) {
        return done(err, null);
    }
}));


passport.serializeUser((user, done) => {
  done(null, user.id); // store only the MongoDB ID in the session
});

passport.deserializeUser(async (id, done) => {
  try {
    // Try finding in Student first
    let user = await Student.findById(id);
    if (!user) {
      user = await Admin.findById(id);
    }
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});
