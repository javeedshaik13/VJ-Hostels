const asyncHandler = require('express-async-handler');

// MongoDB models
const FoodPause = require('../models/FoodPause');
const Student = require('../models/StudentModel');

// POST /pause
const pauseFood = asyncHandler(async (req, res) => {
    const { studentId, pause_from, pause_meals, resume_from, resume_meals } = req.body;
    
    if (!studentId || !pause_from || !resume_from) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    // Time restriction: Students must make changes before 6 PM today for tomorrow's meals
    const now = new Date();
    const today = now.toISOString().slice(0, 10);
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const currentHour = now.getHours();
    
    // If they're trying to pause tomorrow's meals and it's after 6 PM today
    if (pause_from === tomorrow && currentHour >= 18) {
        return res.status(400).json({ 
            error: 'Deadline passed: Changes for tomorrow must be made before 6:00 PM today',
            deadline: '6:00 PM',
            currentTime: now.toLocaleTimeString('en-US', { hour12: true })
        });
    }

    // If they're trying to pause today's meals and it's after 6 PM
    if (pause_from === today && currentHour >= 18) {
        return res.status(400).json({ 
            error: 'Too late: Cannot modify today\'s meals after 6:00 PM',
            deadline: '6:00 PM',
            currentTime: now.toLocaleTimeString('en-US', { hour12: true })
        });
    }

    // Check if a pause record exists for this student and is still editable (future date)
    const existing = await FoodPause.findOne({ 
        student_id: studentId,
        pause_from: { $gt: today }
    }).sort({ createdAt: -1 });

    if (existing) {
        // Update both pause and resume fields
        existing.pause_from = pause_from;
        existing.pause_meals = pause_meals;
        existing.resume_from = resume_from || null;
        existing.resume_meals = resume_meals || null;
        await existing.save();
        
        res.status(200).json({ message: 'Food pause/resume updated successfully' });
    } else {
        // Insert new record
        const newPause = new FoodPause({
            student_id: studentId,
            pause_from,
            pause_meals,
            resume_from: resume_from || null,
            resume_meals: resume_meals || null
        });
        await newPause.save();
        
        res.status(200).json({ message: 'Food paused successfully' });
    }
});

// POST /resume
const resumeFood = asyncHandler(async (req, res) => {
    const { studentId, resume_from, resume_meals } = req.body;
    
    if (!studentId || !resume_from || !resume_meals) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    // Find the latest pause record for this student
    const pause = await FoodPause.findOne({ student_id: studentId }).sort({ createdAt: -1 });
    
    if (!pause) {
        return res.status(404).json({ error: 'No pause record found for this student' });
    }

    pause.resume_from = resume_from;
    pause.resume_meals = resume_meals;
    await pause.save();
    
    res.status(200).json({ message: 'Food resumed successfully' });
});

// GET /food-count
const getFoodCount = asyncHandler(async (req, res) => {
    const { date, hostelId } = req.query;
    
    if (!date || !hostelId) {
        return res.status(400).json({ error: 'Missing date or hostelId' });
    }

    const FoodCount = require('../models/FoodCount');
    const counts = await FoodCount.findOne({ hostel_id: hostelId, date });
    
    res.status(200).json(counts || {});
});

module.exports = {
    pauseFood,
    resumeFood,
    getFoodCount
};
