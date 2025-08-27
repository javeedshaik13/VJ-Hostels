# Hostel Food Management App

## Overview
The Hostel Food Management App is designed to streamline the food service process for students residing in hostels. It allows students to manage their food preferences during holidays and provides wardens with the ability to monitor food counts effectively.

## Project Structure
The project consists of three main components:
- **Student App**: A React-based application for students to manage their food preferences.
- **Warden App**: A React-based application for wardens to view food counts and manage hostel operations.
- **Backend**: A Node.js-based backend that handles API requests and data management.

## Features
- **Student App**:
  - Login using college email (Google OAuth2).
  - Pause and resume food service with a 24-hour notice.
  - Select food preferences for each meal.
  
- **Warden App**:
  - Login with custom username and password.
  - View food counts for breakfast, lunch, evening snacks, and dinner.

## Setup Instructions
1. **Clone the repository**:
   ```
   git clone <repository-url>
   cd hostel-food-management-app
   ```

2. **Install dependencies**:
   - For the student app:
     ```
     cd student-app
     npm install
     ```
   - For the warden app:
     ```
     cd warden-app
     npm install
     ```
   - For the backend:
     ```
     cd backend
     npm install
     ```

3. **Run the applications**:
   - Start the backend server:
     ```
     cd backend
     npm start
     ```
   - Start the student app:
     ```
     cd student-app
     npm start
     ```
   - Start the warden app:
     ```
     cd warden-app
     npm start
     ```

## Technologies Used
- **Frontend**: React, TypeScript
- **Backend**: Node.js, Express
- **Database**: (Specify the database used, e.g., MongoDB, PostgreSQL)

## Future Enhancements
- Implement validation checks for food consumption to prevent unauthorized access.
- Enhance user experience with better UI/UX design.
- Add notification features for students regarding their food status.

## Contributing
Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License
This project is licensed under the MIT License.