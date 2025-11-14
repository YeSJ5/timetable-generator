/**
 * API Client
 * 
 * Axios instance configured for backend API calls
 */

import axios, { AxiosInstance, AxiosError } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Handle common errors
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      const data = error.response.data as any;

      switch (status) {
        case 400:
          console.error('Validation error:', data);
          break;
        case 401:
          console.error('Unauthorized');
          // Handle logout
          break;
        case 404:
          console.error('Resource not found');
          break;
        case 429:
          console.error('Rate limit exceeded');
          break;
        case 500:
          console.error('Server error:', data);
          break;
        default:
          console.error('API error:', data);
      }
    } else if (error.request) {
      // Request made but no response
      console.error('Network error:', error.message);
    } else {
      // Error setting up request
      console.error('Request error:', error.message);
    }

    return Promise.reject(error);
  }
);

export default apiClient;

