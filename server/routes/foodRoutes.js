const express = require('express');
const router = express.Router();

const { pauseFood, resumeFood, getFoodCount } = require('../controllers/foodController');
const { calculateAndUpdateFoodCount } = require('../controllers/foodCountController');
const { googleOAuth, getStudentsByHostel } = require('../controllers/studentFoodController');
const { wardenLogin, wardenLoginUsingBcrypt } = require('../controllers/wardenFoodController');

// Food pause/resume routes
router.post('/pause', pauseFood);
router.post('/resume', resumeFood);
router.get('/food-count', getFoodCount);

// Food count calculation routes
router.post('/food-count/calculate', calculateAndUpdateFoodCount);

// Student authentication and management routes
router.post('/student/oauth', googleOAuth);
router.get('/students/:hostelId', getStudentsByHostel);

// Warden authentication routes
router.post('/warden/login', wardenLogin);
router.post('/warden/login-bcrypt', wardenLoginUsingBcrypt);

module.exports = router;
