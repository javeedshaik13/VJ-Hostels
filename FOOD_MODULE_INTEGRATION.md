# Food Module Integration Guide

## Overview
The hostel food management system has been successfully integrated into the VJ-Hostels project. This integration includes backend APIs, admin management features, and student food service management.

## Integration Summary

### Backend Integration (Server)
- **Controllers**: Added food-related controllers for managing food pauses, counts, student authentication, and warden login
- **Models**: Created MongoDB models for FoodPause, FoodCount, and Warden
- **Routes**: Integrated food API routes under `/food-api` endpoint
- **Dependencies**: Added required packages like `csv-parser` and `google-auth-library`

### Admin Client Integration
- **FoodCountManager**: Component for managing daily/weekly food counts with charts
- **StudentFoodManager**: Component for managing student food pause statuses and filters
- **Enhanced Food Page**: Added new tabs for food count and student management

### Student Client Integration
- **FoodPauseManager**: Multi-step form for students to pause/resume food service
- **FoodScheduleViewer**: Weekly meal schedule display with pause status
- **Enhanced Food Component**: Added new tabs for meal schedule and pause service management

## API Endpoints

### Food Management
- `POST /food-api/pause` - Pause food service for a student
- `POST /food-api/resume` - Resume food service for a student
- `GET /food-api/count/:date/:hostelId` - Get food count for specific date and hostel
- `POST /food-api/calculate-count` - Calculate and update food count

### Authentication
- `POST /food-api/student/google-oauth` - Student Google OAuth
- `GET /food-api/students/:hostelId` - Get students by hostel
- `POST /food-api/warden/login` - Warden login
- `POST /food-api/warden/bcrypt-login` - Warden bcrypt login

## Database Schema

### FoodPause Model
```javascript
{
  student_id: ObjectId,
  pause_from: Date,
  pause_meals: [String], // ['breakfast', 'lunch', 'snacks', 'dinner']
  resume_from: Date,
  resume_meals: [String],
  timestamps: true
}
```

### FoodCount Model
```javascript
{
  hostel_id: ObjectId,
  date: Date,
  breakfast_count: Number,
  lunch_count: Number,
  snacks_count: Number,
  dinner_count: Number,
  timestamps: true
}
```

### Warden Model
```javascript
{
  username: String,
  name: String,
  email: String,
  password_hash: String,
  hostel_id: ObjectId,
  phone: String,
  is_active: Boolean,
  timestamps: true
}
```

## Features

### For Students
- View today's menu and submit feedback
- View weekly meal schedule with pause status
- Pause/resume food service with date and meal selection
- Multi-step form for service management

### For Admins/Wardens
- Manage daily and weekly food counts
- View food count analytics with charts
- Filter and manage student food pause statuses
- Export food count data

## Setup Instructions

1. **Install Dependencies**:
   ```bash
   # Server
   cd server && npm install
   
   # Student Client
   cd student-client && npm install
   
   # Admin Client
   cd admin-client && npm install
   ```

2. **Environment Variables**: Ensure your `.env` file includes:
   ```
   MONGODB_URI=your_mongodb_connection_string
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   CLIENT_URL=http://localhost:5173
   ADMIN_CLIENT_URL=http://localhost:5174
   ```

3. **Start Services**:
   ```bash
   # Start server (port 4000)
   cd server && npm start
   
   # Start student client (port 5173)
   cd student-client && npm run dev
   
   # Start admin client (port 5174)
   cd admin-client && npm run dev
   ```

## Migration Notes

- Converted from SQLite to MongoDB for consistency
- Adapted TypeScript controllers to JavaScript
- Integrated OAuth flows with existing authentication
- Maintained existing UI/UX patterns
- Added proper error handling and validation

## Testing

Test the following functionality:
1. Student food pause/resume workflow
2. Admin food count management
3. Student meal schedule viewing
4. Warden authentication and management
5. Food count calculations and analytics

## Cleanup

The original `hostel-food-main` directory can be safely removed after confirming all functionality works correctly.
