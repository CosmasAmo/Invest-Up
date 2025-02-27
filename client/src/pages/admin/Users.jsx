import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import AdminLayout from '../../components/admin/AdminLayout';
import useAdminStore from '../../store/useAdminStore';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
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

    useEffect(() => {
        fetchAllUsers();
    }, [fetchAllUsers]);

    const handleSubmit = async (e) => {
        e.preventDefault();
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

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div className="relative w-64">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Add New User
                    </button>
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
                                    <th className="px-6 py-3">Role</th>
                                    <th className="px-6 py-3">Balance</th>
                                    <th className="px-6 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.filter(user =>
                                    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                    user.email.toLowerCase().includes(searchTerm.toLowerCase())
                                ).map((user) => (
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
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs ${
                                                user.isAdmin
                                                    ? 'bg-purple-500/20 text-purple-500'
                                                    : 'bg-blue-500/20 text-blue-500'
                                            }`}>
                                                {user.isAdmin ? 'Admin' : 'User'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">${parseFloat(user.balance).toFixed(2)}</td>
                                        <td className="px-6 py-4 space-x-2">
                                            <button
                                                onClick={() => handleEdit(user)}
                                                className="px-3 py-1 rounded-md text-sm bg-blue-500/20 text-blue-500 hover:bg-blue-500/30"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(user.id)}
                                                className="px-3 py-1 rounded-md text-sm bg-red-500/20 text-red-500 hover:bg-red-500/30"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>

                {/* User Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
                        <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
                            <h3 className="text-xl font-bold mb-4">
                                {editingUser ? 'Edit User' : 'Add New User'}
                            </h3>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400">Name</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        className="w-full bg-gray-700 text-white p-2 rounded-lg mt-1"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400">Email</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                                        className="w-full bg-gray-700 text-white p-2 rounded-lg mt-1"
                                        required
                                    />
                                </div>
                                {!editingUser && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400">Password</label>
                                        <input
                                            type="password"
                                            value={formData.password}
                                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                                            className="w-full bg-gray-700 text-white p-2 rounded-lg mt-1"
                                            required
                                        />
                                    </div>
                                )}
                                <div>
                                    <label className="block text-sm font-medium text-gray-400">Balance</label>
                                    <input
                                        type="number"
                                        value={formData.balance}
                                        onChange={(e) => setFormData({...formData, balance: parseFloat(e.target.value)})}
                                        className="w-full bg-gray-700 text-white p-2 rounded-lg mt-1"
                                        step="0.01"
                                        required
                                    />
                                </div>
                                <div className="flex items-center space-x-4">
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={formData.isAdmin}
                                            onChange={(e) => setFormData({...formData, isAdmin: e.target.checked})}
                                            className="mr-2"
                                        />
                                        <span className="text-sm text-gray-400">Admin</span>
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={formData.isAccountVerified}
                                            onChange={(e) => setFormData({...formData, isAccountVerified: e.target.checked})}
                                            className="mr-2"
                                        />
                                        <span className="text-sm text-gray-400">Verified</span>
                                    </label>
                                </div>
                                <div className="flex justify-end space-x-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700"
                                    >
                                        {editingUser ? 'Update' : 'Create'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}

export default Users; 