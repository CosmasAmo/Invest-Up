/**
 * Authentication utilities for handling tokens
 */

// Extract token from URL
export const extractTokenFromUrl = () => {
  console.log('Extracting token from URL');
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');
  
  if (token) {
    console.log('Found token in URL with length:', token.length);
    return token;
  }
  
  console.log('No token found in URL params');
  return null;
};

// Extract and save token from URL, then clear it
export const handleAuthCallback = () => {
  const token = extractTokenFromUrl();
  
  if (token) {
    console.log('Saving token to localStorage');
    // Save the token to localStorage
    localStorage.setItem('auth_token', token);
    
    // Remove the token from URL for security
    const url = new URL(window.location);
    url.searchParams.delete('token');
    window.history.replaceState({}, document.title, url.toString());
    
    return true;
  }
  
  return false;
};

// Check if there's an authentication error in the URL
export const checkAuthError = () => {
  console.log('Checking for auth errors in URL');
  const urlParams = new URLSearchParams(window.location.search);
  const error = urlParams.get('error');
  if (error) {
    console.log('Found error in URL:', error);
  }
  return error;
};