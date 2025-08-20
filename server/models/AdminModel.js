const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const adminSchema = new mongoose.Schema({
    googleId: { 
        type: String, 
        unique: true, 
        sparse: true },
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: function () {
    return !this.googleId;  // only required if no Google login
  }
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    role: {
        type: String,
        default: 'admin'
    }
}, { timestamps: true });

// Hash password before saving
adminSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

const AdminModel = mongoose.model('Admin', adminSchema);

module.exports = AdminModel;
