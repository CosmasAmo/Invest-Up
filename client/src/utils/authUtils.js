/**
 * Authentication utilities for handling tokens
 */

// Extract token from URL (used for Google auth callbacks)
export const extractTokenFromUrl = () => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('token');
};

// Extract and save token from URL, then clear it
export const handleAuthCallback = () => {
  const token = extractTokenFromUrl();
  
  if (token) {
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
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('error');
}; 