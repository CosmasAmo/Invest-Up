import { useState, useEffect } from 'react';
import axios from 'axios';
import useStore from '../store/useStore';
import { createRequestConfig } from '../utils/apiUtils';

function ApiDebug() {
  const [isVisible, setIsVisible] = useState(false);
  const [apiStatus, setApiStatus] = useState('Unknown');
  const [apiUrl, setApiUrl] = useState('');
  const [adminStatus, setAdminStatus] = useState('Unknown');
  const { isAdmin } = useStore();

  useEffect(() => {
    // Get the current API URL
    setApiUrl(axios.defaults.baseURL || 'Not set');
    
    // Get admin status
    setAdminStatus(isAdmin ? 'Yes ✅' : 'No ❌');
    
    // Check if we're in development mode
    if (import.meta.env.DEV) {
      // Only show in development mode
      const showDebug = localStorage.getItem('show_api_debug') === 'true';
      setIsVisible(showDebug);
    }
  }, [isAdmin]);

  const toggleVisibility = () => {
    const newValue = !isVisible;
    setIsVisible(newValue);
    localStorage.setItem('show_api_debug', newValue.toString());
  };

  const testConnection = async () => {
    try {
      setApiStatus('Testing...');
      const config = createRequestConfig();
      const response = await axios.get('/api/auth/check', config);
      if (response.data.success) {
        setApiStatus('Connected ✅');
        setAdminStatus(response.data.user.isAdmin ? 'Yes ✅' : 'No ❌');
      } else {
        setApiStatus('Failed: ' + (response.data.message || 'Unknown error'));
      }
    } catch (error) {
      setApiStatus('Error: ' + (error.message || 'Unknown error'));
    }
  };
  
  const toggleAdminStatus = () => {
    const currentStatus = localStorage.getItem('is_admin') === 'true';
    const newStatus = !currentStatus;
    localStorage.setItem('is_admin', newStatus ? 'true' : 'false');
    setAdminStatus(newStatus ? 'Yes ✅' : 'No ❌');
    alert(`Admin status set to: ${newStatus ? 'Yes' : 'No'}\nRefresh the page to apply changes.`);
  };

  if (!isVisible) {
    return (
      <button 
        onClick={toggleVisibility}
        className="fixed bottom-2 right-2 bg-gray-800 text-xs text-gray-400 p-1 rounded opacity-50 hover:opacity-100 z-50"
      >
        Debug
      </button>
    );
  }

  return (
    <div className="fixed bottom-2 right-2 bg-gray-800 p-3 rounded shadow-lg z-50 text-sm w-64">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold text-white">API Debug</h3>
        <button 
          onClick={toggleVisibility}
          className="text-gray-400 hover:text-white"
        >
          ✕
        </button>
      </div>
      
      <div className="mb-2">
        <div className="text-gray-400">Backend URL:</div>
        <div className="text-white text-xs break-all">{apiUrl}</div>
      </div>
      
      <div className="mb-2">
        <div className="text-gray-400">Status:</div>
        <div className="text-white">{apiStatus}</div>
      </div>
      
      <div className="mb-2">
        <div className="text-gray-400">Admin Status:</div>
        <div className="text-white">{adminStatus}</div>
      </div>
      
      <div className="flex flex-wrap gap-2">
        <button 
          onClick={testConnection}
          className="bg-blue-600 text-white px-2 py-1 rounded text-xs"
        >
          Test Connection
        </button>
        <button 
          onClick={toggleAdminStatus}
          className="bg-purple-600 text-white px-2 py-1 rounded text-xs"
        >
          Toggle Admin
        </button>
      </div>
    </div>
  );
}

export default ApiDebug; 