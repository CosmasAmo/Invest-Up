import { useState } from 'react';
import { motion } from 'framer-motion';
import AdminLayout from '../../components/admin/AdminLayout';
import { toast } from 'react-toastify';

function Settings() {
    const [settings, setSettings] = useState({
        referralBonus: 20,
        minWithdrawal: 50,
        minDeposit: 10
    });

    const handleChange = (e) => {
        setSettings({
            ...settings,
            [e.target.name]: parseFloat(e.target.value)
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // TODO: Implement settings update
        toast.success('Settings updated successfully');
    };

    return (
        <AdminLayout>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-2xl mx-auto"
            >
                <div className="bg-gray-800 rounded-lg p-6">
                    <h2 className="text-xl font-bold text-white mb-6">System Settings</h2>
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-gray-400 mb-2">
                                Referral Bonus ($)
                            </label>
                            <input
                                type="number"
                                name="referralBonus"
                                value={settings.referralBonus}
                                onChange={handleChange}
                                className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-gray-400 mb-2">
                                Minimum Withdrawal ($)
                            </label>
                            <input
                                type="number"
                                name="minWithdrawal"
                                value={settings.minWithdrawal}
                                onChange={handleChange}
                                className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-gray-400 mb-2">
                                Minimum Deposit ($)
                            </label>
                            <input
                                type="number"
                                name="minDeposit"
                                value={settings.minDeposit}
                                onChange={handleChange}
                                className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors duration-200"
                        >
                            Save Settings
                        </button>
                    </form>
                </div>
            </motion.div>
        </AdminLayout>
    );
}

export default Settings; 