import React, { useState, useEffect } from 'react';
import { Users, Search, Filter, Plus, ArrowUpDown, UserPlus, Mail, Phone, MoreHorizontal } from 'lucide-react';
import { API_BASE_URL } from '../../config/apiConfig';

export default function CustomersPage() {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [totalCustomers, setTotalCustomers] = useState(0);
    const [activeCustomers, setActiveCustomers] = useState(0);
    const [newCustomers, setNewCustomers] = useState(0);
    const [avgBookings, setAvgBookings] = useState(0);

    // Fetch customers data from API
    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${API_BASE_URL}/customers`);

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const result = await response.json();

                if (result.success && Array.isArray(result.data)) {
                    // Transform API data to match our component's expected format
                    const formattedCustomers = result.data.map(customer => ({
                        id: customer.customer_id,
                        name: `${customer.firstName} ${customer.lastName}`,
                        email: customer.emailAddress,
                        phone: customer.phoneNumber,
                        status: determineCustomerStatus(customer.createdAt),
                        totalBookings: 0, // API doesn't provide this yet
                        lastBooking: 'N/A', // API doesn't provide this yet
                        documentType: customer.documentType,
                        documentNumber: customer.documentNumber,
                        gender: customer.gender,
                        nationality: customer.nationality,
                        createdAt: new Date(customer.createdAt).toLocaleDateString()
                    }));

                    setCustomers(formattedCustomers);

                    // Update metrics
                    setTotalCustomers(formattedCustomers.length);
                    setActiveCustomers(formattedCustomers.filter(c => c.status === 'Active').length);
                    setNewCustomers(formattedCustomers.filter(c => c.status === 'New').length);
                    setAvgBookings(0); // Placeholder until we have booking data
                } else {
                    throw new Error('Failed to fetch customers or data format invalid');
                }
            } catch (error) {
                console.error("Error fetching customers:", error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchCustomers();
    }, []);

    // Helper function to determine customer status based on creation date
    const determineCustomerStatus = (createdAt) => {
        const creationDate = new Date(createdAt);
        const currentDate = new Date();
        const daysSinceCreation = Math.floor((currentDate - creationDate) / (1000 * 60 * 60 * 24));

        if (daysSinceCreation < 30) return 'New';
        return 'Active'; // Default status for now
    };

    // Format initials for avatar
    const getInitials = (name) => {
        return name.split(' ').map(name => name[0]).join('');
    };

    if (loading) {
        return (
            <div className="p-6 max-w-6xl mx-auto flex justify-center items-center h-64">
                <div className="text-gray-500">Loading customer data...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 max-w-6xl mx-auto">
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
                    <h3 className="font-medium">Error loading customers</h3>
                    <p>{error}</p>
                    <button
                        className="mt-2 text-sm bg-red-100 hover:bg-red-200 px-3 py-1 rounded"
                        onClick={() => window.location.reload()}
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center">
                    <Users className="h-8 w-8 text-purple-600 mr-2" />
                    <h1 className="text-2xl font-bold text-gray-800">Customer Management</h1>
                </div>
                <button className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-purple-700">
                    <UserPlus className="h-5 w-5 mr-1" />
                    Add New Customer
                </button>
            </div>

            <div className="bg-white rounded-lg shadow mb-6">
                <div className="p-4 border-b">
                    <h2 className="text-lg font-medium">Customer Overview</h2>
                    <p className="text-gray-500">Track customer activity and metrics</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4">
                    <div className="bg-purple-50 p-4 rounded-md">
                        <p className="text-sm text-gray-500">Total Customers</p>
                        <p className="text-2xl font-bold">{totalCustomers}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-md">
                        <p className="text-sm text-gray-500">Active Customers</p>
                        <p className="text-2xl font-bold">{activeCustomers}</p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-md">
                        <p className="text-sm text-gray-500">New This Month</p>
                        <p className="text-2xl font-bold">{newCustomers}</p>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-md">
                        <p className="text-sm text-gray-500">Avg. Bookings</p>
                        <p className="text-2xl font-bold">{avgBookings}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow">
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-lg font-medium">Customer Directory</h2>
                    <div className="flex space-x-2">
                        <div className="relative">
                            <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search customers..."
                                className="pl-10 pr-4 py-2 border rounded-lg"
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
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                                    <div className="flex items-center">
                                        Customer Name
                                        <ArrowUpDown className="h-4 w-4 ml-1 text-gray-400" />
                                    </div>
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Email</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Phone</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Status</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Nationality</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Created</th>
                                <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {customers.length > 0 ? (
                                customers.map((customer) => (
                                    <tr key={customer.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center">
                                                <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-medium mr-2">
                                                    {getInitials(customer.name)}
                                                </div>
                                                <span className="text-sm font-medium text-gray-900">{customer.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-500">{customer.email}</td>
                                        <td className="px-4 py-3 text-sm text-gray-500">{customer.phone}</td>
                                        <td className="px-4 py-3 text-sm">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${customer.status === 'Active' ? 'bg-green-100 text-green-800' :
                                                    customer.status === 'Inactive' ? 'bg-gray-100 text-gray-800' :
                                                        'bg-blue-100 text-blue-800'
                                                }`}>
                                                {customer.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-500">{customer.nationality}</td>
                                        <td className="px-4 py-3 text-sm text-gray-500">{customer.createdAt}</td>
                                        <td className="px-4 py-3 text-sm">
                                            <div className="flex justify-center space-x-2">
                                                <button className="p-1 rounded hover:bg-blue-100">
                                                    <Mail className="h-4 w-4 text-blue-600" />
                                                </button>
                                                <button className="p-1 rounded hover:bg-green-100">
                                                    <Phone className="h-4 w-4 text-green-600" />
                                                </button>
                                                <button className="p-1 rounded hover:bg-gray-100">
                                                    <MoreHorizontal className="h-4 w-4 text-gray-600" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="px-4 py-6 text-center text-gray-500">
                                        No customers found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="px-4 py-3 border-t flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                        {customers.length > 0
                            ? `Showing 1-${customers.length} of ${totalCustomers} customers`
                            : 'No customers to display'}
                    </p>
                    <div className="flex space-x-1">
                        <button className="px-3 py-1 border rounded hover:bg-gray-50" disabled={customers.length === 0}>Previous</button>
                        <button className="px-3 py-1 border rounded bg-purple-50 text-purple-600">1</button>
                        <button className="px-3 py-1 border rounded hover:bg-gray-50" disabled={customers.length === 0}>Next</button>
                    </div>
                </div>
            </div>
        </div>
    );
}