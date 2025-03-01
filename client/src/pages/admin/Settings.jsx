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
        referralsRequired: 2
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
                setSettings(response.data.settings);
            }
        } catch (error) {
            console.error('Failed to fetch settings:', error);
            // If API fails, try to load from localStorage as fallback
            try {
                const savedSettings = localStorage.getItem('adminSettings');
                if (savedSettings) {
                    setSettings(JSON.parse(savedSettings));
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
            referralsRequired: 2
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
                            </ul>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AdminLayout>
    );
}

export default Settings; 