import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
    ChartBarIcon, 
    UsersIcon, 
    Cog6ToothIcon, 
    ArrowRightOnRectangleIcon, 
    Bars3Icon, 
    XMarkIcon,
    BellIcon
} from '@heroicons/react/24/outline';
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import useStore from '../../store/useStore';
import useAdminStore from '../../store/useAdminStore';

const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: ChartBarIcon },
    { name: 'Users', href: '/admin/users', icon: UsersIcon },
    { name: 'Settings', href: '/admin/settings', icon: Cog6ToothIcon },
];

function AdminLayout({ children }) {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout, userData } = useStore();
    const { isLoading, error, unreadCount, fetchMessages } = useAdminStore();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        // Update time every minute
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 60000);

        // Fetch messages to get unread count
        fetchMessages();

        return () => clearInterval(timer);
    }, [fetchMessages]);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    if (error) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="bg-red-500/10 text-red-500 p-4 rounded-lg">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-900">
            {/* Mobile sidebar backdrop */}
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 lg:hidden z-40"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Top navigation bar */}
            <div className="fixed top-0 left-0 right-0 h-16 bg-slate-800 shadow-md z-30 lg:pl-64">
                <div className="flex items-center justify-between h-full px-4">
                    {/* Mobile menu button */}
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="p-2 rounded-lg bg-slate-700 text-gray-400 hover:bg-slate-600 lg:hidden"
                    >
                        {sidebarOpen ? (
                            <XMarkIcon className="h-6 w-6" />
                        ) : (
                            <Bars3Icon className="h-6 w-6" />
                        )}
                    </button>

                    <div className="flex-1 lg:flex lg:items-center lg:justify-between ml-4 lg:ml-0">
                        <div className="text-white font-medium hidden lg:block">
                            {currentTime.toLocaleDateString()} | {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        
                        <div className="flex items-center space-x-4">
                            {/* Notifications */}
                            <Link to="/admin/messages" className="relative p-2 text-gray-400 hover:text-white">
                                <BellIcon className="h-6 w-6" />
                                {unreadCount > 0 && (
                                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
                                        {unreadCount}
                                    </span>
                                )}
                            </Link>
                            
                            {/* Admin profile */}
                            <div className="flex items-center">
                                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                                    {userData?.name?.charAt(0) || 'A'}
                                </div>
                                <span className="ml-2 text-white hidden sm:inline-block">
                                    {userData?.name || 'Admin'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 w-64 bg-slate-800 shadow-lg transform transition-transform duration-300 ease-in-out z-50 lg:translate-x-0 ${
                sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}>
                <div className="flex h-16 items-center justify-center px-6 border-b border-slate-700">
                    <h1 className="text-xl font-bold text-white">Invest Up Admin</h1>
                </div>
                <div className="mt-6 px-4">
                    <div className="bg-slate-700/50 rounded-lg p-3 mb-6">
                        <p className="text-xs text-gray-400">Logged in as</p>
                        <p className="text-sm font-medium text-white">{userData?.email || 'admin@example.com'}</p>
                    </div>
                </div>
                <nav className="mt-2 px-2 space-y-1">
                    {navigation.map((item) => (
                        <Link
                            key={item.name}
                            to={item.href}
                            onClick={() => setSidebarOpen(false)}
                            className={`
                                flex items-center px-4 py-3 text-sm rounded-lg transition-colors
                                ${location.pathname === item.href
                                    ? 'bg-blue-600 text-white'
                                    : 'text-gray-300 hover:bg-slate-700 hover:text-white'}
                            `}
                        >
                            <item.icon className="mr-3 h-5 w-5" />
                            {item.name}
                        </Link>
                    ))}
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center px-4 py-3 text-sm text-gray-300 hover:bg-red-500/10 hover:text-red-400 rounded-lg transition-colors"
                    >
                        <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5" />
                        Logout
                    </button>
                </nav>
                
                <div className="absolute bottom-4 left-0 right-0 px-6">
                    <div className="bg-slate-700/30 rounded-lg p-3 text-center">
                        <p className="text-xs text-gray-400">© {new Date().getFullYear()} Invest Up</p>
                        <p className="text-xs text-gray-500">Admin Panel v1.0</p>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="lg:pl-64 pt-16">
                <main className="py-6 px-4 sm:px-6 lg:px-8">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
                            <div className="flex flex-col items-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                                <p className="text-gray-400">Loading data...</p>
                            </div>
                        </div>
                    ) : (
                        children
                    )}
                </main>
            </div>
        </div>
    );
}

AdminLayout.propTypes = {
    children: PropTypes.node.isRequired
};

export default AdminLayout; 