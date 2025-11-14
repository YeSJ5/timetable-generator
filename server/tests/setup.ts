/**
 * Test Setup
 * 
 * Global test configuration
 */

// Set test environment
process.env.NODE_ENV = 'test';

// Mock environment variables if needed
process.env.USE_GREEDY_SOLVER = 'true';

// Increase timeout for database operations
jest.setTimeout(30000);

