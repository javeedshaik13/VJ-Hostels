# Hostel Food Management App - Backend

## Overview
The Hostel Food Management App is designed to streamline the food service process for students residing in hostels. This backend service manages the food pause/resume functionality for students and provides warden access to view food counts for each meal.

## Features
- **Student Functionality**: 
  - Students can pause and resume their food service.
  - Students can specify which meals they will consume upon resuming.

- **Warden Functionality**: 
  - Wardens can view the food count for breakfast, lunch, evening snacks, and dinner for their respective hostels.

## Project Structure
The backend is structured as follows:

```
backend
├── src
│   ├── controllers      # Handles incoming requests and responses
│   ├── models           # Defines data structures and database interactions
│   ├── routes           # Defines API endpoints
│   ├── services         # Contains business logic and data processing
│   ├── utils            # Utility functions and helpers
│   └── index.ts        # Entry point for the backend application
├── package.json         # NPM configuration file
├── tsconfig.json        # TypeScript configuration file
└── README.md            # Documentation for the backend
```

## Setup Instructions
1. **Clone the Repository**:
   ```
   git clone <repository-url>
   cd hostel-food-management-app/backend
   ```

2. **Install Dependencies**:
   ```
   npm install
   ```

   ```
   npm install --legacy-peer-deps
   ```

3. **Run the Application**:
   ```
   npm start
   ```

4. **Access the API**:
   The backend API will be available at `http://localhost:3000` (or the port specified in your configuration).

## Database Setup (SQLite)

### 1. Create Tables
Run the following command in your terminal to create all tables:

```
sqlite3 hostel_food.db < schema.sql
```

### 2. Insert Example Data
To add some sample data, run:

```
sqlite3 hostel_food.db < seed.sql
```

### 3. Open and Inspect the Database
You can open the database and run queries interactively:

```
sqlite3 hostel_food.db
```

### 4. Example: List All Students
Once inside the SQLite prompt, run:

```
SELECT * FROM students;
```

---

- `schema.sql` contains the table definitions.
- `seed.sql` contains example data for quick testing.

## Future Enhancements
- Implement validation checks to ensure that only active students can access food services.
- Enhance the pause/resume functionality with notifications for students and wardens.
- Integrate a databasea for persistent data storage.

## Contributing
Contributions are welcome! Please submit a pull request or open an issue for any enhancements or bug fixes.

## License
This project is licensed under the MIT License.