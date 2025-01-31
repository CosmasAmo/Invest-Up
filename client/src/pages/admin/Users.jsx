import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import AdminLayout from '../../components/admin/AdminLayout';
import useAdminStore from '../../store/useAdminStore';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

function Users() {
    const { users, fetchAllUsers, updateUserStatus } = useAdminStore();
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchAllUsers();
    }, [fetchAllUsers]);

    const filteredUsers = users.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleStatusChange = async (userId, isVerified) => {
        await updateUserStatus(userId, isVerified);
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Search Bar */}
                <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Users Table */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-800 rounded-lg overflow-hidden"
                >
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-gray-300">
                            <thead className="text-gray-400 bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3">Name</th>
                                    <th className="px-6 py-3">Email</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3">Referrals</th>
                                    <th className="px-6 py-3">Balance</th>
                                    <th className="px-6 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map((user) => (
                                    <tr key={user.id} className="border-t border-gray-700">
                                        <td className="px-6 py-4">{user.name}</td>
                                        <td className="px-6 py-4">{user.email}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs ${
                                                user.isAccountVerified 
                                                    ? 'bg-green-500/20 text-green-500'
                                                    : 'bg-yellow-500/20 text-yellow-500'
                                            }`}>
                                                {user.isAccountVerified ? 'Verified' : 'Pending'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">{user.referralCount}</td>
                                        <td className="px-6 py-4">${parseFloat(user.balance).toFixed(2)}</td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => handleStatusChange(user.id, !user.isAccountVerified)}
                                                className={`px-3 py-1 rounded-md text-sm ${
                                                    user.isAccountVerified
                                                        ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30'
                                                        : 'bg-green-500/20 text-green-500 hover:bg-green-500/30'
                                                }`}
                                            >
                                                {user.isAccountVerified ? 'Unverify' : 'Verify'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            </div>
        </AdminLayout>
    );
}

export default Users; 