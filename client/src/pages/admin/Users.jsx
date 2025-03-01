import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import AdminLayout from '../../components/admin/AdminLayout';
import useAdminStore from '../../store/useAdminStore';
import { MagnifyingGlassIcon, UserPlusIcon, PencilSquareIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';

function Users() {
    const { users, fetchAllUsers, createUser, deleteUser, updateUser } = useAdminStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        isAdmin: false,
        isAccountVerified: false,
        balance: 0
    });
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetchAllUsers();
    }, [fetchAllUsers]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            if (editingUser) {
                await updateUser(editingUser.id, formData);
                toast.success('User updated successfully');
            } else {
                await createUser(formData);
                toast.success('User created successfully');
            }
            setShowModal(false);
            setEditingUser(null);
            setFormData({
                name: '',
                email: '',
                password: '',
                isAdmin: false,
                isAccountVerified: false,
                balance: 0
            });
            fetchAllUsers();
        } catch (error) {
            toast.error(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (user) => {
        setEditingUser(user);
        setFormData({
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            isAccountVerified: user.isAccountVerified,
            balance: user.balance,
            password: '' // Leave password empty when editing
        });
        setShowModal(true);
    };

    const handleDelete = async (userId) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await deleteUser(userId);
                toast.success('User deleted successfully');
                fetchAllUsers();
            } catch (error) {
                toast.error(error.message);
            }
        }
    };

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Page Header */}
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6"
                >
                    <div>
                        <h1 className="text-2xl font-bold text-white">User Management</h1>
                        <p className="text-gray-400 mt-1">Manage all users and their permissions</p>
                    </div>
                    <div className="flex items-center gap-4 self-end sm:self-auto">
                        <div className="relative">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search users..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-64 pl-10 pr-4 py-2 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border border-slate-600"
                            />
                        </div>
                        <button
                            onClick={() => {
                                setEditingUser(null);
                                setFormData({
                                    name: '',
                                    email: '',
                                    password: '',
                                    isAdmin: false,
                                    isAccountVerified: false,
                                    balance: 0
                                });
                                setShowModal(true);
                            }}
                            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:from-blue-700 hover:to-blue-600 transition-all duration-200 flex items-center gap-2 shadow-lg shadow-blue-500/20"
                        >
                            <UserPlusIcon className="w-5 h-5" />
                            <span>Add User</span>
                        </button>
                    </div>
                </motion.div>

                {/* Users Table */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-slate-800 rounded-xl overflow-hidden shadow-xl border border-slate-700"
                >
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-gray-300">
                            <thead className="text-gray-400 bg-slate-700/50">
                                <tr>
                                    <th className="px-6 py-4 font-medium">Name</th>
                                    <th className="px-6 py-4 font-medium">Email</th>
                                    <th className="px-6 py-4 font-medium">Status</th>
                                    <th className="px-6 py-4 font-medium">Role</th>
                                    <th className="px-6 py-4 font-medium">Balance</th>
                                    <th className="px-6 py-4 font-medium">Total Investments</th>
                                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700">
                                {filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-8 text-center text-gray-400">
                                            {searchTerm ? 'No users match your search' : 'No users found'}
                                        </td>
                                    </tr>
                                ) : (
                                    filteredUsers.map((user) => (
                                        <tr key={user.id} className="hover:bg-slate-700/30 transition-colors">
                                            <td className="px-6 py-4 font-medium">{user.name}</td>
                                            <td className="px-6 py-4">{user.email}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                    user.isAccountVerified 
                                                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                                        : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                                                }`}>
                                                    {user.isAccountVerified ? 'Verified' : 'Pending'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                    user.isAdmin
                                                        ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                                                        : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                                }`}>
                                                    {user.isAdmin ? 'Admin' : 'User'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-medium">${parseFloat(user.balance).toFixed(2)}</td>
                                            <td className="px-6 py-4 font-medium">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                    parseFloat(user.totalInvestments) > 0
                                                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                                        : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                                                }`}>
                                                    ${user.totalInvestments}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right space-x-2">
                                                <button
                                                    onClick={() => handleEdit(user)}
                                                    className="px-3 py-1 rounded-md text-sm bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/30 transition-colors inline-flex items-center gap-1"
                                                >
                                                    <PencilSquareIcon className="w-4 h-4" />
                                                    <span>Edit</span>
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(user.id)}
                                                    className="px-3 py-1 rounded-md text-sm bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30 transition-colors inline-flex items-center gap-1"
                                                >
                                                    <TrashIcon className="w-4 h-4" />
                                                    <span>Delete</span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="px-6 py-4 bg-slate-700/30 border-t border-slate-700 text-gray-400 text-sm">
                        Showing {filteredUsers.length} of {users.length} users
                    </div>
                </motion.div>

                {/* User Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-slate-800 rounded-xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-700"
                        >
                            <div className="flex justify-between items-center px-6 py-4 bg-slate-700 border-b border-slate-600">
                                <h3 className="text-xl font-bold text-white">
                                    {editingUser ? 'Edit User' : 'Add New User'}
                                </h3>
                                <button 
                                    onClick={() => setShowModal(false)}
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    <XMarkIcon className="w-6 h-6" />
                                </button>
                            </div>
                            <div className="p-6">
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                                            className="w-full bg-slate-700 text-white p-3 rounded-lg mt-1 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                                            className="w-full bg-slate-700 text-white p-3 rounded-lg mt-1 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            required
                                        />
                                    </div>
                                    {!editingUser && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
                                            <input
                                                type="password"
                                                value={formData.password}
                                                onChange={(e) => setFormData({...formData, password: e.target.value})}
                                                className="w-full bg-slate-700 text-white p-3 rounded-lg mt-1 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                required
                                            />
                                        </div>
                                    )}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">Balance</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>
                                            <input
                                                type="number"
                                                value={formData.balance}
                                                onChange={(e) => setFormData({...formData, balance: parseFloat(e.target.value)})}
                                                className="w-full bg-slate-700 text-white p-3 pl-8 rounded-lg mt-1 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                step="0.01"
                                                required
                                            />
                                        </div>
                                    </div>
                                    
                                    {editingUser && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-1">Total Investments</label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>
                                                <input
                                                    type="text"
                                                    value={editingUser.totalInvestments}
                                                    className="w-full bg-slate-700/50 text-white p-3 pl-8 rounded-lg mt-1 border border-slate-600 focus:outline-none cursor-not-allowed"
                                                    disabled
                                                />
                                            </div>
                                            <p className="text-xs text-gray-400 mt-1">This field is read-only and shows the user&apos;s total approved investments.</p>
                                        </div>
                                    )}
                                    
                                    <div className="grid grid-cols-2 gap-4 mt-4">
                                        <label className="flex items-center p-3 bg-slate-700/50 rounded-lg border border-slate-600 cursor-pointer hover:bg-slate-700 transition-colors">
                                            <input
                                                type="checkbox"
                                                checked={formData.isAdmin}
                                                onChange={(e) => setFormData({...formData, isAdmin: e.target.checked})}
                                                className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-500 rounded"
                                            />
                                            <span className="text-sm text-gray-300">Admin Access</span>
                                        </label>
                                        <label className="flex items-center p-3 bg-slate-700/50 rounded-lg border border-slate-600 cursor-pointer hover:bg-slate-700 transition-colors">
                                            <input
                                                type="checkbox"
                                                checked={formData.isAccountVerified}
                                                onChange={(e) => setFormData({...formData, isAccountVerified: e.target.checked})}
                                                className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-500 rounded"
                                            />
                                            <span className="text-sm text-gray-300">Verified Account</span>
                                        </label>
                                    </div>
                                    <div className="flex justify-end space-x-3 mt-6">
                                        <button
                                            type="button"
                                            onClick={() => setShowModal(false)}
                                            className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:from-blue-700 hover:to-blue-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                        >
                                            {isLoading ? (
                                                <>
                                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Processing...
                                                </>
                                            ) : (
                                                <>{editingUser ? 'Update User' : 'Create User'}</>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}

export default Users; 