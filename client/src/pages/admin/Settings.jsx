import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AdminLayout from '../../components/admin/AdminLayout';
import { toast } from 'react-toastify';
import { CogIcon, ArrowPathIcon, CheckCircleIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import axios from 'axios';

function Settings() {
    const [settings, setSettings] = useState({
        referralBonus: 5,
        minWithdrawal: 3,
        minDeposit: 3,
        minInvestment: 3,
        profitPercentage: 5,
        profitInterval: 5, // in minutes
        profitDays: [1, 2, 3, 4, 5], // Default to weekdays (Monday-Friday)
        withdrawalFee: 2,
        referralsRequired: 2,
        depositAddresses: {
            BINANCE: '374592285',
            TRC20: 'TYKbfLuFUUz5T3X2UFvhBuTSNvLE6TQpjX',
            BEP20: '0x6f4f06ece1fae66ec369881b4963a4a939fd09a3',
            ERC20: '0x6f4f06ece1fae66ec369881b4963a4a939fd09a3',
            OPTIMISM: '0x6f4f06ece1fae66ec369881b4963a4a939fd09a3'
        }
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [authToken, setAuthToken] = useState('');
    const [isProfitCalculating, setIsProfitCalculating] = useState(false);

    // Get and set the auth token when component mounts
    useEffect(() => {
        const getToken = () => {
            // Check for token in multiple locations
            const token = localStorage.getItem('auth_token') || 
                          localStorage.getItem('token') || 
                          sessionStorage.getItem('auth_token') || 
                          sessionStorage.getItem('token') || 
                          document.cookie.replace(/(?:(?:^|.*;\s*)token\s*=\s*([^;]*).*$)|^.*$/, "$1");
            
            if (token) {
                setAuthToken(token);
                console.log('Authentication token found:', token.substring(0, 10) + '...');
            } else {
                console.warn('No authentication token found');
            }
        };
        
        getToken();
    }, []);

    // Test API connectivity
    useEffect(() => {
        const testApiConnection = async () => {
            try {
                // Log the actual axios base URL and default headers
                console.log('Current axios baseURL:', axios.defaults.baseURL);
                console.log('Current axios instance:', axios.getUri({ url: '/api/settings/test' }));
                const token = localStorage.getItem('auth_token');
                console.log('Authentication token found:', token ? token.substring(0, 20) + '...' : 'none');
                
                const response = await axios.get('/api/settings/test');
                console.log('API test response:', response.data);
                
                if (response.data.success) {
                    console.log('Settings API is accessible');
                } else {
                    console.warn('Settings API returned success: false');
                }
            } catch (error) {
                console.error('Error testing Settings API:', error);
                toast.error('Unable to connect to settings API. Server might be down.');
            }
        };
        
        testApiConnection();
    }, []);

    // Fetch settings from the server on component mount
    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setIsFetching(true);
            
            const token = localStorage.getItem('auth_token') || 
                          localStorage.getItem('token') || 
                          sessionStorage.getItem('auth_token') || 
                          sessionStorage.getItem('token') || 
                          document.cookie.replace(/(?:(?:^|.*;\s*)token\s*=\s*([^;]*).*$)|^.*$/, "$1");

            const config = {
                withCredentials: true,
                headers: {
                    'Accept': 'application/json'
                }
            };

            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }

            const response = await axios.get('/api/settings', config);
            if (response.data.success) {
                // Make sure depositAddresses exists with default values
                const settingsData = response.data.settings;
                if (!settingsData.depositAddresses) {
                    settingsData.depositAddresses = {
                        BINANCE: '374592285',
                        TRC20: 'TYKbfLuFUUz5T3X2UFvhBuTSNvLE6TQpjX',
                        BEP20: '0x6f4f06ece1fae66ec369881b4963a4a939fd09a3',
                        ERC20: '0x6f4f06ece1fae66ec369881b4963a4a939fd09a3',
                        OPTIMISM: '0x6f4f06ece1fae66ec369881b4963a4a939fd09a3'
                    };
                }
                
                // Ensure profitDays exist
                if (!settingsData.profitDays) {
                    settingsData.profitDays = [1, 2, 3, 4, 5]; // Default to weekdays
                }
                
                setSettings(settingsData);
                
                // Always save to localStorage for backup
                localStorage.setItem('adminSettings', JSON.stringify(settingsData));
            }
        } catch (error) {
            console.error('Failed to fetch settings:', error);
            // If API fails, try to load from localStorage as fallback
            try {
                const savedSettings = localStorage.getItem('adminSettings');
                if (savedSettings) {
                    const parsedSettings = JSON.parse(savedSettings);
                    // Ensure depositAddresses exists with default values
                    if (!parsedSettings.depositAddresses) {
                        parsedSettings.depositAddresses = {
                            BINANCE: '374592285',
                            TRC20: 'TYKbfLuFUUz5T3X2UFvhBuTSNvLE6TQpjX',
                            BEP20: '0x6f4f06ece1fae66ec369881b4963a4a939fd09a3',
                            ERC20: '0x6f4f06ece1fae66ec369881b4963a4a939fd09a3',
                            OPTIMISM: '0x6f4f06ece1fae66ec369881b4963a4a939fd09a3'
                        };
                    }
                    setSettings(parsedSettings);
                } else {
                    // If no settings in localStorage, use default values
                    const defaultSettings = {
                        referralBonus: 5,
                        minWithdrawal: 3,
                        minDeposit: 3,
                        minInvestment: 3,
                        profitPercentage: 5,
                        profitInterval: 5,
                        profitDays: [1, 2, 3, 4, 5],
                        withdrawalFee: 2,
                        referralsRequired: 2,
                        depositAddresses: {
                            BINANCE: '374592285',
                            TRC20: 'TYKbfLuFUUz5T3X2UFvhBuTSNvLE6TQpjX',
                            BEP20: '0x6f4f06ece1fae66ec369881b4963a4a939fd09a3',
                            ERC20: '0x6f4f06ece1fae66ec369881b4963a4a939fd09a3',
                            OPTIMISM: '0x6f4f06ece1fae66ec369881b4963a4a939fd09a3'
                        }
                    };
                    setSettings(defaultSettings);
                    localStorage.setItem('adminSettings', JSON.stringify(defaultSettings));
                }
            } catch (localError) {
                console.error('Failed to load settings from localStorage:', localError);
            }
        } finally {
            setIsFetching(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        // Fix for NaN parsing error - ensure value is a valid number
        const numericValue = value === '' ? 0 : parseFloat(value);
        
        if (!isNaN(numericValue)) {
            setSettings({
                ...settings,
                [name]: numericValue
            });
        }
    };

    const handleSystemSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setSaveSuccess(false);
        
        // Validate that at least one profit day is selected
        if (!settings.profitDays || settings.profitDays.length === 0) {
            toast.error('You must select at least one day for profit calculations');
            setIsLoading(false);
            return;
        }

        // Only extract system configuration fields - NEVER include depositAddresses
        const systemPayload = {
            referralBonus: settings.referralBonus,
            minWithdrawal: settings.minWithdrawal,
            minDeposit: settings.minDeposit,
            minInvestment: settings.minInvestment,
            profitPercentage: settings.profitPercentage,
            profitInterval: settings.profitInterval,
            profitDays: settings.profitDays,
            withdrawalFee: settings.withdrawalFee,
            referralsRequired: settings.referralsRequired
        };
        
        try {
            const config = {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json'
                }
            };
            
            const token = authToken || 
                          localStorage.getItem('auth_token') || 
                          localStorage.getItem('token') || 
                          sessionStorage.getItem('auth_token') || 
                          sessionStorage.getItem('token') || 
                          document.cookie.replace(/(?:(?:^|.*;\s*)token\s*=\s*([^;]*).*$)|^.*$/, "$1");
                          
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            
            console.log('Sending system settings payload:', systemPayload);
            const response = await axios.post('/api/settings/system', systemPayload, config);
            
            if (response.data.success) {
                toast.success('System configuration updated successfully');
                setSaveSuccess(true);
                
                if (response.data.settings) {
                    setSettings(prev => ({
                        ...prev,
                        ...response.data.settings,
                        // Preserve current deposit addresses
                        depositAddresses: prev.depositAddresses
                    }));
                }
                
                setTimeout(() => {
                    setSaveSuccess(false);
                }, 3000);
            } else {
                throw new Error(response.data.message || 'Failed to update system settings');
            }
        } catch (error) {
            console.error('Failed to update system settings:', error);
            toast.error(error.response?.data?.message || error.message || 'Failed to update system settings');
        } finally {
            setIsLoading(false);
        }
    };

    const resetToDefaults = () => {
        setSettings(prev => ({
            ...prev,
            referralBonus: 5,
            minWithdrawal: 3,
            minDeposit: 3,
            minInvestment: 3,
            profitPercentage: 5,
            profitInterval: 5,
            profitDays: [1, 2, 3, 4, 5],
            withdrawalFee: 2,
            referralsRequired: 2
            // Note: depositAddresses is preserved and NOT overwritten!
        }));
        toast.info('System configuration reset to default values. Click Save to apply changes.');
    };

    // Handle checkbox change for profit days
    const handleProfitDayChange = (day) => {
        const currentProfitDays = [...settings.profitDays];
        
        if (currentProfitDays.includes(day)) {
            // Remove day if already selected
            const updatedDays = currentProfitDays.filter(d => d !== day);
            setSettings({...settings, profitDays: updatedDays});
        } else {
            // Add day if not selected
            const updatedDays = [...currentProfitDays, day].sort((a, b) => a - b);
            setSettings({...settings, profitDays: updatedDays});
        }
    };
    
    // Get day name
    const getDayName = (day) => {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return days[day];
    };
    
    // Render profit days selection
    const renderProfitDaysSelection = () => {
        const allDays = [0, 1, 2, 3, 4, 5, 6]; // 0 = Sunday, 6 = Saturday
        
        return (
            <div className="flex flex-wrap gap-2">
                {allDays.map((day) => (
                    <div key={day} className="flex items-center bg-slate-700/70 px-2 py-1 rounded-md border border-slate-600">
                        <input
                            type="checkbox"
                            id={`day-${day}`}
                            checked={settings.profitDays.includes(day)}
                            onChange={() => handleProfitDayChange(day)}
                            className="h-4 w-4 text-blue-600 border-gray-600 rounded bg-slate-700 focus:ring-blue-500"
                        />
                        <label htmlFor={`day-${day}`} className="ml-2 text-sm text-gray-300">
                            {getDayName(day)}
                        </label>
                    </div>
                ))}
            </div>
        );
    };
    
    // Check if at least one day is selected
    const isAtLeastOneDaySelected = () => {
        return settings.profitDays && settings.profitDays.length > 0;
    };

    // Add function to trigger profit calculation
    const triggerProfitCalculation = async () => {
        try {
            setIsProfitCalculating(true);
            const response = await axios.post('/api/admin/trigger-profit-calculation');
            
            if (response.data.success) {
                toast.success('Profit calculation triggered successfully');
            } else {
                toast.error(response.data.message || 'Failed to trigger profit calculation');
            }
        } catch (error) {
            console.error('Error triggering profit calculation:', error);
            toast.error('Error triggering profit calculation: ' + (error.response?.data?.message || error.message));
        } finally {
            setIsProfitCalculating(false);
        }
    };

    // Add function to update profit calculation interval
    const updateProfitInterval = async () => {
        try {
            toast.info('Updating profit calculation scheduler...');
            const response = await axios.post('/api/admin/update-profit-interval');
            
            if (response.data.success) {
                toast.success('Profit calculation scheduler updated successfully');
            } else {
                toast.error(response.data.message || 'Failed to update profit calculation scheduler');
            }
        } catch (error) {
            console.error('Error updating profit calculation scheduler:', error);
            toast.error('Error updating scheduler: ' + (error.response?.data?.message || error.message));
        }
    };

    if (isFetching) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
                    <div className="flex flex-col items-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                        <p className="text-gray-400">Loading settings...</p>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="max-w-4xl mx-auto">
                {/* Page Header */}
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-2xl font-bold text-white">Platform Settings</h1>
                    <p className="text-gray-400 mt-1">Configure global settings for the investment platform</p>
                </motion.div>
                
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-slate-800 rounded-xl shadow-xl overflow-hidden border border-slate-700"
                >
                    <div className="px-6 py-4 bg-slate-700 border-b border-slate-600 flex justify-between items-center">
                        <div className="flex items-center">
                            <CogIcon className="h-5 w-5 text-blue-400 mr-2" />
                            <h2 className="text-lg font-semibold text-white">System Configuration</h2>
                        </div>
                        <button 
                            type="button"
                            onClick={resetToDefaults}
                            className="text-sm text-gray-400 hover:text-white flex items-center gap-1 transition-colors"
                        >
                            <ArrowPathIcon className="h-4 w-4" />
                            <span>Reset to Default</span>
                        </button>
                    </div>
                    
                    <div className="p-6">
                        <form onSubmit={handleSystemSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Minimum Deposit ($)
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>
                                            <input
                                                type="number"
                                                name="minDeposit"
                                                value={settings.minDeposit}
                                                onChange={handleChange}
                                                className="w-full bg-slate-700 text-white pl-8 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border border-slate-600"
                                                step="0.01"
                                                min="0"
                                            />
                                        </div>
                                        <p className="mt-1 text-xs text-gray-400">Minimum amount users can deposit</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Minimum Withdrawal ($)
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>
                                            <input
                                                type="number"
                                                name="minWithdrawal"
                                                value={settings.minWithdrawal}
                                                onChange={handleChange}
                                                className="w-full bg-slate-700 text-white pl-8 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border border-slate-600"
                                                step="0.01"
                                                min="0"
                                            />
                                        </div>
                                        <p className="mt-1 text-xs text-gray-400">Minimum amount users can withdraw</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Minimum Investment ($)
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>
                                            <input
                                                type="number"
                                                name="minInvestment"
                                                value={settings.minInvestment}
                                                onChange={handleChange}
                                                className="w-full bg-slate-700 text-white pl-8 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border border-slate-600"
                                                step="0.01"
                                                min="0"
                                            />
                                        </div>
                                        <p className="mt-1 text-xs text-gray-400">Minimum amount users can invest</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Withdrawal Fee ($)
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>
                                            <input
                                                type="number"
                                                name="withdrawalFee"
                                                value={settings.withdrawalFee}
                                                onChange={handleChange}
                                                className="w-full bg-slate-700 text-white pl-8 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border border-slate-600"
                                                step="0.01"
                                                min="0"
                                            />
                                        </div>
                                        <p className="mt-1 text-xs text-gray-400">Fee charged on each withdrawal</p>
                                    </div>
                                </div>
                                
                                <div className="space-y-6">
                                    <div className="bg-slate-700/50 p-5 rounded-lg border border-slate-600">
                                        <h3 className="text-md font-semibold text-white mb-4">Profit Configuration</h3>
                                        
                                        <div className="grid grid-cols-1 gap-5 mb-5">
                                            <div>
                                                <label htmlFor="profitPercentage" className="block text-sm font-medium text-gray-300 mb-1">
                                                    Daily Profit Percentage (%)
                                                </label>
                                                <input
                                                    type="number"
                                                    name="profitPercentage"
                                                    id="profitPercentage"
                                                    step="0.01"
                                                    value={settings.profitPercentage || ''}
                                                    onChange={handleChange}
                                                    className="mt-1 block w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-white"
                                                    placeholder="Default profit percentage"
                                                /> 
                                                <p className="mt-1 text-xs text-gray-400">
                                                    The default daily profit percentage for all investments
                                                </p>
                                            </div>
                                            
                                            <div>
                                                <label htmlFor="profitInterval" className="block text-sm font-medium text-gray-300 mb-1">
                                                    Profit Calculation Interval (minutes)
                                                </label>
                                                <div className="flex items-center space-x-2">
                                                    <input
                                                        type="number"
                                                        name="profitInterval"
                                                        id="profitInterval"
                                                        min="1"
                                                        value={settings.profitInterval || ''}
                                                        onChange={handleChange}
                                                        className="mt-1 block w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-white"
                                                        placeholder="Profit interval in minutes"
                                                    />
                                                    <button 
                                                        type="button" 
                                                        onClick={updateProfitInterval}
                                                        className="mt-1 inline-flex items-center px-2.5 py-2 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                                        title="Update profit interval scheduler"
                                                    >
                                                        <ArrowPathIcon className="h-4 w-4" />
                                                    </button>
                                                </div>
                                                <p className="mt-1 text-xs text-gray-400">
                                                    How often profit is calculated (in minutes)
                                                </p>
                                            </div>
                                        </div>
                                        
                                        {/* Profit Days Selection */}
                                        <div className="mt-6">
                                            <label className="block text-sm font-medium text-gray-300 mb-3">
                                                Profit Days
                                            </label>
                                            
                                            {renderProfitDaysSelection()}
                                            
                                            <p className="mt-3 text-xs text-gray-400">
                                                Select the days when profits should be calculated. At least one day must be selected.
                                            </p>
                                            
                                            {/* Warning if no days selected */}
                                            {!isAtLeastOneDaySelected() && (
                                                <p className="mt-2 text-xs text-red-400">
                                                    You must select at least one day for profit calculations.
                                                </p>
                                            )}
                                        </div>

                                        {/* Manual Profit Calculation Button */}
                                        <div className="mt-6 border-t border-slate-600/50 pt-6">
                                            <h4 className="text-sm font-medium text-gray-300 mb-2">Manual Profit Calculation</h4>
                                            <p className="text-xs text-gray-400 mb-3">
                                                Force a profit calculation for all active investments regardless of their last update time.
                                            </p>
                                            <button
                                                type="button"
                                                onClick={triggerProfitCalculation}
                                                disabled={isProfitCalculating}
                                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
                                            >
                                                {isProfitCalculating ? (
                                                    <>
                                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                        Calculating...
                                                    </>
                                                ) : (
                                                    'Trigger Profit Calculation Now'
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Referral Bonus ($)
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>
                                            <input
                                                type="number"
                                                name="referralBonus"
                                                value={settings.referralBonus}
                                                onChange={handleChange}
                                                className="w-full bg-slate-700 text-white pl-8 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border border-slate-600"
                                                step="0.01"
                                                min="0"
                                            />
                                        </div>
                                        <p className="mt-1 text-xs text-gray-400">Bonus amount for successful referrals</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Referrals Required
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                name="referralsRequired"
                                                value={settings.referralsRequired}
                                                onChange={handleChange}
                                                className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border border-slate-600"
                                                step="1"
                                                min="1"
                                            />
                                        </div>
                                        <p className="mt-1 text-xs text-gray-400">Number of successful referrals needed for bonus</p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-700 mt-8">
                                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                                    <div className="text-sm text-gray-400">
                                        <p>Changes will affect all users immediately.</p>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isLoading || !isAtLeastOneDaySelected()}
                                        className={`w-full sm:w-auto px-6 py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 ${
                                            saveSuccess 
                                                ? 'bg-green-600 hover:bg-green-700 text-white' 
                                                : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white'
                                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                                    >
                                        {isLoading ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Processing...
                                            </>
                                        ) : saveSuccess ? (
                                            <>
                                                <CheckCircleIcon className="h-5 w-5" />
                                                Saved Successfully
                                            </>
                                        ) : (
                                            'Save Settings'
                                        )}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </motion.div>
                
                {/* Payment Addresses Section (Read-Only / Locked) */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="bg-slate-800 rounded-xl shadow-xl overflow-hidden border border-slate-700 mt-8"
                >
                    <div className="px-6 py-4 bg-slate-700 border-b border-slate-600 flex justify-between items-center">
                        <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                            <h2 className="text-lg font-semibold text-white">Payment Addresses</h2>
                        </div>
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            <LockClosedIcon className="h-3.5 w-3.5" />
                            Editing Locked
                        </span>
                    </div>
                    
                    <div className="p-6">
                        <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-start gap-3">
                            <LockClosedIcon className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
                            <div>
                                <h4 className="text-sm font-semibold text-amber-300">Payment Addresses are Protected</h4>
                                <p className="text-xs text-amber-200/80 mt-1">
                                    To protect against unauthorized changes or unintended overwrites, payment addresses are currently locked to read-only mode.
                                </p>
                            </div>
                        </div>

                        <p className="text-gray-300 mb-4 text-sm">
                            The following deposit addresses are currently active and displayed to users on the deposit page:
                        </p>
                        
                        <div className="space-y-4">
                            {settings.depositAddresses && Object.entries(settings.depositAddresses).map(([key, address]) => (
                                <div key={key} className="bg-slate-900/60 p-4 rounded-lg border border-slate-700/80">
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="block text-sm font-medium text-blue-400">
                                            {key} Address
                                        </label>
                                        <span className="text-xs px-2 py-0.5 bg-slate-800 text-gray-400 border border-slate-700 rounded flex items-center gap-1">
                                            <LockClosedIcon className="h-3 w-3" />
                                            Read-only
                                        </span>
                                    </div>
                                    <div className="flex">
                                        <input
                                            type="text"
                                            readOnly
                                            value={address}
                                            className="w-full bg-slate-800 text-gray-300 px-4 py-3 rounded-lg border border-slate-700 cursor-not-allowed select-all focus:outline-none font-mono text-sm"
                                        />
                                    </div>
                                </div>
                            ))}
                            {(!settings.depositAddresses || Object.keys(settings.depositAddresses).length === 0) && (
                                <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                                    <p className="text-yellow-400 text-sm">
                                        No deposit addresses configured.
                                    </p>
                                </div>
                            )}
                        </div>
                        
                        <div className="pt-4 border-t border-slate-700 mt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
                            <div className="text-xs text-gray-400">
                                <p>🔒 Payment addresses cannot be edited through this dashboard for security.</p>
                            </div>
                            <button
                                type="button"
                                disabled
                                className="w-full sm:w-auto px-6 py-3 rounded-lg bg-slate-700 text-gray-400 cursor-not-allowed flex items-center justify-center gap-2 border border-slate-600 text-sm font-medium"
                            >
                                <LockClosedIcon className="h-4 w-4" />
                                Addresses Locked
                            </button>
                        </div>
                    </div>
                </motion.div>
                
                {/* Settings Info Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="bg-slate-800 rounded-xl shadow-xl overflow-hidden border border-slate-700 mt-8"
                >
                    <div className="px-6 py-4 bg-slate-700 border-b border-slate-600">
                        <h2 className="text-lg font-semibold text-white">Settings Information</h2>
                    </div>
                    
                    <div className="p-6">
                        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                            <h3 className="text-blue-400 font-medium mb-2">How Settings Affect Users</h3>
                            <ul className="text-sm text-gray-300 space-y-2 list-disc pl-5">
                                <li><span className="text-white font-medium">Minimum Deposit:</span> Users cannot deposit less than this amount.</li>
                                <li><span className="text-white font-medium">Minimum Withdrawal:</span> Users cannot withdraw less than this amount.</li>
                                <li><span className="text-white font-medium">Minimum Investment:</span> Users cannot invest less than this amount.</li>
                                <li><span className="text-white font-medium">Withdrawal Fee:</span> This amount is deducted from each withdrawal.</li>
                                <li><span className="text-white font-medium">Profit Percentage:</span> Users earn this percentage on investments for each interval.</li>
                                <li><span className="text-white font-medium">Profit Interval:</span> How often (in minutes) profit is calculated and added.</li>
                                <li><span className="text-white font-medium">Referral Bonus:</span> Amount users receive after required number of successful referrals.</li>
                                <li><span className="text-white font-medium">Referrals Required:</span> Number of successful referrals needed to earn the bonus.</li>
                                <li><span className="text-white font-medium">Deposit Addresses:</span> The payment addresses shown to users when they make deposits.</li>
                            </ul>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AdminLayout>
    );
}

export default Settings; 