import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import AdminLayout from '../../components/admin/AdminLayout';
import useAdminStore from '../../store/useAdminStore';
import useStore from '../../store/useStore';
import { 
    MagnifyingGlassIcon, UserPlusIcon, PencilSquareIcon, TrashIcon, XMarkIcon, 
    UserIcon, EnvelopeIcon, CreditCardIcon, CheckBadgeIcon, ShieldCheckIcon, 
    ArrowPathIcon, ChevronDownIcon, ChevronUpIcon, IdentificationIcon,
    ClockIcon, CurrencyDollarIcon, ArrowTrendingUpIcon, BanknotesIcon, UserCircleIcon,
    PhotoIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';
import axios from 'axios';

function Users() {
    const { users, fetchAllUsers, createUser, deleteUser, updateUser, fetchReferralCodes } = useAdminStore();
    const { isAdmin } = useStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        isAdmin: false,
        isAccountVerified: false,
        balance: 0,
        role: 'user',
        totalInvestments: 0,
        totalProfits: 0,
        totalWithdrawals: 0
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [expandedUser, setExpandedUser] = useState(null);
    const [referralCodes, setReferralCodes] = useState({});

    useEffect(() => {
        const loadData = async () => {
            await fetchAllUsers();
            const codes = await fetchReferralCodes();
            if (codes) {
                setReferralCodes(codes);
            }
        };
        loadData();
        
        // Check admin status
        if (!isAdmin) {
            toast.warning("You don't have admin privileges. Some actions may be restricted.", {
                autoClose: 5000,
                position: "top-center"
            });
        }
    }, [fetchAllUsers, fetchReferralCodes, isAdmin]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(''); // Clear previous errors
        try {
            // Ensure isAdmin flag is set based on role
            const userData = {
                ...formData,
                isAdmin: formData.role === 'admin'
            };
            
            // If editing an admin user, preserve their balance
            if (editingUser && userData.isAdmin && editingUser.balance) {
                userData.balance = editingUser.balance;
            }
            
            // If editing a user and password is empty, remove it from the data to be sent
            if (editingUser && (!userData.password || userData.password.trim() === '')) {
                delete userData.password;
            }
            
            console.log('Submitting user data:', userData);
            
            // Check if there's a profile image to upload
            const profileImageInput = document.getElementById('profileImage');
            const hasNewProfileImage = profileImageInput && profileImageInput.files && profileImageInput.files.length > 0;
            
            if (hasNewProfileImage) {
                // Create FormData for file upload
                const formDataWithImage = new FormData();
                
                // Add all user data to FormData
                Object.keys(userData).forEach(key => {
                    formDataWithImage.append(key, userData[key]);
                });
                
                // Add the profile image file
                formDataWithImage.append('profileImage', profileImageInput.files[0]);
                
                if (editingUser) {
                    await updateUser(editingUser.id, formDataWithImage, true); // true indicates multipart/form-data
                    toast.success('User updated successfully with new profile image');
                } else {
                    await createUser(formDataWithImage, true); // true indicates multipart/form-data
                    toast.success('User created successfully with profile image');
                }
            } else {
                // No new profile image, proceed with regular JSON data
                if (editingUser) {
                    await updateUser(editingUser.id, userData);
                    toast.success('User updated successfully');
                } else {
                    await createUser(userData);
                    toast.success('User created successfully');
                }
            }
            
            setShowModal(false);
            setEditingUser(null);
            setFormData({
                name: '',
                email: '',
                password: '',
                isAdmin: false,
                isAccountVerified: false,
                balance: 0,
                role: 'user',
                totalInvestments: 0,
                totalProfits: 0,
                totalWithdrawals: 0
            });
            
            // Force a complete refresh of the user list
            await fetchAllUsers();
            
            const codes = await fetchReferralCodes();
            if (codes) {
                setReferralCodes(codes);
            }
        } catch (error) {
            console.error('Error submitting user form:', error);
            setError(error.response?.data?.message || error.message || 'An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (user) => {
        console.log('Editing user:', user);
        setEditingUser(user);
        // Make sure to correctly set the role based on isAdmin
        setFormData({
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            isAccountVerified: user.isAccountVerified,
            balance: user.balance || 0,
            role: user.isAdmin ? 'admin' : 'user',
            password: '', // Leave password empty when editing
            totalInvestments: user.totalInvestments || 0,
            totalProfits: user.totalProfits || 0,
            totalWithdrawals: user.totalWithdrawals || 0
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

    const toggleUserExpand = (userId) => {
        if (expandedUser === userId) {
            setExpandedUser(null);
        } else {
            setExpandedUser(userId);
        }
    };

    const getUserReferralCode = (userId) => {
        return referralCodes[userId] || 'Loading...';
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
                        <div className="relative w-full sm:w-64 mx-auto">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search users..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border border-slate-600"
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
                                    balance: 0,
                                    role: 'user',
                                    totalInvestments: 0,
                                    totalProfits: 0,
                                    totalWithdrawals: 0
                                });
                                setShowModal(true);
                            }}
                            className="px-2 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:from-blue-700 hover:to-blue-600 transition-all duration-200 flex items-center gap-1 shadow-lg shadow-blue-500/20"
                        >
                            <UserPlusIcon className="w-5 h-5" />
                            <span>Add User</span>
                        </button>
                    </div>
                </motion.div>

                {/* Users Grid */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    {filteredUsers.length === 0 ? (
                        <div className="col-span-full bg-slate-800 rounded-xl p-8 text-center border border-slate-700">
                            <div className="mx-auto w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mb-4">
                                <UserIcon className="w-8 h-8 text-slate-400" />
                            </div>
                            <h3 className="text-xl font-medium text-white mb-2">No Users Found</h3>
                            <p className="text-slate-400">
                                {searchTerm ? 'No users match your search criteria.' : 'There are no users in the system yet.'}
                            </p>
                        </div>
                    ) : (
                        filteredUsers.map((user) => (
                            <motion.div
                                key={user.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                                className={`rounded-xl overflow-hidden shadow-xl border transition-all duration-300 ${
                                    user.isAdmin 
                                    ? 'bg-gradient-to-b from-purple-900/40 to-slate-900 border-purple-600/50 hover:border-purple-500/70 hover:shadow-purple-900/20' 
                                    : 'bg-gradient-to-b from-slate-800 to-slate-900 border-slate-700 hover:border-slate-600 hover:shadow-blue-900/10'
                                }`}
                            >
                                {/* User Card Header */}
                                <div className={`p-6 border-b ${
                                    user.isAdmin 
                                    ? 'bg-gradient-to-r from-purple-900/40 to-slate-800/40 border-purple-700/50' 
                                    : 'bg-gradient-to-r from-slate-700/30 to-slate-800/30 border-slate-700/50'
                                }`}>
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center space-x-3 max-w-[70%]">
                                            <div className={`min-w-[48px] h-12 w-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg overflow-hidden ${
                                                user.isAdmin 
                                                ? 'bg-gradient-to-br from-purple-600 to-indigo-700 shadow-purple-900/20' 
                                                : 'bg-gradient-to-br from-blue-600 to-indigo-700 shadow-blue-900/20'
                                            }`}>
                                                {user.profileImage ? (
                                                    <img 
                                                        src={`${axios.defaults.baseURL}/uploads/${user.profileImage}`} 
                                                        alt={user.name} 
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            e.target.onerror = null;
                                                            try {
                                                                // Store a reference to the parent node
                                                                const parentNode = e.target.parentNode;
                                                                
                                                                // Check if parent node exists
                                                                if (parentNode) {
                                                                    // Create a text node with the first letter
                                                                    const firstLetter = document.createTextNode(user.name.charAt(0).toUpperCase());
                                                                    
                                                                    // Clear the parent node
                                                                    parentNode.innerHTML = '';
                                                                    
                                                                    // Append the text node to the parent
                                                                    parentNode.appendChild(firstLetter);
                                                                }
                                                            } catch (err) {
                                                                console.error("Error handling image load failure:", err);
                                                            }
                                                        }}
                                                    />
                                                ) : (
                                                    user.name.charAt(0).toUpperCase()
                                                )}
                                            </div>
                                            <div className="overflow-hidden">
                                                <h3 className="text-lg font-semibold text-white mr-2 break-words">{user.name}</h3>
                                                <div className="flex items-center text-slate-400 text-sm mt-1">
                                                    <EnvelopeIcon className="w-4 h-4 mr-1 flex-shrink-0" />
                                                    <span className="truncate max-w-[180px]">{user.email}</span>
                                                </div>
                                            </div>
                                        </div>
                                            <div className="flex gap-2 ml-2 flex-shrink-0">
                                                <button
                                                    onClick={() => handleEdit(user)}
                                                    className="p-1.5 rounded-md bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/30 transition-colors"
                                                    title="Edit User"
                                                >
                                                    <PencilSquareIcon className="w-4 h-4" />
                                                </button>
                                            {!user.isAdmin && (
                                                <button
                                                    onClick={() => handleDelete(user.id)}
                                                    className="p-1.5 rounded-md bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30 transition-colors"
                                                    title="Delete User"
                                                >
                                                    <TrashIcon className="w-4 h-4" />
                                                </button>
                                            )}
                                            </div>
                                    </div>
                                </div>
                                
                                {/* User Card Body - Different for Admin and Regular Users */}
                                {user.isAdmin ? (
                                    /* Admin Card Body */
                                    <div className="p-6">
                                        {/* Status and Role for Admin */}
                                        <div className="grid grid-cols-2 gap-4 mb-4">
                                            <div className="bg-purple-900/20 p-3 rounded-lg border border-purple-700/40">
                                                <div className="text-xs text-purple-300 mb-1">Status</div>
                                                <div className="flex items-center">
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30 max-w-full overflow-hidden">
                                                        <CheckBadgeIcon className="w-3 h-3 mr-1 flex-shrink-0" />
                                                        <span className="truncate">Active</span>
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="bg-purple-900/20 p-3 rounded-lg border border-purple-700/40">
                                                <div className="text-xs text-purple-300 mb-1">Role</div>
                                                <div className="flex items-center">
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400 border border-purple-500/30 max-w-full overflow-hidden">
                                                        <ShieldCheckIcon className="w-3 h-3 mr-1 flex-shrink-0" />
                                                        <span className="truncate">Administrator</span>
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Admin Information Card */}
                                        <div className="p-4 rounded-lg border bg-purple-900/20 border-purple-700/40 mb-4">
                                            <div className="flex items-center mb-3">
                                                <ShieldCheckIcon className="w-5 h-5 mr-2 text-purple-400 flex-shrink-0" />
                                                <span className="text-purple-300 font-medium truncate">Administrator Privileges</span>
                                            </div>
                                            <p className="text-sm text-slate-400 mb-3">
                                                This user has full administrative access to the platform, including user management, transaction approvals, and system settings.
                                            </p>
                                            <div className="text-xs text-purple-300/70 mt-2">
                                                <div className="flex items-center mb-1">
                                                    <ClockIcon className="w-3 h-3 mr-1 flex-shrink-0" />
                                                    <span className="truncate">Created: {new Date(user.createdAt).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}</span>
                                                </div>
                                                <div className="flex items-center">
                                                    <IdentificationIcon className="w-3 h-3 mr-1 flex-shrink-0" />
                                                    <span className="truncate">ID: {user.id.substring(0, 8)}...</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    /* Regular User Card Body */
                                    <div className="p-6">
                                        <div className="grid grid-cols-2 gap-4 mb-4">
                                            <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                                                <div className="text-xs text-slate-400 mb-1">Status</div>
                                                <div className="flex items-center">
                                                    <span className={`
                                                        inline-flex items-center px-2 py-1 rounded-full text-xs font-medium max-w-full overflow-hidden
                                                        ${user.isAccountVerified 
                                                            ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                                                            : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                                                        }
                                                    `}>
                                                        {user.isAccountVerified 
                                                            ? <><CheckBadgeIcon className="w-3 h-3 mr-1 flex-shrink-0" /><span className="truncate">Verified</span></>
                                                            : <><ClockIcon className="w-3 h-3 mr-1 flex-shrink-0" /><span className="truncate">Pending</span></>
                                                        }
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                                                <div className="text-xs text-slate-400 mb-1">Role</div>
                                                <div className="flex items-center">
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30 max-w-full overflow-hidden">
                                                        <UserCircleIcon className="w-3 h-3 mr-1 flex-shrink-0" />
                                                        <span className="truncate">Regular User</span>
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 mb-4">
                                            <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                                                <div className="text-xs text-slate-400 mb-1">Balance</div>
                                                <div className="flex items-center">
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30 max-w-full overflow-hidden">
                                                        <CreditCardIcon className="w-3 h-3 mr-1 flex-shrink-0" />
                                                        <span className="truncate">${(user.balance ? parseFloat(user.balance) : 0).toFixed(2)}</span>
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                                                <div className="text-xs text-slate-400 mb-1">Total Investments</div>
                                                <div className="flex items-center">
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30 max-w-full overflow-hidden">
                                                        <CurrencyDollarIcon className="w-3 h-3 mr-1 flex-shrink-0" />
                                                        <span className="truncate">${user.totalInvestments || '0.00'}</span>
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 mb-4">
                                            <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                                                <div className="text-xs text-slate-400 mb-1">Total Profits</div>
                                                <div className="flex items-center">
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 max-w-full overflow-hidden">
                                                        <ArrowTrendingUpIcon className="w-3 h-3 mr-1 flex-shrink-0" />
                                                        <span className="truncate">${user.totalProfits || '0.00'}</span>
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                                                <div className="text-xs text-slate-400 mb-1">Total Withdrawals</div>
                                                <div className="flex items-center">
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-500/20 text-amber-400 border border-amber-500/30 max-w-full overflow-hidden">
                                                        <BanknotesIcon className="w-3 h-3 mr-1 flex-shrink-0" />
                                                        <span className="truncate">${user.totalWithdrawals || '0.00'}</span>
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* User Details */}
                                        <div className="mb-4">
                                            <button 
                                                onClick={() => toggleUserExpand(user.id)}
                                                className="w-full flex justify-between items-center p-3 bg-slate-800/50 rounded-lg border border-slate-700/50 hover:bg-slate-800 transition-colors"
                                            >
                                                <span className="text-sm font-medium text-slate-300">User Details</span>
                                                {expandedUser === user.id ? (
                                                    <ChevronUpIcon className="w-4 h-4 text-slate-400" />
                                                ) : (
                                                    <ChevronDownIcon className="w-4 h-4 text-slate-400" />
                                                )}
                                            </button>
                                            
                                            {expandedUser === user.id && (
                                                <div className="mt-3 p-4 bg-slate-800/30 rounded-lg border border-slate-700/50">
                                                    <div className="space-y-3 text-sm">
                                                        <div className="flex justify-between">
                                                            <span className="text-slate-400">User ID:</span>
                                                            <span className="text-slate-300 truncate ml-2 text-right max-w-[150px]">{user.id.substring(0, 8)}...</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-slate-400">Created:</span>
                                                            <span className="text-slate-300 truncate ml-2 text-right max-w-[150px]">
                                                                {new Date(user.createdAt).toLocaleDateString('en-US', {
                                                                    year: 'numeric',
                                                                    month: 'long',
                                                                    day: 'numeric'
                                                                })}
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-slate-400">Referral Code:</span>
                                                            <span className="text-slate-300 truncate ml-2 text-right max-w-[150px]">{getUserReferralCode(user.id)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        ))
                    )}
                </motion.div>
            </div>

            {/* Add/Edit User Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-slate-800 rounded-xl shadow-2xl w-full max-w-md border border-slate-700 overflow-hidden max-h-[90vh] flex flex-col"
                    >
                        <div className="p-6 border-b border-slate-700 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-white">
                                {editingUser ? 'Edit User' : 'Add New User'}
                            </h3>
                            <button 
                                onClick={() => setShowModal(false)}
                                className="p-1 rounded-md hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                            >
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
                            {error && (
                                <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
                                    {error}
                                </div>
                            )}
                            
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border border-slate-600"
                                    required
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border border-slate-600"
                                    required
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Profile Image</label>
                                <div className="flex items-center space-x-4">
                                    <div className="w-16 h-16 rounded-full bg-slate-700 flex items-center justify-center overflow-hidden border border-slate-600 profile-preview">
                                        {editingUser && editingUser.profileImage ? (
                                            <img 
                                                src={`${axios.defaults.baseURL}/uploads/${editingUser.profileImage}`} 
                                                alt="Profile" 
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    try {
                                                        // Store a reference to the parent node
                                                        const parentNode = e.target.parentNode;
                                                        
                                                        // Check if parent node exists
                                                        if (parentNode) {
                                                            // Create a text node with the first letter
                                                            const firstLetter = document.createTextNode(editingUser.name.charAt(0).toUpperCase());
                                                            
                                                            // Clear the parent node
                                                            parentNode.innerHTML = '';
                                                            
                                                            // Append the text node to the parent
                                                            parentNode.appendChild(firstLetter);
                                                        }
                                                    } catch (err) {
                                                        console.error("Error handling image load failure:", err);
                                                    }
                                                }}
                                            />
                                        ) : (
                                            <PhotoIcon className="w-8 h-8 text-slate-500" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <input
                                            type="file"
                                            id="profileImage"
                                            accept="image/*"
                                            onChange={(e) => {
                                                const file = e.target.files[0];
                                                if (file) {
                                                    const reader = new FileReader();
                                                    reader.onloadend = () => {
                                                        try {
                                                            const previewDiv = document.querySelector('.profile-preview');
                                                            if (previewDiv) {
                                                                // Simplest and most reliable way to clear and set content
                                                                previewDiv.innerHTML = '';
                                                                
                                                                // Create a new image element
                                                                const img = document.createElement('img');
                                                                img.src = reader.result;
                                                                img.alt = 'Preview';
                                                                img.className = 'w-full h-full object-cover';
                                                                
                                                                // Append the image to the preview div
                                                                previewDiv.appendChild(img);
                                                            }
                                                        } catch (err) {
                                                            console.error("Error updating profile preview:", err);
                                                        }
                                                    };
                                                    reader.readAsDataURL(file);
                                                }
                                            }}
                                            className="hidden"
                                        />
                                        <label 
                                            htmlFor="profileImage"
                                            className="inline-block px-3 py-2 bg-slate-700 text-slate-300 rounded-lg border border-slate-600 hover:bg-slate-600 cursor-pointer text-sm"
                                        >
                                            Choose Image
                                        </label>
                                        <p className="mt-1 text-xs text-slate-400">
                                            {editingUser ? "Upload a new image or leave empty to keep current" : "Optional profile image"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">
                                    {editingUser ? 'New Password (leave blank to keep current)' : 'Password'}
                                </label>
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                                    className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border border-slate-600"
                                    required={!editingUser}
                                    placeholder={editingUser ? "Enter new password or leave blank" : "Enter password"}
                                />
                                {editingUser && (
                                    <p className="mt-1 text-xs text-slate-400">
                                        Only enter a password if you want to change the current one.
                                    </p>
                                )}
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Role</label>
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                                    className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border border-slate-600"
                                >
                                    <option value="user">Regular User</option>
                                    <option value="admin">Administrator</option>
                                </select>
                            </div>
                            
                            {formData.role !== 'admin' && (
                                <>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Balance</label>
                                    <input
                                        type="number"
                                        value={formData.balance}
                                        onChange={(e) => setFormData({...formData, balance: parseFloat(e.target.value)})}
                                        className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border border-slate-600"
                                        step="0.01"
                                        min="0"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Total Investments</label>
                                    <input
                                        type="number"
                                        value={formData.totalInvestments}
                                        onChange={(e) => setFormData({...formData, totalInvestments: parseFloat(e.target.value)})}
                                        className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border border-slate-600"
                                        step="0.01"
                                        min="0"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Total Profits</label>
                                    <input
                                        type="number"
                                        value={formData.totalProfits}
                                        onChange={(e) => setFormData({...formData, totalProfits: parseFloat(e.target.value)})}
                                        className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border border-slate-600"
                                        step="0.01"
                                        min="0"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Total Withdrawals</label>
                                    <input
                                        type="number"
                                        value={formData.totalWithdrawals}
                                        onChange={(e) => setFormData({...formData, totalWithdrawals: parseFloat(e.target.value)})}
                                        className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border border-slate-600"
                                        step="0.01"
                                        min="0"
                                    />
                                </div>
                                </>
                            )}
                            
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="isAccountVerified"
                                    checked={formData.isAccountVerified}
                                    onChange={(e) => setFormData({...formData, isAccountVerified: e.target.checked})}
                                    className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500"
                                />
                                <label htmlFor="isAccountVerified" className="ml-2 text-sm font-medium text-slate-300">
                                    Account Verified
                                </label>
                            </div>
                            
                            <div className="pt-4 flex justify-end space-x-3 border-t border-slate-700 mt-6 sticky bottom-0 bg-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-all duration-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:from-blue-700 hover:to-blue-600 transition-all duration-200 flex items-center gap-2 disabled:opacity-70"
                                >
                                    {isLoading && <ArrowPathIcon className="w-4 h-4 animate-spin" />}
                                    {editingUser ? 'Update User' : 'Create User'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AdminLayout>
    );
}

export default Users;
