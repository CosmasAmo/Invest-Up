import { useState, useEffect } from 'react';
import axios from 'axios';
import axiosInstance from '../api/axios';

function TestApiConnection() {
    const [results, setResults] = useState({
        axiosDefault: {},
        axiosInstance: {},
        baseUrls: {
            default: axios.defaults.baseURL || 'Not set',
            instance: axiosInstance.defaults.baseURL || 'Not set'
        },
        tokens: {
            localStorage: localStorage.getItem('auth_token') || 'Not found',
            sessionStorage: sessionStorage.getItem('auth_token') || 'Not found',
            cookie: document.cookie.includes('token=') ? 'Found in cookie' : 'Not in cookie'
        }
    });
    
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const testConnection = async () => {
        setIsLoading(true);
        setError(null);
        
        const newResults = {
            ...results,
            axiosDefault: {},
            axiosInstance: {}
        };
        
        // Test with default axios
        try {
            const defaultResponse = await axios.get('/api/settings/test', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('auth_token')}`
                }
            });
            newResults.axiosDefault = {
                success: true,
                status: defaultResponse.status,
                isHtml: typeof defaultResponse.data === 'string' && defaultResponse.data.includes('<!DOCTYPE html>'),
                data: defaultResponse.data
            };
        } catch (error) {
            newResults.axiosDefault = {
                success: false,
                status: error.response?.status,
                message: error.message,
                data: error.response?.data
            };
        }
        
        // Test with axios instance
        try {
            const instanceResponse = await axiosInstance.get('/api/settings/test', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('auth_token')}`
                }
            });
            newResults.axiosInstance = {
                success: true,
                status: instanceResponse.status,
                isHtml: typeof instanceResponse.data === 'string' && instanceResponse.data.includes('<!DOCTYPE html>'),
                data: instanceResponse.data
            };
        } catch (error) {
            newResults.axiosInstance = {
                success: false,
                status: error.response?.status,
                message: error.message,
                data: error.response?.data
            };
        }
        
        setResults(newResults);
        setIsLoading(false);
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">API Connection Test</h1>
            
            <div className="bg-slate-800 rounded-lg p-4 mb-4">
                <h2 className="text-xl font-semibold mb-2">Configuration</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <h3 className="font-medium">Base URLs</h3>
                        <p className="text-sm">Default: <code className="bg-slate-700 px-2 py-1 rounded">{results.baseUrls.default}</code></p>
                        <p className="text-sm">Instance: <code className="bg-slate-700 px-2 py-1 rounded">{results.baseUrls.instance}</code></p>
                    </div>
                    <div>
                        <h3 className="font-medium">Auth Tokens</h3>
                        <p className="text-sm">localStorage: <code className="bg-slate-700 px-2 py-1 rounded">{results.tokens.localStorage.substring(0, 15)}...</code></p>
                        <p className="text-sm">sessionStorage: <code className="bg-slate-700 px-2 py-1 rounded">{results.tokens.sessionStorage}</code></p>
                        <p className="text-sm">Cookie: <code className="bg-slate-700 px-2 py-1 rounded">{results.tokens.cookie}</code></p>
                    </div>
                </div>
            </div>
            
            <button 
                onClick={testConnection}
                disabled={isLoading}
                className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg mb-4 disabled:opacity-50"
            >
                {isLoading ? 'Testing...' : 'Test Connection'}
            </button>
            
            {error && (
                <div className="bg-red-900/30 border border-red-500 text-red-100 p-4 rounded-lg mb-4">
                    {error}
                </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-800 rounded-lg p-4">
                    <h2 className="text-xl font-semibold mb-2">Default Axios</h2>
                    {Object.keys(results.axiosDefault).length > 0 ? (
                        <pre className="bg-slate-900 p-4 rounded-lg text-xs overflow-auto max-h-80">
                            {JSON.stringify(results.axiosDefault, null, 2)}
                        </pre>
                    ) : (
                        <p className="text-gray-400">No test run yet</p>
                    )}
                </div>
                
                <div className="bg-slate-800 rounded-lg p-4">
                    <h2 className="text-xl font-semibold mb-2">Axios Instance</h2>
                    {Object.keys(results.axiosInstance).length > 0 ? (
                        <pre className="bg-slate-900 p-4 rounded-lg text-xs overflow-auto max-h-80">
                            {JSON.stringify(results.axiosInstance, null, 2)}
                        </pre>
                    ) : (
                        <p className="text-gray-400">No test run yet</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default TestApiConnection; 