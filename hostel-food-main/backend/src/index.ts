import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import foodRoutes from './routes/foodRoutes';
import foodCountRoutes from './routes/foodCountRoutes';
import studentRoutes from './routes/studentRoutes';
import studentStatusRoutes from './routes/studentStatusRoutes';
import wardenRoutes from './routes/wardenRoutes';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api', foodRoutes);
app.use('/api/food-count', foodCountRoutes);
app.use('/api/student', studentRoutes); // Keep student OAuth route for student app
app.use('/api/students', studentRoutes); // Add students route for warden app  
app.use('/api/student-status', studentStatusRoutes);
app.use('/api/warden', wardenRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});