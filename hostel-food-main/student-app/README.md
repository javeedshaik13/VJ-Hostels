# Student Food Management App

This is the student application for the Hostel Food Management System. The application allows students to manage their food preferences by pausing and resuming their food service during holidays or breaks.

## Features

- **User Authentication**: Students can log in using their college email ID via Google OAuth2.
- **Pause Food Service**: Students can pause their food service 24 hours in advance.
- **Resume Food Service**: Students can resume their food service after the holiday break.
- **Food Consumption Selection**: Students can select which meals they will consume on specific dates.

## Project Structure

- **public/index.html**: Main HTML entry point for the student application.
- **src/components**: Contains reusable React components.
- **src/pages**: Contains different pages such as login, pause/resume food page, etc.
- **src/services**: Handles API calls and business logic.
- **src/App.tsx**: Main component for routing and global state management.
- **src/index.tsx**: Entry point for rendering the application.

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   ```
2. Navigate to the student-app directory:
   ```
   cd student-app
   ```
3. Install dependencies:
   ```
   npm install
   ```

## Usage

To start the application, run:
```
npm start
```

The application will be available at `http://localhost:3000`.

## Future Enhancements

- Implement validation checks to ensure that only active students can take food.
- Add notifications for students regarding their food status.
- Enhance the user interface for better user experience.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.