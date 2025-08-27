// Environment configuration for the Warden App
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
    appName: process.env.REACT_APP_APP_NAME || 'Hostel Food Management - Warden Portal',
    debug: process.env.REACT_APP_DEBUG === 'true' || process.env.NODE_ENV === 'development',
  };

  // Override with environment-specific settings if REACT_APP_ENV is set
  const envOverride = process.env.REACT_APP_ENV;
  
  if (envOverride === 'qa') {
    config = {
      ...config,
      apiBaseUrl: 'https://dev-warden.vjstartup.com/be/api',
      environment: 'qa',
      appName: 'Hostel Food Management - Warden Portal (QA)',
      debug: true,
    };
  } else if (envOverride === 'production') {
    config = {
      ...config,
      apiBaseUrl: 'https://warden.vjstartup.com/be/api',
      environment: 'production',
      appName: 'Hostel Food Management - Warden Portal',
      debug: false,
    };
  }

  return config;
};

export const config = getConfig();

// API endpoints
export const API_ENDPOINTS = {
  WARDEN_LOGIN: `${config.apiBaseUrl}/warden/login`,
  FOOD_COUNT: `${config.apiBaseUrl}/food-count`,
  STUDENTS: `${config.apiBaseUrl}/students`,
  STUDENTS_BY_HOSTEL: `${config.apiBaseUrl}/students/hostel`,
  PAUSE_STATUS: `${config.apiBaseUrl}/student-status/pause-status`,
  PAUSE_RECORDS_BY_HOSTEL: `${config.apiBaseUrl}/student-status/pause-records/hostel`,
};

// Utility function to get current warden's hostel ID
export const getWardenHostelId = (): number => {
  try {
    const wardenInfo = localStorage.getItem('warden_info');
    if (wardenInfo) {
      const warden = JSON.parse(wardenInfo);
      return warden.hostel_id || 1; // Default to 1 if not found
    }
  } catch (error) {
    logger.error('Error parsing warden info from localStorage:', error);
  }
  return 1; // Default fallback
};

// Utility function to get current warden information
export const getWardenInfo = () => {
  try {
    const wardenInfo = localStorage.getItem('warden_info');
    if (wardenInfo) {
      return JSON.parse(wardenInfo);
    }
  } catch (error) {
    logger.error('Error parsing warden info from localStorage:', error);
  }
  return null;
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
