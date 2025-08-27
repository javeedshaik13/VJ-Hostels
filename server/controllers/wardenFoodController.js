const asyncHandler = require('express-async-handler');
const bcrypt = require('bcrypt');

// MongoDB models
const Warden = require('../models/Warden');
const Hostel = require('../models/Hostel');

const wardenLogin = asyncHandler(async (req, res) => {
    const { username, password } = req.body;
    console.log('Login attempt:', { username, password });

    if (!username || !password) {
        console.log('Missing username or password');
        return res.status(400).json({ error: 'Username and password required.' });
    }

    console.log('Database connection established');

    // Get warden with their associated hostel information
    const warden = await Warden.findOne({ username }).populate('hostel_id');

    if (!warden) {
        console.log(`No warden found for username: ${username}`);
        return res.status(401).json({ error: 'Invalid username or password.' });
    }

    console.log('Warden found:', warden);

    // Plain text password comparison (for development - should use bcrypt in production)
    if (password === warden.password_hash) {
        console.log(`Password match for user: ${username}`);
        const { password_hash, ...wardenInfo } = warden.toObject();
        return res.json({ 
            success: true, 
            warden: {
                ...wardenInfo,
                hostel_id: warden.hostel_id?._id,
                hostel_name: warden.hostel_id?.name
            }, 
            token: 'dummy-token' 
        });
    } else {
        console.log(`Password mismatch for user: ${username}`);
        return res.status(401).json({ error: 'Invalid username or password.' });
    }
});

const wardenLoginUsingBcrypt = asyncHandler(async (req, res) => {
    const { username, password } = req.body;
    console.log('Login attempt:', { username, password });

    if (!username || !password) {
        console.log('Missing username or password');
        return res.status(400).json({ error: 'Username and password required.' });
    }

    console.log('Database connection established');

    // Get warden with their associated hostel information
    const warden = await Warden.findOne({ username }).populate('hostel_id');

    if (!warden) {
        console.log(`No warden found for username: ${username}`);
        return res.status(401).json({ error: 'Invalid username or password.' });
    }

    console.log(`Warden found:`, warden);

    // Here, bcrypt compares the entered password with the stored password hash
    const valid = await bcrypt.compare(password, warden.password_hash);
    console.log('Password match result:', valid);

    if (!valid) {
        console.log(`Password mismatch for user: ${username}`);
        return res.status(401).json({ error: 'Invalid username or password.' });
    }

    const { password_hash, ...wardenInfo } = warden.toObject();
    console.log(`Login successful for user: ${username}`);
    return res.json({ 
        success: true, 
        warden: {
            ...wardenInfo,
            hostel_id: warden.hostel_id?._id,
            hostel_name: warden.hostel_id?.name
        }, 
        token: 'dummy-token' 
    });
});

module.exports = {
    wardenLogin,
    wardenLoginUsingBcrypt
};
