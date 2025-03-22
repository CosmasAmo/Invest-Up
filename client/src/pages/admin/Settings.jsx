import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AdminLayout from '../../components/admin/AdminLayout';
import { toast } from 'react-toastify';
import { CogIcon, ArrowPathIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import axios from 'axios';

function Settings() {
    const [settings, setSettings] = useState({
        referralBonus: 5,
        minWithdrawal: 3,
        minDeposit: 3,
        minInvestment: 3,
        profitPercentage: 5,
        profitInterval: 5, // in minutes
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

    // Fetch settings from the server on component mount
    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setIsFetching(true);
            const response = await axios.get('/api/settings', { withCredentials: true });
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setSaveSuccess(false);
        
        try {
            // Try to update settings via API
            const response = await axios.post('/api/settings/update', settings, { withCredentials: true });
            
            if (response.data.success) {
                // Also store in localStorage as backup
                localStorage.setItem('adminSettings', JSON.stringify(settings));
                
                toast.success('Settings updated successfully');
                setSaveSuccess(true);
                
                // Reset success state after 3 seconds
                setTimeout(() => {
                    setSaveSuccess(false);
                }, 3000);
            } else {
                throw new Error(response.data.message || 'Failed to update settings');
            }
        } catch (error) {
            console.error('Failed to update settings:', error);
            
            // If API fails, store in localStorage as fallback
            try {
                localStorage.setItem('adminSettings', JSON.stringify(settings));
                toast.warning('Settings saved locally only. Server update failed.');
                setSaveSuccess(true);
                
                // Reset success state after 3 seconds
                setTimeout(() => {
                    setSaveSuccess(false);
                }, 3000);
            } catch (localError) {
                console.error('Failed to save settings locally:', localError);
                toast.error('Failed to update settings. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const resetToDefaults = () => {
        const defaultSettings = {
            referralBonus: 5,
            minWithdrawal: 3,
            minDeposit: 3,
            minInvestment: 3,
            profitPercentage: 5,
            profitInterval: 5,
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
        toast.info('Settings reset to default values. Click Save to apply changes.');
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
                        <form onSubmit={handleSubmit} className="space-y-6">
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
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Profit Percentage (%)
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">%</span>
                                            <input
                                                type="number"
                                                name="profitPercentage"
                                                value={settings.profitPercentage}
                                                onChange={handleChange}
                                                className="w-full bg-slate-700 text-white pl-8 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border border-slate-600"
                                                step="0.01"
                                                min="0"
                                            />
                                        </div>
                                        <p className="mt-1 text-xs text-gray-400">Profit percentage for each investment interval</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Profit Interval (minutes)
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                name="profitInterval"
                                                value={settings.profitInterval}
                                                onChange={handleChange}
                                                className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border border-slate-600"
                                                step="1"
                                                min="1"
                                            />
                                        </div>
                                        <p className="mt-1 text-xs text-gray-400">Time interval in minutes for profit calculation</p>
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
                                        disabled={isLoading}
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
                
                {/* Payment Addresses Section */}
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
                    </div>
                    
                    <div className="p-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <p className="text-gray-300 mb-4">
                                Configure the deposit addresses that will be shown to users when they make deposits.
                            </p>
                            
                            <div className="space-y-4">
                                {settings.depositAddresses && Object.entries(settings.depositAddresses).map(([key, address]) => (
                                    <div key={key} className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="block text-sm font-medium text-blue-400">
                                                {key} Address
                                            </label>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (window.confirm(`Are you sure you want to delete ${key} payment method?`)) {
                                                        const newSettings = { ...settings };
                                                        if (newSettings.depositAddresses && key in newSettings.depositAddresses) {
                                                            // Create a new object without the key to be deleted
                                                            const { [key]: removed, ...rest } = newSettings.depositAddresses;
                                                            console.log(`Removed address: ${removed}`); // Log removed address for debugging
                                                            newSettings.depositAddresses = rest;
                                                            setSettings(newSettings);
                                                            
                                                            // Update localStorage immediately
                                                            localStorage.setItem('adminSettings', JSON.stringify(newSettings));
                                                            toast.success(`${key} payment method removed successfully`);
                                                        }
                                                    }
                                                }}
                                                className="text-xs px-2 py-1 bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30 rounded-md transition-colors"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                        <div className="flex">
                                            <input
                                                type="text"
                                                name={`depositAddresses.${key}`}
                                                value={address}
                                                onChange={(e) => {
                                                    const newSettings = { ...settings };
                                                    if (!newSettings.depositAddresses) {
                                                        newSettings.depositAddresses = {};
                                                    }
                                                    newSettings.depositAddresses[key] = e.target.value;
                                                    setSettings(newSettings);
                                                    
                                                    // Update localStorage on each change
                                                    localStorage.setItem('adminSettings', JSON.stringify(newSettings));
                                                }}
                                                className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border border-slate-600"
                                            />
                                        </div>
                                    </div>
                                ))}
                                {(!settings.depositAddresses || Object.keys(settings.depositAddresses).length === 0) && (
                                    <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                                        <p className="text-yellow-400 text-sm">
                                            No deposit addresses configured. Add addresses for payment methods such as BINANCE, TRC20, BEP20, ERC20, etc.
                                        </p>
                                    </div>
                                )}
                                
                                {/* Add New Address Type Section */}
                                <div className="mt-6 border-t border-slate-700 pt-4">
                                    <h3 className="text-sm font-medium text-white mb-3">Add New Payment Method</h3>
                                    <div className="flex flex-col md:flex-row gap-4">
                                        <div className="md:flex-1">
                                            <input
                                                type="text"
                                                id="newAddressType"
                                                placeholder="Address Type (e.g., BITCOIN)"
                                                className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border border-slate-600"
                                            />
                                        </div>
                                        <div className="md:flex-1">
                                            <input
                                                type="text"
                                                id="newAddressValue"
                                                placeholder="Address Value"
                                                className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border border-slate-600"
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const type = document.getElementById('newAddressType')?.value?.trim();
                                                const value = document.getElementById('newAddressValue')?.value?.trim();
                                                
                                                if (type && value) {
                                                    const newSettings = { ...settings };
                                                    if (!newSettings.depositAddresses) {
                                                        newSettings.depositAddresses = {};
                                                    }
                                                    newSettings.depositAddresses[type.toUpperCase()] = value;
                                                    setSettings(newSettings);
                                                    
                                                    // Update localStorage immediately
                                                    localStorage.setItem('adminSettings', JSON.stringify(newSettings));
                                                    toast.success(`${type.toUpperCase()} payment method added successfully`);
                                                    
                                                    // Clear the input fields
                                                    if (document.getElementById('newAddressType')) {
                                                        document.getElementById('newAddressType').value = '';
                                                    }
                                                    if (document.getElementById('newAddressValue')) {
                                                        document.getElementById('newAddressValue').value = '';
                                                    }
                                                } else {
                                                    toast.warning('Please enter both the address type and value');
                                                }
                                            }}
                                            className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mt-1 md:mt-0"
                                        >
                                            Add Address
                                        </button>
                                    </div>
                                    <p className="text-xs text-slate-400 mt-2">
                                        Add new payment methods with their corresponding addresses. Type should be a short identifier like BITCOIN, LITECOIN, etc.
                                    </p>
                                </div>
                            </div>
                            
                            <div className="pt-4 border-t border-slate-700 mt-8">
                                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                                    <div className="text-sm text-gray-400">
                                        <p>Address changes will be immediately visible to users making deposits.</p>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isLoading}
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
                                            'Save Addresses'
                                        )}
                                    </button>
                                </div>
                            </div>
                        </form>
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