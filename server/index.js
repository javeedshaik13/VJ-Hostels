const express = require('express');
const app = express();
const studentRoutes = require('./routes/studentRoutes');
const authRoutes = require('./routes/authRoutes');

// ...existing middleware and route registrations...

app.use('/student-api', studentRoutes);
app.use('/auth', authRoutes);

// ...existing error handling and server start logic...