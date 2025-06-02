import React, { useState } from 'react';
import { Plane, Bus, Train, Building, Filter, Search, Plus, ArrowUpDown, Edit, Trash2, MoreHorizontal, Menu } from 'lucide-react';

export default function EuropeTravelManagement() {
    const [activeTab, setActiveTab] = useState('flights');
    const [searchTerm, setSearchTerm] = useState('');

    // Sample data for each transportation type
    const flights = [
        { id: 1, flightNumber: 'FL1234', departure: 'Paris (CDG)', arrival: 'Berlin (BER)', date: '2025-04-20', status: 'On Time', price: '€250' },
        { id: 2, flightNumber: 'FL5678', departure: 'Madrid (MAD)', arrival: 'Rome (FCO)', date: '2025-04-21', status: 'Delayed', price: '€180' },
        { id: 3, flightNumber: 'FL9012', departure: 'London (LHR)', arrival: 'Amsterdam (AMS)', date: '2025-04-22', status: 'On Time', price: '€120' },
        { id: 4, flightNumber: 'FL3456', departure: 'Vienna (VIE)', arrival: 'Prague (PRG)', date: '2025-04-23', status: 'Boarding', price: '€130' },
        { id: 5, flightNumber: 'FL7890', departure: 'Brussels (BRU)', arrival: 'Barcelona (BCN)', date: '2025-04-24', status: 'Cancelled', price: '€200' },
    ];

    const trains = [
        { id: 1, trainNumber: 'EUR1234', departure: 'Paris Gare du Nord', arrival: 'Brussels Midi', date: '2025-04-20', status: 'On Time', price: '€80' },
        { id: 2, trainNumber: 'EUR5678', departure: 'Amsterdam Centraal', arrival: 'Berlin Hauptbahnhof', date: '2025-04-21', status: 'Delayed', price: '€110' },
        { id: 3, trainNumber: 'EUR9012', departure: 'Madrid Atocha', arrival: 'Barcelona Sants', date: '2025-04-22', status: 'On Time', price: '€60' },
        { id: 4, trainNumber: 'EUR3456', departure: 'Rome Termini', arrival: 'Florence S.M.N', date: '2025-04-23', status: 'On Time', price: '€45' },
        { id: 5, trainNumber: 'EUR7890', departure: 'Vienna Hauptbahnhof', arrival: 'Budapest Keleti', date: '2025-04-24', status: 'Cancelled', price: '€70' },
    ];

    const buses = [
        { id: 1, busNumber: 'BUS1234', departure: 'Berlin ZOB', arrival: 'Prague ÚAN Florenc', date: '2025-04-20', status: 'On Time', price: '€35' },
        { id: 2, busNumber: 'BUS5678', departure: 'Budapest Népliget', arrival: 'Vienna VIB', date: '2025-04-21', status: 'Delayed', price: '€30' },
        { id: 3, busNumber: 'BUS9012', departure: 'Barcelona Nord', arrival: 'Lyon Perrache', date: '2025-04-22', status: 'On Time', price: '€40' },
        { id: 4, busNumber: 'BUS3456', departure: 'Milan Lampugnano', arrival: 'Munich ZOB', date: '2025-04-23', status: 'Boarding', price: '€50' },
        { id: 5, busNumber: 'BUS7890', departure: 'Amsterdam Sloterdijk', arrival: 'Brussels North', date: '2025-04-24', status: 'On Time', price: '€25' },
    ];

    const hotels = [
        { id: 1, name: 'Grand Hotel Europa', location: 'Paris, France', checkIn: '2025-04-20', checkOut: '2025-04-23', status: 'Confirmed', price: '€450' },
        { id: 2, name: 'Berlin City Stay', location: 'Berlin, Germany', checkIn: '2025-04-21', checkOut: '2025-04-25', status: 'Pending', price: '€380' },
        { id: 3, name: 'Roma Luxe', location: 'Rome, Italy', checkIn: '2025-04-22', checkOut: '2025-04-24', status: 'Confirmed', price: '€320' },
        { id: 4, name: 'Amsterdam Canal View', location: 'Amsterdam, Netherlands', checkIn: '2025-04-23', checkOut: '2025-04-26', status: 'Cancelled', price: '€290' },
        { id: 5, name: 'Barcelona Beachfront', location: 'Barcelona, Spain', checkIn: '2025-04-24', checkOut: '2025-04-28', status: 'Confirmed', price: '€410' },
    ];

    // Get current data based on active tab
    const getCurrentData = () => {
        switch (activeTab) {
            case 'flights': return flights;
            case 'trains': return trains;
            case 'buses': return buses;
            case 'hotels': return hotels;
            default: return flights;
        }
    };

    // Get stats based on active tab
    const getStats = () => {
        switch (activeTab) {
            case 'flights':
                return [
                    { label: 'Total Flights', value: 247, color: 'blue' },
                    { label: 'On Time', value: 203, color: 'green' },
                    { label: 'Delayed', value: 28, color: 'yellow' },
                    { label: 'Cancelled', value: 16, color: 'red' }
                ];
            case 'trains':
                return [
                    { label: 'Total Trains', value: 189, color: 'blue' },
                    { label: 'On Time', value: 156, color: 'green' },
                    { label: 'Delayed', value: 22, color: 'yellow' },
                    { label: 'Cancelled', value: 11, color: 'red' }
                ];
            case 'buses':
                return [
                    { label: 'Total Buses', value: 215, color: 'blue' },
                    { label: 'On Time', value: 183, color: 'green' },
                    { label: 'Delayed', value: 24, color: 'yellow' },
                    { label: 'Cancelled', value: 8, color: 'red' }
                ];
            case 'hotels':
                return [
                    { label: 'Total Bookings', value: 163, color: 'blue' },
                    { label: 'Confirmed', value: 132, color: 'green' },
                    { label: 'Pending', value: 21, color: 'yellow' },
                    { label: 'Cancelled', value: 10, color: 'red' }
                ];
            default: return [];
        }
    };

    // Get icon based on active tab
    const getTabIcon = (tab) => {
        switch (tab) {
            case 'flights': return <Plane className="h-5 w-5" />;
            case 'trains': return <Train className="h-5 w-5" />;
            case 'buses': return <Bus className="h-5 w-5" />;
            case 'hotels': return <Building className="h-5 w-5" />;
            default: return <Plane className="h-5 w-5" />;
        }
    };

    // Get title based on active tab
    const getTabTitle = () => {
        switch (activeTab) {
            case 'flights': return 'Flights Management';
            case 'trains': return 'Trains Management';
            case 'buses': return 'Buses Management';
            case 'hotels': return 'Hotels Management';
            default: return 'Travel Management';
        }
    };

    // Get column headers based on active tab
    const getColumnHeaders = () => {
        switch (activeTab) {
            case 'flights':
                return ['Flight Number', 'Departure', 'Arrival', 'Date', 'Status', 'Price'];
            case 'trains':
                return ['Train Number', 'Departure', 'Arrival', 'Date', 'Status', 'Price'];
            case 'buses':
                return ['Bus Number', 'Departure', 'Arrival', 'Date', 'Status', 'Price'];
            case 'hotels':
                return ['Hotel Name', 'Location', 'Check-in', 'Check-out', 'Status', 'Price'];
            default:
                return ['ID', 'From', 'To', 'Date', 'Status', 'Price'];
        }
    };

    // Render row data based on active tab
    const renderRowData = (item) => {
        switch (activeTab) {
            case 'flights':
                return (
                    <>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.flightNumber}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{item.departure}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{item.arrival}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{item.date}</td>
                        <td className="px-4 py-3 text-sm">
                            <StatusBadge status={item.status} />
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">{item.price}</td>
                    </>
                );
            case 'trains':
                return (
                    <>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.trainNumber}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{item.departure}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{item.arrival}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{item.date}</td>
                        <td className="px-4 py-3 text-sm">
                            <StatusBadge status={item.status} />
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">{item.price}</td>
                    </>
                );
            case 'buses':
                return (
                    <>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.busNumber}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{item.departure}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{item.arrival}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{item.date}</td>
                        <td className="px-4 py-3 text-sm">
                            <StatusBadge status={item.status} />
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">{item.price}</td>
                    </>
                );
            case 'hotels':
                return (
                    <>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.name}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{item.location}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{item.checkIn}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{item.checkOut}</td>
                        <td className="px-4 py-3 text-sm">
                            <StatusBadge status={item.status} />
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">{item.price}</td>
                    </>
                );
            default:
                return null;
        }
    };

    // Status badge component
    const StatusBadge = ({ status }) => {
        let colorClasses = '';

        switch (status) {
            case 'On Time':
            case 'Confirmed':
                colorClasses = 'bg-green-100 text-green-800';
                break;
            case 'Delayed':
            case 'Pending':
                colorClasses = 'bg-yellow-100 text-yellow-800';
                break;
            case 'Boarding':
                colorClasses = 'bg-blue-100 text-blue-800';
                break;
            case 'Cancelled':
                colorClasses = 'bg-red-100 text-red-800';
                break;
            default:
                colorClasses = 'bg-gray-100 text-gray-800';
        }

        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClasses}`}>
                {status}
            </span>
        );
    };

    return (
        <div className="p-6 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center">
                    {getTabIcon(activeTab)}
                    <h1 className="text-2xl font-bold text-gray-800 ml-2">{getTabTitle()}</h1>
                </div>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700">
                    <Plus className="h-5 w-5 mr-1" />
                    Add New {activeTab.slice(0, -1).charAt(0).toUpperCase() + activeTab.slice(0, -1).slice(1)}
                </button>
            </div>

            {/* Navigation Tabs */}
            <div className="bg-white rounded-lg shadow mb-6">
                <div className="flex border-b">
                    <button
                        onClick={() => setActiveTab('flights')}
                        className={`flex items-center px-4 py-3 font-medium ${activeTab === 'flights' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-blue-600'}`}
                    >
                        <Plane className="h-5 w-5 mr-2" />
                        Flights
                    </button>
                    <button
                        onClick={() => setActiveTab('trains')}
                        className={`flex items-center px-4 py-3 font-medium ${activeTab === 'trains' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-blue-600'}`}
                    >
                        <Train className="h-5 w-5 mr-2" />
                        Trains
                    </button>
                    <button
                        onClick={() => setActiveTab('buses')}
                        className={`flex items-center px-4 py-3 font-medium ${activeTab === 'buses' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-blue-600'}`}
                    >
                        <Bus className="h-5 w-5 mr-2" />
                        Buses
                    </button>
                    <button
                        onClick={() => setActiveTab('hotels')}
                        className={`flex items-center px-4 py-3 font-medium ${activeTab === 'hotels' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-blue-600'}`}
                    >
                        <Building className="h-5 w-5 mr-2" />
                        Hotels
                    </button>
                </div>

                {/* Dashboard Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4">
                    {getStats().map((stat, index) => (
                        <div key={index} className={`bg-${stat.color}-50 p-4 rounded-md`}>
                            <p className="text-sm text-gray-500">{stat.label}</p>
                            <p className="text-2xl font-bold">{stat.value}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Data Table */}
            <div className="bg-white rounded-lg shadow">
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-lg font-medium">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} List</h2>
                    <div className="flex space-x-2">
                        <div className="relative">
                            <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder={`Search ${activeTab}...`}
                                className="pl-10 pr-4 py-2 border rounded-lg"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button className="border p-2 rounded-lg hover:bg-gray-50">
                            <Filter className="h-5 w-5 text-gray-500" />
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50">
                                {getColumnHeaders().map((header, index) => (
                                    <th key={index} className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                                        <div className="flex items-center">
                                            {header}
                                            <ArrowUpDown className="h-4 w-4 ml-1 text-gray-400" />
                                        </div>
                                    </th>
                                ))}
                                <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {getCurrentData().map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50">
                                    {renderRowData(item)}
                                    <td className="px-4 py-3 text-sm text-center">
                                        <div className="flex justify-center space-x-2">
                                            <button className="p-1 rounded hover:bg-blue-100">
                                                <Edit className="h-4 w-4 text-blue-600" />
                                            </button>
                                            <button className="p-1 rounded hover:bg-red-100">
                                                <Trash2 className="h-4 w-4 text-red-600" />
                                            </button>
                                            <button className="p-1 rounded hover:bg-gray-100">
                                                <MoreHorizontal className="h-4 w-4 text-gray-600" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="px-4 py-3 border-t flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                        Showing 1-5 of {getStats()[0].value} {activeTab}
                    </p>
                    <div className="flex space-x-1">
                        <button className="px-3 py-1 border rounded hover:bg-gray-50">Previous</button>
                        <button className="px-3 py-1 border rounded bg-blue-50 text-blue-600">1</button>
                        <button className="px-3 py-1 border rounded hover:bg-gray-50">2</button>
                        <button className="px-3 py-1 border rounded hover:bg-gray-50">3</button>
                        <button className="px-3 py-1 border rounded hover:bg-gray-50">Next</button>
                    </div>
                </div>
            </div>
        </div>
    );
}