import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import PropTypes from 'prop-types';
import useStore from '../store/useStore';
import Navbar from './navbar';
import { 
    HomeIcon, 
    CreditCardIcon, 
    BanknotesIcon, 
    ArrowUpTrayIcon, 
    UserIcon, 
    EnvelopeIcon
} from '@heroicons/react/24/outline';

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Deposit', href: '/deposit', icon: CreditCardIcon },
    { name: 'Investments', href: '/investments', icon: BanknotesIcon },
    { name: 'Withdraw', href: '/withdraw', icon: ArrowUpTrayIcon },
    { name: 'Profile', href: '/profile', icon: UserIcon },
    { name: 'Messages', href: '/messages', icon: EnvelopeIcon },
];

function DashboardLayout({ children }) {
    const location = useLocation();
    const { userData } = useStore();
    const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
    
    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
            <Navbar />
            
            {/* Mobile menu backdrop */}
            {isMobileNavOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setIsMobileNavOpen(false)}
                />
            )}
            
            <div className="flex">
                {/* Sidebar for larger screens */}
                <div className="hidden md:flex md:w-64 md:flex-col fixed inset-y-0 pt-16">
                    <div className="flex-1 flex flex-col min-h-0 bg-slate-800/50 backdrop-blur-sm border-r border-slate-700/50">
                        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
                            <div className="mt-5 px-2 space-y-1">
                                {navigation.map((item) => (
                                    <Link
                                        key={item.name}
                                        to={item.href}
                                        className={`
                                            flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
                                            ${location.pathname === item.href
                                                ? 'bg-blue-600 text-white'
                                                : 'text-gray-300 hover:bg-slate-700/70 hover:text-white'}
                                        `}
                                    >
                                        <item.icon className="mr-3 h-5 w-5" />
                                        {item.name}
                                    </Link>
                                ))}
                            </div>
                        </div>
                        <div className="flex-shrink-0 flex border-t border-slate-700/50 p-4">
                            <div className="flex-shrink-0 w-full block">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        {userData?.profileImage ? (
                                            <img
                                                className="h-8 w-8 rounded-full"
                                                src={userData.profileImage}
                                                alt={userData.name}
                                            />
                                        ) : (
                                            <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                                                <span className="text-white text-sm font-medium">
                                                    {userData?.name?.[0] || 'U'}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm font-medium text-white">
                                            {userData?.name || 'User'}
                                        </p>
                                        <p className="text-xs text-gray-400 truncate w-32">
                                            {userData?.email || 'user@example.com'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Mobile Navigation Bar */}
                <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-slate-800/90 backdrop-blur-sm border-t border-slate-700/50">
                    <div className="flex justify-around">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                to={item.href}
                                className={`
                                    flex flex-col items-center p-3 rounded-md transition-colors
                                    ${location.pathname === item.href
                                        ? 'text-blue-400'
                                        : 'text-gray-400 hover:text-white'}
                                `}
                            >
                                <item.icon className="h-5 w-5" />
                                <span className="text-xs mt-1">{item.name}</span>
                            </Link>
                        ))}
                    </div>
                </div>
                
                {/* Main content */}
                <div className="flex-1 md:pl-64 pt-16 pb-20 md:pb-0">
                    <main className="py-6 px-4 sm:px-6 lg:px-8">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
}

DashboardLayout.propTypes = {
    children: PropTypes.node.isRequired
};

export default DashboardLayout; 