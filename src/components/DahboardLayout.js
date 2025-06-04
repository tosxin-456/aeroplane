import { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
    Plane,
    Home,
    Users,
    Calendar,
    Map,
    CreditCard,
    Settings,
    HelpCircle,
    LogOut,
    Menu,
    X,
    ChevronDown,
    ChevronRight,
    Building,
    Bus,
    Train,
    Globe,
    BookImageIcon
} from 'lucide-react';

export default function DashboardLayout() {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [userEmail, setUserEmail] = useState('');
    const [fullName, setFullName] = useState('');
    const [initials, setInitials] = useState('');
    const location = useLocation();
    const navigate = useNavigate();

    const Logout = () => {
        localStorage.clear();
        navigate('/');
    }

    useEffect(() => {
        // Retrieve user data from localStorage
        const email = localStorage.getItem('email') || 'user@skytravel.com';
        const name = localStorage.getItem('fullName') || 'Guest User';

        setUserEmail(email);
        setFullName(name);

        // Generate initials from full name
        const nameInitials = name.split(' ')
            .map(part => part[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
        setInitials(nameInitials);
    }, []);

    const navigation = [
        { name: 'Dashboard', icon: Home, path: '/dashboard', exact: true },
        { name: 'Travel Services', icon: Globe, path: '/dashboard/travel-services' },
        { name: 'Customers', icon: Users, path: '/dashboard/customers' },
        { name: 'Manual Booking', icon: BookImageIcon, path: '/dashboard/manual-book' }, // new item
        { name: 'Bookings', icon: Calendar, path: '/dashboard/bookings' },
        { name: 'Payments', icon: CreditCard, path: '/dashboard/payments' },
        { name: 'Settings', icon: Settings, path: '/dashboard/settings' },
    ];


    return (
        <div className="flex h-screen bg-gray-100">
            {/* Mobile sidebar overlay */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
          fixed inset-y-0 left-0 z-50 transform ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} 
          lg:translate-x-0 transition duration-300 ease-in-out
          ${collapsed ? 'lg:w-20' : 'lg:w-64'} 
          flex flex-col flex-shrink-0 bg-blue-800 text-white
          lg:static lg:h-full
        `}
            >
                {/* Logo */}
                <div className="flex items-center justify-between h-16 px-4 border-b border-blue-700">
                    <div className="flex items-center">
                        <Plane className="h-8 w-8 text-white" />
                        {!collapsed && <span className="ml-3 text-xl font-bold">Traversteries</span>}
                    </div>

                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="hidden lg:block p-1 rounded-md hover:bg-blue-700"
                    >
                        {collapsed ? <ChevronRight size={20} /> : <ChevronDown size={20} />}
                    </button>

                    <button
                        onClick={() => setMobileOpen(false)}
                        className="lg:hidden p-1 rounded-md hover:bg-blue-700"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Navigation Links */}
                <div className="flex-1 overflow-y-auto py-4">
                    <nav className="px-2 space-y-1">
                        {navigation.map((item) => {
                            // Check if the current path matches the navigation item
                            // For the dashboard home, we need exact match
                            // For other items, we check if the path starts with the item's path
                            const isActive = item.exact
                                ? location.pathname === item.path
                                : location.pathname.startsWith(item.path);

                            return (
                                <div key={item.name} className="mb-1">
                                    <NavLink
                                        to={item.path}
                                        onClick={() => setMobileOpen(false)}
                                        className={`
                                            flex items-center px-3 py-2 text-sm font-medium rounded-md
                                            ${isActive ? 'bg-blue-900 text-white' : 'text-blue-100 hover:bg-blue-700'}
                                            ${collapsed ? 'justify-center' : ''}
                                        `}
                                    >
                                        <item.icon className={`flex-shrink-0 h-6 w-6 ${isActive ? 'text-white' : 'text-blue-300'}`} />
                                        {!collapsed && <span className="ml-3">{item.name}</span>}
                                    </NavLink>
                                </div>
                            );
                        })}
                    </nav>
                </div>

                {/* User profile / Logout */}
                <div className="flex-shrink-0 flex flex-col p-4 border-t border-blue-700">
                    <div className={`flex ${collapsed ? 'justify-center' : 'items-center'} mb-4`}>
                        <div className="flex-shrink-0">
                            {/* User initials avatar instead of placeholder image */}
                            <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
                                {initials}
                            </div>
                        </div>
                        {!collapsed && (
                            <div className="ml-3">
                                <p className="text-sm font-medium text-white">{fullName}</p>
                                <p className="text-xs text-blue-300">{userEmail}</p>
                            </div>
                        )}
                    </div>
                    <button
                        className={`flex items-center text-blue-100 hover:bg-blue-700 rounded-md px-3 py-2 text-sm font-medium ${collapsed ? 'justify-center' : ''}`}
                        onClick={Logout}
                    >
                        <LogOut className="h-6 w-6 text-blue-300" />
                        {!collapsed && <span className="ml-3">Log out</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top Navigation */}
                <header className="bg-white shadow-sm z-10">
                    <div className="flex items-center justify-between h-16 px-4">
                        <button
                            className="lg:hidden p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100"
                            onClick={() => setMobileOpen(true)}
                        >
                            <Menu className="h-6 w-6" />
                        </button>

                        <div className="flex-1 px-4 flex justify-end lg:max-w-5xl lg:mx-auto">
                            <div className="ml-4 flex items-center md:ml-6">
                                {/* Notifications */}
                                <button className="p-1 rounded-full text-gray-500 hover:text-gray-600 focus:outline-none">
                                    <span className="sr-only">View notifications</span>
                                    <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-auto bg-gray-100">
                    <div className="py-6">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                            <Outlet />
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}