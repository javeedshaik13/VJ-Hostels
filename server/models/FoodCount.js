const mongoose = require('mongoose');

const foodCountSchema = new mongoose.Schema({
    hostel_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hostel',
        required: true
    },
    date: {
        type: String, // Date in YYYY-MM-DD format
        required: true
    },
    breakfast_count: {
        type: Number,
        default: 0
    },
    lunch_count: {
        type: Number,
        default: 0
    },
    snacks_count: {
        type: Number,
        default: 0
    },
    dinner_count: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Create compound index for hostel_id and date
foodCountSchema.index({ hostel_id: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('FoodCount', foodCountSchema);
