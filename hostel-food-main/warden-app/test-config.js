// Test script to verify environment configuration
import { config, API_ENDPOINTS, logger } from './src/config/config';

console.log('=== Warden App Environment Configuration Test ===');
console.log('Environment:', config.environment);
console.log('API Base URL:', config.apiBaseUrl);
console.log('App Name:', config.appName);
console.log('Debug Mode:', config.debug);
console.log('');
console.log('=== API Endpoints ===');
console.log('Warden Login:', API_ENDPOINTS.WARDEN_LOGIN);
console.log('Food Count:', API_ENDPOINTS.FOOD_COUNT);
console.log('Students:', API_ENDPOINTS.STUDENTS);
console.log('Pause Status:', API_ENDPOINTS.PAUSE_STATUS);
console.log('');

// Test logger
logger.log('This is a test log message');
logger.warn('This is a test warning message');
logger.error('This is a test error message');
