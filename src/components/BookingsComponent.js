import React, { useState } from 'react';
import { X, Plane, Train, Bus, Building, Calendar, Clock, User, MapPin, DollarSign, Info } from 'lucide-react';

export function BookingForm({ onClose, onSave }) {
    const [activeTab, setActiveTab] = useState('flight');
    const [formData, setFormData] = useState({
        reference: `BK-${Math.floor(10000 + Math.random() * 90000)}`,
        customer: '',
        type: 'flight',
        flight: '',
        train: '',
        bus: '',
        hotel: '',
        departure: '',
        arrival: '',
        date: '',
        returnDate: '',
        time: '',
        passengers: 1,
        rooms: 1,
        nights: 1,
        status: 'Pending',
        amount: '',
        email: '',
        phone: '',
        notes: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setFormData({ ...formData, type: tab });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const newBooking = {
            id: Date.now(),
            reference: formData.reference,
            customer: formData.customer,
            flight: activeTab === 'flight' ? formData.flight : '-',
            departure: formData.departure,
            arrival: formData.arrival,
            date: formData.date,
            status: formData.status,
            amount: `$${formData.amount}`
        };
        onSave(newBooking);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-screen overflow-y-auto">
                <div className="p-6 border-b sticky top-0 bg-white z-10">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold text-gray-800">New Booking</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>
                </div>

                {/* Booking Type Tabs */}
                <div className="border-b">
                    <div className="flex">
                        <button
                            className={`py-4 px-6 flex items-center ${activeTab === 'flight'
                                ? 'border-b-2 border-green-600 text-green-600'
                                : 'text-gray-500 hover:text-gray-700'}`}
                            onClick={() => handleTabChange('flight')}
                        >
                            <Plane className="h-5 w-5 mr-2" />
                            Flight
                        </button>
                        <button
                            className={`py-4 px-6 flex items-center ${activeTab === 'train'
                                ? 'border-b-2 border-green-600 text-green-600'
                                : 'text-gray-500 hover:text-gray-700'}`}
                            onClick={() => handleTabChange('train')}
                        >
                            <Train className="h-5 w-5 mr-2" />
                            Train
                        </button>
                        <button
                            className={`py-4 px-6 flex items-center ${activeTab === 'bus'
                                ? 'border-b-2 border-green-600 text-green-600'
                                : 'text-gray-500 hover:text-gray-700'}`}
                            onClick={() => handleTabChange('bus')}
                        >
                            <Bus className="h-5 w-5 mr-2" />
                            Bus
                        </button>
                        <button
                            className={`py-4 px-6 flex items-center ${activeTab === 'hotel'
                                ? 'border-b-2 border-green-600 text-green-600'
                                : 'text-gray-500 hover:text-gray-700'}`}
                            onClick={() => handleTabChange('hotel')}
                        >
                            <Building className="h-5 w-5 mr-2" />
                            Hotel
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    {/* Customer Information Section */}
                    <div className="mb-6">
                        <h3 className="text-lg font-medium mb-4 text-gray-700 flex items-center">
                            <User className="h-5 w-5 mr-2 text-green-600" />
                            Customer Information
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Customer Name
                                </label>
                                <input
                                    type="text"
                                    name="customer"
                                    value={formData.customer}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded-md"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded-md"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Phone
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded-md"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Booking Details Section */}
                    <div className="mb-6">
                        <h3 className="text-lg font-medium mb-4 text-gray-700 flex items-center">
                            <Info className="h-5 w-5 mr-2 text-green-600" />
                            Booking Details
                        </h3>

                        {activeTab === 'flight' && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Flight Number
                                    </label>
                                    <input
                                        type="text"
                                        name="flight"
                                        value={formData.flight}
                                        onChange={handleChange}
                                        className="w-full p-2 border rounded-md"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Departure Airport
                                    </label>
                                    <input
                                        type="text"
                                        name="departure"
                                        value={formData.departure}
                                        onChange={handleChange}
                                        className="w-full p-2 border rounded-md"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Arrival Airport
                                    </label>
                                    <input
                                        type="text"
                                        name="arrival"
                                        value={formData.arrival}
                                        onChange={handleChange}
                                        className="w-full p-2 border rounded-md"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Departure Date
                                    </label>
                                    <input
                                        type="date"
                                        name="date"
                                        value={formData.date}
                                        onChange={handleChange}
                                        className="w-full p-2 border rounded-md"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Return Date (Optional)
                                    </label>
                                    <input
                                        type="date"
                                        name="returnDate"
                                        value={formData.returnDate}
                                        onChange={handleChange}
                                        className="w-full p-2 border rounded-md"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Passengers
                                    </label>
                                    <input
                                        type="number"
                                        name="passengers"
                                        value={formData.passengers}
                                        onChange={handleChange}
                                        min="1"
                                        className="w-full p-2 border rounded-md"
                                    />
                                </div>
                            </div>
                        )}

                        {activeTab === 'train' && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Train Number
                                    </label>
                                    <input
                                        type="text"
                                        name="train"
                                        value={formData.train}
                                        onChange={handleChange}
                                        className="w-full p-2 border rounded-md"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Departure Station
                                    </label>
                                    <input
                                        type="text"
                                        name="departure"
                                        value={formData.departure}
                                        onChange={handleChange}
                                        className="w-full p-2 border rounded-md"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Arrival Station
                                    </label>
                                    <input
                                        type="text"
                                        name="arrival"
                                        value={formData.arrival}
                                        onChange={handleChange}
                                        className="w-full p-2 border rounded-md"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Date
                                    </label>
                                    <input
                                        type="date"
                                        name="date"
                                        value={formData.date}
                                        onChange={handleChange}
                                        className="w-full p-2 border rounded-md"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Time
                                    </label>
                                    <input
                                        type="time"
                                        name="time"
                                        value={formData.time}
                                        onChange={handleChange}
                                        className="w-full p-2 border rounded-md"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Passengers
                                    </label>
                                    <input
                                        type="number"
                                        name="passengers"
                                        value={formData.passengers}
                                        onChange={handleChange}
                                        min="1"
                                        className="w-full p-2 border rounded-md"
                                    />
                                </div>
                            </div>
                        )}

                        {activeTab === 'bus' && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Bus Number/Route
                                    </label>
                                    <input
                                        type="text"
                                        name="bus"
                                        value={formData.bus}
                                        onChange={handleChange}
                                        className="w-full p-2 border rounded-md"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Departure Station
                                    </label>
                                    <input
                                        type="text"
                                        name="departure"
                                        value={formData.departure}
                                        onChange={handleChange}
                                        className="w-full p-2 border rounded-md"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Destination
                                    </label>
                                    <input
                                        type="text"
                                        name="arrival"
                                        value={formData.arrival}
                                        onChange={handleChange}
                                        className="w-full p-2 border rounded-md"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Date
                                    </label>
                                    <input
                                        type="date"
                                        name="date"
                                        value={formData.date}
                                        onChange={handleChange}
                                        className="w-full p-2 border rounded-md"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Time
                                    </label>
                                    <input
                                        type="time"
                                        name="time"
                                        value={formData.time}
                                        onChange={handleChange}
                                        className="w-full p-2 border rounded-md"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Passengers
                                    </label>
                                    <input
                                        type="number"
                                        name="passengers"
                                        value={formData.passengers}
                                        onChange={handleChange}
                                        min="1"
                                        className="w-full p-2 border rounded-md"
                                    />
                                </div>
                            </div>
                        )}

                        {activeTab === 'hotel' && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Hotel Name
                                    </label>
                                    <input
                                        type="text"
                                        name="hotel"
                                        value={formData.hotel}
                                        onChange={handleChange}
                                        className="w-full p-2 border rounded-md"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Location
                                    </label>
                                    <input
                                        type="text"
                                        name="arrival"
                                        value={formData.arrival}
                                        onChange={handleChange}
                                        className="w-full p-2 border rounded-md"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Check-in Date
                                    </label>
                                    <input
                                        type="date"
                                        name="date"
                                        value={formData.date}
                                        onChange={handleChange}
                                        className="w-full p-2 border rounded-md"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Check-out Date
                                    </label>
                                    <input
                                        type="date"
                                        name="returnDate"
                                        value={formData.returnDate}
                                        onChange={handleChange}
                                        className="w-full p-2 border rounded-md"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Rooms
                                    </label>
                                    <input
                                        type="number"
                                        name="rooms"
                                        value={formData.rooms}
                                        onChange={handleChange}
                                        min="1"
                                        className="w-full p-2 border rounded-md"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Guests
                                    </label>
                                    <input
                                        type="number"
                                        name="passengers"
                                        value={formData.passengers}
                                        onChange={handleChange}
                                        min="1"
                                        className="w-full p-2 border rounded-md"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Payment Details */}
                    <div className="mb-6">
                        <h3 className="text-lg font-medium mb-4 text-gray-700 flex items-center">
                            <DollarSign className="h-5 w-5 mr-2 text-green-600" />
                            Payment Details
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Total Amount
                                </label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                                        $
                                    </span>
                                    <input
                                        type="number"
                                        name="amount"
                                        value={formData.amount}
                                        onChange={handleChange}
                                        className="w-full p-2 pl-8 border rounded-md"
                                        min="0"
                                        step="0.01"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Status
                                </label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded-md"
                                >
                                    <option value="Pending">Pending</option>
                                    <option value="Confirmed">Confirmed</option>
                                    <option value="Cancelled">Cancelled</option>
                                    <option value="Refunded">Refunded</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Reference Number
                                </label>
                                <input
                                    type="text"
                                    name="reference"
                                    value={formData.reference}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded-md bg-gray-50"
                                    readOnly
                                />
                            </div>
                        </div>
                    </div>

                    {/* Additional Notes */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Additional Notes
                        </label>
                        <textarea
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            className="w-full p-2 border rounded-md"
                            rows="3"
                        ></textarea>
                    </div>

                    {/* Form Actions */}
                    <div className="flex justify-end space-x-3 pt-4 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                        >
                            Save Booking
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}