const express = require('express');
const app = express();
const studentRoutes = require('./routes/studentRoutes');

// ...existing middleware and route registrations...

app.use('/student-api', studentRoutes);

// ...existing error handling and server start logic...