// Consistent error handling utility
export const handleApiError = (error, fallbackMessage = 'An error occurred') => {
  if (error.response) {
    // Server responded with error status
    return error.response.data?.message || `Server error: ${error.response.status}`;
  } else if (error.request) {
    // Request made but no response
    return 'Network error. Please check your connection.';
  } else {
    // Something else happened
    return fallbackMessage;
  }
};

export const showError = (message) => {
  // For now, just return the message. Can be enhanced with toast notifications
  return message;
};

export const showSuccess = (message) => {
  // For now, just return the message. Can be enhanced with toast notifications  
  return message;
};