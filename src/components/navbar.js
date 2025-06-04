import { useState } from "react";
import {
    LogIn,
    UserPlus,
    Plane,
    Hotel,
    TrainFront,
    BusFront,
    Menu,
    X,
    Globe
} from "lucide-react";
import { Link, Outlet, useLocation } from "react-router-dom";


const FloatingNavbar = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const navItems = [
        { id: 'flights', icon: Plane, label: "Flights", href: "/" },
        { id: 'hotels', icon: Hotel, label: "Hotels", href: "/hotels" },
        { id: 'trains', icon: TrainFront, label: "Trains", href: "/trains" },
        { id: 'buses', icon: BusFront, label: "Buses", href: "/buses" },
    ];

    const authItems = [
        // { id: 'login', icon: LogIn, label: "Login", href: "/login" },
        // { id: 'signup', icon: UserPlus, label: "Sign up", href: "/register" },
    ];

    const isActiveRoute = (href) => {
        return location.pathname === href;
    };

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };

    return (
        <div>
            {/* Navigation */}
            <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-200 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo */}
                        <div className="flex items-center">
                            <Link
                                to="/"
                                className="flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg"
                            >
                                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
                                    <Globe className="h-6 w-6 text-white" />
                                </div>
                                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                    TravelHub
                                </span>
                            </Link>
                        </div>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center space-x-8">
                            {navItems.map((item) => {
                                const IconComponent = item.icon;
                                const isActive = isActiveRoute(item.href);
                                return (
                                    <Link
                                        key={item.id}
                                        to={item.href}
                                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${isActive
                                                ? 'text-blue-600 bg-blue-50 shadow-sm'
                                                : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                                            }`}
                                    >
                                        <IconComponent className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                                        <span className="font-medium">{item.label}</span>
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Desktop Auth Buttons */}
                        <div className="hidden md:flex items-center space-x-4">
                            <Link
                                to="/login"
                                className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-blue-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg"
                            >
                                <LogIn className="h-4 w-4" />
                                <span className="font-medium">Login</span>
                            </Link>
                            <Link
                                to="/signup"
                                className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            >
                                <UserPlus className="h-4 w-4" />
                                <span className="font-medium">Sign up</span>
                            </Link>
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="md:hidden">
                            <button
                                onClick={toggleMobileMenu}
                                className="p-2 rounded-lg text-gray-700 hover:text-blue-600 hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
                            >
                                {isMobileMenuOpen ? (
                                    <X className="h-6 w-6" />
                                ) : (
                                    <Menu className="h-6 w-6" />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Mobile Menu */}
                    <div className={`md:hidden transition-all duration-300 ease-in-out ${isMobileMenuOpen
                            ? 'max-h-screen opacity-100 pb-4'
                            : 'max-h-0 opacity-0 overflow-hidden'
                        }`}>
                        <div className="pt-4 pb-2 space-y-2">
                            {/* Mobile Navigation Items */}
                            {navItems.map((item) => {
                                const IconComponent = item.icon;
                                const isActive = isActiveRoute(item.href);
                                return (
                                    <Link
                                        key={item.id}
                                        to={item.href}
                                        onClick={closeMobileMenu}
                                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${isActive
                                                ? 'text-blue-600 bg-blue-50'
                                                : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                                            }`}
                                    >
                                        <IconComponent className="h-5 w-5" />
                                        <span className="font-medium">{item.label}</span>
                                    </Link>
                                );
                            })}

                            {/* Mobile Auth Items */}
                            <div className="pt-4 mt-4 border-t border-gray-200 space-y-2">
                                {authItems.map((item) => {
                                    const IconComponent = item.icon;
                                    const isSignup = item.label === 'Sign up';
                                    return (
                                        <Link
                                            key={item.id}
                                            to={item.href}
                                            onClick={closeMobileMenu}
                                            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${isSignup
                                                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md hover:from-blue-700 hover:to-purple-700'
                                                    : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                                                }`}
                                        >
                                            <IconComponent className="h-5 w-5" />
                                            <span>{item.label}</span>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <div className="pt-16">
                <Outlet />
            </div>
        </div>
    );
};

export default FloatingNavbar;