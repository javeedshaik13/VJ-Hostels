const asyncHandler = require('express-async-handler');

// MongoDB models
const FoodCount = require('../models/FoodCount');
const FoodPause = require('../models/FoodPause');
const Student = require('../models/StudentModel');

// POST /food-count/calculate
const calculateAndUpdateFoodCount = asyncHandler(async (req, res) => {
    const { date, hostelId } = req.body;
    
    if (!date || !hostelId) {
        return res.status(400).json({ error: 'Missing date or hostelId' });
    }

    // Get all students in the hostel
    const students = await Student.find({ hostel_id: hostelId });
    
    let breakfast = 0, lunch = 0, snacks = 0, dinner = 0;

    for (const student of students) {
        // Get the latest pause record for this student before or on the date
        const pause = await FoodPause.findOne({ 
            student_id: student._id,
            pause_from: { $lte: date }
        }).sort({ pause_from: -1 });

        if (!pause || !pause.pause_from) {
            // No pause entry: all meals counted
            breakfast++;
            lunch++;
            snacks++;
            dinner++;
            continue;
        }

        const pauseDate = pause.pause_from;
        const resumeDate = pause.resume_from;
        const pausedMeals = (pause.pause_meals || '').split(',').map(m => m.trim()).filter(Boolean);
        const resumedMeals = (pause.resume_meals || '').split(',').map(m => m.trim()).filter(Boolean);

        if (date < pauseDate) {
            // Before pause: all meals counted
            breakfast++;
            lunch++;
            snacks++;
            dinner++;
        } else if (date === pauseDate) {
            // On last day (pause date): only selected meals counted
            if (pausedMeals.includes('breakfast')) breakfast++;
            if (pausedMeals.includes('lunch')) lunch++;
            if (pausedMeals.includes('snacks')) snacks++;
            if (pausedMeals.includes('dinner')) dinner++;
        } else if (resumeDate && date > pauseDate && date < resumeDate) {
            // Between pause+1 and resume-1: no meals counted (away from hostel)
            // Do nothing
        } else if (resumeDate && date === resumeDate) {
            // On return day (resume date): only selected meals counted
            if (resumedMeals.includes('breakfast')) breakfast++;
            if (resumedMeals.includes('lunch')) lunch++;
            if (resumedMeals.includes('snacks')) snacks++;
            if (resumedMeals.includes('dinner')) dinner++;
        } else if (resumeDate && date > resumeDate) {
            // After resume: all meals counted
            breakfast++;
            lunch++;
            snacks++;
            dinner++;
        } else if (!resumeDate && date > pauseDate) {
            // Paused indefinitely after pause date: no meals counted
            // Do nothing
        }
    }

    // Upsert into food_counts
    const foodCount = await FoodCount.findOneAndUpdate(
        { hostel_id: hostelId, date },
        {
            breakfast_count: breakfast,
            lunch_count: lunch,
            snacks_count: snacks,
            dinner_count: dinner
        },
        { upsert: true, new: true }
    );

    res.status(200).json({ breakfast, lunch, snacks, dinner });
});

module.exports = {
    calculateAndUpdateFoodCount
};
