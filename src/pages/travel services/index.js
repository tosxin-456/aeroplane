import { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Plane, Building, Bus, Train, Menu, X } from 'lucide-react';

export default function TravelServicesPage() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const location = useLocation();

    const tabs = [
        { id: 'flights', name: 'Flights', icon: Plane },
        { id: 'hotels', name: 'Hotels', icon: Building },
        { id: 'buses', name: 'Buses', icon: Bus },
        { id: 'trains', name: 'Trains', icon: Train },
    ];

    const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen);
    };

    return (
        <div className="bg-white rounded-lg shadow overflow-hidden max-w-7xl mx-auto">
            <div className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Travel Services</h1>
                        <p className="mt-1 text-sm sm:text-base text-gray-600">Find and manage travel bookings for your customers</p>
                    </div>

                    {/* Mobile menu button */}
                    <button
                        type="button"
                        className="lg:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onClick={toggleMobileMenu}
                        aria-expanded={mobileMenuOpen}
                    >
                        <span className="sr-only">{mobileMenuOpen ? 'Close menu' : 'Open menu'}</span>
                        {mobileMenuOpen ? (
                            <X className="block h-6 w-6" aria-hidden="true" />
                        ) : (
                            <Menu className="block h-6 w-6" aria-hidden="true" />
                        )}
                    </button>
                </div>
            </div>

            {/* Desktop Navigation Tabs */}
            <div className="hidden lg:block border-b border-gray-200">
                <nav className="flex -mb-px">
                    {tabs.map((tab) => {
                        const isActive = location.pathname.includes(`/${tab.id}`);
                        return (
                            <NavLink
                                key={tab.id}
                                to={`/dashboard/travel-services/${tab.id}`}
                                className={`
                                    group inline-flex items-center px-4 py-3 sm:px-6 sm:py-4 border-b-2 font-medium text-sm
                                    ${isActive
                                        ? 'border-blue-600 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                                    transition-colors duration-200
                                `}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <tab.icon className="mr-2 h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" aria-hidden="true" />
                                {tab.name}
                            </NavLink>
                        );
                    })}
                </nav>
            </div>

            {/* Mobile Navigation Menu */}
            {mobileMenuOpen && (
                <div className="lg:hidden border-b border-gray-200">
                    <nav className="flex flex-col">
                        {tabs.map((tab) => {
                            const isActive = location.pathname.includes(`/${tab.id}`);
                            return (
                                <NavLink
                                    key={tab.id}
                                    to={`/dashboard/travel-services/${tab.id}`}
                                    className={`
                                        flex items-center px-4 py-3 font-medium text-sm
                                        ${isActive
                                            ? 'bg-blue-50 text-blue-600'
                                            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'}
                                        transition-colors duration-200
                                    `}
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    <tab.icon className="mr-3 h-5 w-5 flex-shrink-0" aria-hidden="true" />
                                    {tab.name}
                                </NavLink>
                            );
                        })}
                    </nav>
                </div>
            )}

            {/* Content Area with improved padding on mobile */}
            <div className="p-4 sm:p-6">
                <div className="animate-fadeIn">
                    <Outlet />
                </div>
            </div>

            {/* Add a simple footer */}
            <div className="border-t border-gray-200 px-4 py-4 sm:px-6 mt-6">
                <p className="text-sm text-gray-500 text-center">
                    © {new Date().getFullYear()} Your Travel Company. All rights reserved.
                </p>
            </div>
        </div>
    );
}