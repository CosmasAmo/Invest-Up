import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ChartBarIcon, UsersIcon, Cog6ToothIcon, ArrowRightOnRectangleIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
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
    const { logout } = useStore();
    const { isLoading, error } = useAdminStore();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    if (error) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="bg-red-500/10 text-red-500 p-4 rounded-lg">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900">
            {/* Mobile sidebar backdrop */}
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 lg:hidden z-40"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Mobile menu button */}
            <div className="lg:hidden fixed top-4 left-4 z-50">
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:bg-gray-700"
                >
                    {sidebarOpen ? (
                        <XMarkIcon className="h-6 w-6" />
                    ) : (
                        <Bars3Icon className="h-6 w-6" />
                    )}
                </button>
            </div>

            {/* Sidebar */}
            <div className={`fixed inset-y-6 left-4 w-64 bg-gray-800 transform transition-transform duration-300 ease-in-out z-50 lg:translate-x-0 ${
                sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}>
                <div className="flex h-16 items-center justify-between px-6">
                    <h1 className="text-xl font-bold text-white">Admin Panel</h1>
                </div>
                <nav className="mt-6">
                    {navigation.map((item) => (
                        <Link
                            key={item.name}
                            to={item.href}
                            onClick={() => setSidebarOpen(false)}
                            className={`
                                flex items-center px-6 py-3 text-sm
                                ${location.pathname === item.href
                                    ? 'bg-gray-900 text-white'
                                    : 'text-gray-400 hover:bg-gray-700 hover:text-white'}
                            `}
                        >
                            <item.icon className="mr-3 h-6 w-6" />
                            {item.name}
                        </Link>
                    ))}
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center px-6 py-3 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-500"
                    >
                        <ArrowRightOnRectangleIcon className="mr-3 h-6 w-6" />
                        Logout
                    </button>
                </nav>
            </div>

            {/* Main content */}
            <div className="lg:pl-64 flex-1">
                <main className="py-6 px-4 sm:px-6 lg:px-8">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-screen">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                        </div>
                    ) : (
                        children
                    )}
                </main>
            </div>
        </div>
    );
}

export default AdminLayout; 