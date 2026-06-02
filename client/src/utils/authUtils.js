/**
 * Authentication utilities for handling tokens
 */

// Extract token from URL (used for Google auth callbacks)
export const extractTokenFromUrl = () => {
  console.log('Extracting token from URL');
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');
  
  // Log the full URL for debugging (mask the token for security)
  const currentUrl = window.location.href;
  const debugUrl = token ? 
    currentUrl.replace(token, '[MASKED_TOKEN]') : 
    currentUrl;
  console.log('Current URL for debugging:', debugUrl);
  
  if (token) {
    console.log('Found token in URL with length:', token.length);
    return token;
  }
  
  // Check if we have googleId and email for Google auth flow
  const googleId = urlParams.get('googleId');
  const email = urlParams.get('email');
  
  console.log('URL parameters:', {
    token: token || 'missing',
    googleId: googleId || undefined,
    email: email || undefined
  });
  
  if (googleId && email) {
    console.log('Using googleId + email authentication flow');
    // Return a special signal that we're using this flow
    return 'google_auth_flow';
  }
  
  console.log('No token found in URL params:', Object.fromEntries(urlParams.entries()));
  return null;
};

// Extract and save token from URL, then clear it
export const handleAuthCallback = () => {
  const tokenOrFlow = extractTokenFromUrl();
  
  if (tokenOrFlow === 'google_auth_flow') {
    // Special case for googleId+email flow
    // We don't have a token yet, it will be generated after completing profile
    return false;
  }
  
  if (tokenOrFlow) {
    console.log('Saving token to localStorage');
    // Save the token to localStorage
    localStorage.setItem('auth_token', tokenOrFlow);
    
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