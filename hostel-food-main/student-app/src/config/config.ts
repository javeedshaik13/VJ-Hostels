// Environment configuration for the Student App
interface Config {
  apiBaseUrl: string;
  environment: string;
  appName: string;
  debug: boolean;
}

const getConfig = (): Config => {
  // Default to local environment
  let config: Config = {
    apiBaseUrl: process.env.REACT_APP_API_BASE_URL || 'http://localhost:6201/api',
    environment: process.env.REACT_APP_ENVIRONMENT || process.env.NODE_ENV || 'local',
    appName: process.env.REACT_APP_APP_NAME || 'Hostel Food Management - Student Portal',
    debug: process.env.REACT_APP_DEBUG === 'true' || process.env.NODE_ENV === 'development',
  };

  // Override with environment-specific settings if REACT_APP_ENV is set
  const envOverride = process.env.REACT_APP_ENV;
  
  if (envOverride === 'qa') {
    config = {
      ...config,
      apiBaseUrl: 'https://dev-hostel.vjstartup.com/be/api',
      environment: 'qa',
      appName: 'Hostel Food Management - Student Portal (QA)',
      debug: true,
    };
  } else if (envOverride === 'production') {
    config = {
      ...config,
      apiBaseUrl: 'https://hostel.vjstartup.com/be/api',
      environment: 'production',
      appName: 'Hostel Food Management - Student Portal',
      debug: false,
    };
  }

  return config;
};

export const config = getConfig();

// API endpoints
export const API_ENDPOINTS = {
  STUDENT_LOGIN: `${config.apiBaseUrl}/student/oauth`,
  STUDENT_STATUS: `${config.apiBaseUrl}/student-status/status`,
  PAUSE_FOOD: `${config.apiBaseUrl}/pause`,
  DELETE_PAUSE: (studentId: string) => `${config.apiBaseUrl}/student-status/pause/${studentId}`,
};

// Utility function for logging (only logs in debug mode)
export const logger = {
  log: (...args: any[]) => {
    if (config.debug) {
      console.log(`[${config.environment.toUpperCase()}]`, ...args);
    }
  },
  error: (...args: any[]) => {
    if (config.debug) {
      console.error(`[${config.environment.toUpperCase()}]`, ...args);
    }
  },
  warn: (...args: any[]) => {
    if (config.debug) {
      console.warn(`[${config.environment.toUpperCase()}]`, ...args);
    }
  },
};

export default config;
