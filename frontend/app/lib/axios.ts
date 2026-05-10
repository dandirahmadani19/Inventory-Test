import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

// Response interceptor — normalize errors for consistent handling across the app
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Attach structured error info to the thrown error
    if (error.response?.data) {
      const apiError = error.response.data;
      error.errorCode = apiError.errorCode ?? 'UNKNOWN_ERROR';
      error.userMessage = apiError.message ?? 'An unexpected error occurred';
      error.validationErrors = apiError.errors;
    } else if (error.code === 'ECONNABORTED') {
      error.errorCode = 'TIMEOUT';
      error.userMessage = 'Request timed out. Please try again.';
    } else {
      error.errorCode = 'NETWORK_ERROR';
      error.userMessage = 'Network error. Please check your connection.';
    }
    return Promise.reject(error);
  },
);

export default apiClient;
