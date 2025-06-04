import React, { useState } from 'react';
import { Plane, LogOut, Search, Users, BookOpen } from 'lucide-react';

const DashboardUser = () => {
    const [bookings, setBookings] = useState([
        {
            id: 'FL001',
            airline: 'SkyWings Airlines',
            from: 'New York (JFK)',
            to: 'Los Angeles (LAX)',
            departure: '2024-06-15T10:30:00',
            arrival: '2024-06-15T13:45:00',
            passengers: 2,
            class: 'Economy',
            status: 'Confirmed',
            price: '$589'
        },
        {
            id: 'FL002',
            airline: 'Pacific Air',
            from: 'Los Angeles (LAX)',
            to: 'Tokyo (NRT)',
            departure: '2024-06-20T22:15:00',
            arrival: '2024-06-22T05:30:00',
            passengers: 1,
            class: 'Business',
            status: 'Pending',
            price: '$2,450'
        }
    ]);

    const [showBookingForm, setShowBookingForm] = useState(false);
    const [newBooking, setNewBooking] = useState({
        from: '',
        to: '',
        departure: '',
        passengers: 1,
        class: 'Economy'
    });

    // Mock user data
    const user = {
        firstName: 'John',
        lastName: 'Doe'
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const formatTime = (dateString) => {
        return new Date(dateString).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleBookingSubmit = (e) => {
        e.preventDefault();

        const booking = {
            id: `FL${String(bookings.length + 3).padStart(3, '0')}`,
            airline: 'SkyWings Airlines',
            from: newBooking.from,
            to: newBooking.to,
            departure: newBooking.departure,
            arrival: newBooking.departure, // Simplified for demo
            passengers: newBooking.passengers,
            class: newBooking.class,
            status: 'Pending',
            price: '$' + Math.floor(Math.random() * 1000 + 200)
        };

        setBookings([...bookings, booking]);
        setNewBooking({
            from: '',
            to: '',
            departure: '',
            passengers: 1,
            class: 'Economy'
        });
        setShowBookingForm(false);
    };

    const handleLogout = () => {
        alert('Logout functionality would be implemented here');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                <Plane className="w-6 h-6 text-white" />
                            </div>
                            <h1 className="text-xl font-bold text-gray-900">FlightBooker</h1>
                        </div>

                        <div className="flex items-center space-x-4">
                            <div className="text-sm text-gray-600">
                                Welcome, <span className="font-semibold">{user?.firstName} {user?.lastName}</span>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
                            >
                                <LogOut className="w-4 h-4" />
                                <span>Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Action Buttons */}
                <div className="mb-8 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-900">My Bookings</h2>
                    <button
                        onClick={() => setShowBookingForm(!showBookingForm)}
                        className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2"
                    >
                        <Search className="w-4 h-4" />
                        <span>{showBookingForm ? 'Cancel' : 'Book New Flight'}</span>
                    </button>
                </div>

                {/* New Booking Form */}
                {showBookingForm && (
                    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Book a New Flight</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">From</label>
                                <input
                                    type="text"
                                    value={newBooking.from}
                                    onChange={(e) => setNewBooking({ ...newBooking, from: e.target.value })}
                                    placeholder="New York (JFK)"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
                                <input
                                    type="text"
                                    value={newBooking.to}
                                    onChange={(e) => setNewBooking({ ...newBooking, to: e.target.value })}
                                    placeholder="Los Angeles (LAX)"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Departure</label>
                                <input
                                    type="datetime-local"
                                    value={newBooking.departure}
                                    onChange={(e) => setNewBooking({ ...newBooking, departure: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Passengers</label>
                                <select
                                    value={newBooking.passengers}
                                    onChange={(e) => setNewBooking({ ...newBooking, passengers: parseInt(e.target.value) })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    {[1, 2, 3, 4, 5, 6].map(num => (
                                        <option key={num} value={num}>{num} Passenger{num > 1 ? 's' : ''}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Class</label>
                                <select
                                    value={newBooking.class}
                                    onChange={(e) => setNewBooking({ ...newBooking, class: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="Economy">Economy</option>
                                    <option value="Premium Economy">Premium Economy</option>
                                    <option value="Business">Business</option>
                                    <option value="First Class">First Class</option>
                                </select>
                            </div>
                        </div>
                        <div className="mt-4 flex justify-end">
                            <button
                                onClick={handleBookingSubmit}
                                className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                            >
                                Search & Book Flight
                            </button>
                        </div>
                    </div>
                )}

                {/* Bookings List */}
                <div className="space-y-4">
                    {bookings.map((booking) => (
                        <div key={booking.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">{booking.airline}</h3>
                                        <p className="text-sm text-gray-600">Booking ID: {booking.id}</p>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${booking.status === 'Confirmed'
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {booking.status}
                                        </span>
                                        <span className="text-lg font-bold text-gray-900">{booking.price}</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {/* Flight Route */}
                                    <div className="flex items-center space-x-4">
                                        <div className="text-center">
                                            <p className="text-sm text-gray-600">From</p>
                                            <p className="font-semibold text-gray-900">{booking.from}</p>
                                            <p className="text-sm text-gray-600">{formatTime(booking.departure)}</p>
                                            <p className="text-xs text-gray-500">{formatDate(booking.departure)}</p>
                                        </div>
                                        <div className="flex-1 flex items-center justify-center">
                                            <div className="w-full h-px bg-gray-300 relative">
                                                <Plane className="w-5 h-5 text-blue-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white" />
                                            </div>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-sm text-gray-600">To</p>
                                            <p className="font-semibold text-gray-900">{booking.to}</p>
                                            <p className="text-sm text-gray-600">{formatTime(booking.arrival)}</p>
                                            <p className="text-xs text-gray-500">{formatDate(booking.arrival)}</p>
                                        </div>
                                    </div>

                                    {/* Booking Details */}
                                    <div className="flex items-center justify-center space-x-6">
                                        <div className="text-center">
                                            <Users className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                                            <p className="text-sm text-gray-600">Passengers</p>
                                            <p className="font-semibold text-gray-900">{booking.passengers}</p>
                                        </div>
                                        <div className="text-center">
                                            <BookOpen className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                                            <p className="text-sm text-gray-600">Class</p>
                                            <p className="font-semibold text-gray-900">{booking.class}</p>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center justify-end space-x-3">
                                        <button className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
                                            View Details
                                        </button>
                                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                            Manage Booking
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {bookings.length === 0 && (
                    <div className="text-center py-12">
                        <Plane className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Bookings Yet</h3>
                        <p className="text-gray-600 mb-6">Start planning your next adventure!</p>
                        <button
                            onClick={() => setShowBookingForm(true)}
                            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
                        >
                            Book Your First Flight
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DashboardUser;