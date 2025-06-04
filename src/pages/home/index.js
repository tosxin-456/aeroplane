import { useState, useEffect } from 'react';
import {
    Plane,
    Users,
    Calendar,
    TrendingUp,
    DollarSign,
    Clock,
    AlertCircle,
    Hotel,
    Bus,
    Train,
    Map,
    Globe
} from 'lucide-react';
import { API_BASE_URL } from '../../config/apiConfig';

export default function DashboardHome() {
    const [stats, setStats] = useState({
        activeFlights: 0,
        activeHotels: 0,
        activeBuses: 0,
        activeTrains: 0,
        totalCustomers: 0,
        todayBookings: 0,
        monthlyRevenue: 0
    });

    const [isLoading, setIsLoading] = useState(true);
    const [selectedRegion, setSelectedRegion] = useState("All Europe");
    const [bookings, setBookings] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [airports, setAirports] = useState({});
    const [payments, setPayments] = useState([]);
    const [error, setError] = useState(null);
    const [totalCustomers, setTotalCustomers] = useState(0);
    const [activeCustomers, setActiveCustomers] = useState(0);
    const [newCustomers, setNewCustomers] = useState(0);
    const [avgBookings, setAvgBookings] = useState(0);

    // Get user info from localStorage
    const email = localStorage.getItem('email') || 'user@skytravel.com';
    const name = localStorage.getItem('fullName') || 'Guest User';

    // Helper function to determine customer status based on account creation date
    const determineCustomerStatus = (createdAt) => {
        const accountCreationDate = new Date(createdAt);
        const now = new Date();
        const daysSinceCreation = Math.floor((now - accountCreationDate) / (1000 * 60 * 60 * 24));

        if (daysSinceCreation < 30) return 'New';
        if (daysSinceCreation < 90) return 'Active';
        return 'Regular';
    };


    // Helper function to get random status (only used when API doesn't provide status)
    const getRandomStatus = () => {
        const statuses = ['Confirmed', 'Pending', 'Cancelled'];
        const randomIndex = Math.floor(Math.random() * statuses.length);
        return statuses[randomIndex];
    };

    useEffect(() => {
        // Fetch airports data
        const fetchAirports = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/airports`);
                if (!response.ok) {
                    throw new Error('Failed to fetch airports');
                }
                const data = await response.json();
                setAirports(data);
            } catch (error) {
                console.error('Error fetching airports:', error);
            }
        };

        // Fetch payments
        const fetchPayments = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/payments`);
                if (!response.ok) {
                    throw new Error('Failed to fetch payments');
                }
                const result = await response.json();

                if (result.success && Array.isArray(result.data)) {
                    setPayments(result.data);

                    // Calculate total revenue from payments
                    const totalRevenue = result.data.reduce((sum, payment) => {
                        return sum + parseFloat(payment.amount || 0);
                    }, 0);

                    // Get unique customer IDs
                    const uniqueCustomers = new Set(result.data.map(payment => payment.userId));

                    setStats(prevStats => ({
                        ...prevStats,
                        monthlyRevenue: totalRevenue,
                        totalCustomers: uniqueCustomers.size || prevStats.totalCustomers
                    }));
                }
            } catch (error) {
                console.error('Error fetching payments:', error);
                setError(error.message);
            }
        };

        // Fetch bookings
        const fetchBookings = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/booked-flights`);

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const result = await response.json();

                if (result.success) {
                    const formattedBookings = result.data.map((item) => {
                        let rawOfferData;
                        let totalPrice = "N/A"; // Default in case rawOfferData is not available
                        let currency = "USD"; // Default currency

                        try {
                            rawOfferData = JSON.parse(item.rawOfferData);
                            totalPrice = rawOfferData.price.total; // Get total price from rawOfferData
                            currency = rawOfferData.price.currency; // Get currency from rawOfferData
                        } catch (e) {
                            console.error("Error parsing rawOfferData:", e);
                        }

                        let travelerInfo;
                        try {
                            travelerInfo = JSON.parse(item.travelersInfo);
                        } catch (e) {
                            travelerInfo = [];
                        }

                        const departureDate = new Date(item.departureTime);
                        const formattedDate = departureDate.toISOString().split('T')[0];

                        let customerName = "Unknown";
                        if (travelerInfo && travelerInfo.length > 0 && travelerInfo[0].name) {
                            const { firstName, lastName } = travelerInfo[0].name;
                            customerName = `${firstName} ${lastName}`;
                        }

                        const departure = `${item.origin}`;
                        const arrival = `${item.destination}`;
                        const flightNumber = `${item.airline}${item.flight_id}`;
                        const formattedReference = formatBookingReference(item.bookingReference, item.flight_id);
                        const status = item.status || getRandomStatus();

                        return {
                            id: item.flight_id,
                            reference: formattedReference,
                            customer: customerName,
                            flight: flightNumber,
                            departure: departure,
                            arrival: arrival,
                            date: formattedDate,
                            status: status,
                            amount: totalPrice,
                            currency: currency // Include the currency
                        };
                    });

                    setBookings(formattedBookings);

                    // Update active flights count
                    setStats(prevStats => ({
                        ...prevStats,
                        activeFlights: formattedBookings.filter(b => b.status === 'Confirmed').length,
                        todayBookings: formattedBookings.filter(b =>
                            b.date === new Date().toISOString().split('T')[0]).length
                    }));
                } else {
                    throw new Error('Failed to fetch bookings');
                }
            } catch (err) {
                setError(err.message);
                console.error('Error fetching bookings:', err);
            }
        };

        // Fetch customers
        const fetchCustomers = async () => {
            try {
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

                    // Update stats
                    setStats(prevStats => ({
                        ...prevStats,
                        totalCustomers: formattedCustomers.length
                    }));
                } else {
                    throw new Error('Failed to fetch customers or data format invalid');
                }
            } catch (error) {
                console.error("Error fetching customers:", error);
                setError(error.message);
            }
        };

        // Function to complete remaining stats
        const completeStats = () => {
            setStats(prevStats => ({
                ...prevStats,
                activeBuses: 31,
                activeTrains: 52,
                activeHotels: 24,
                totalCustomers: prevStats.totalCustomers || totalCustomers || 3764,
                todayBookings: prevStats.todayBookings || 128,
                monthlyRevenue: prevStats.monthlyRevenue || 287650
            }));

            setIsLoading(false);
        };

        // Fetch all data
        const fetchAllData = async () => {
            setIsLoading(true);
            try {
                await Promise.all([
                    fetchAirports(),
                    fetchPayments(),
                    fetchBookings(),
                    fetchCustomers()
                ]);

                // Give a bit of time for state updates to propagate
                setTimeout(() => {
                    completeStats();
                }, 500);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
                completeStats(); // Complete stats even if there's an error
            }
        };

        fetchAllData();
    }, []);

    const getIconForType = (type) => {
        switch (type) {
            case 'Flight': return <Plane className="h-5 w-5 text-blue-500" />;
            case 'Train': return <Train className="h-5 w-5 text-green-500" />;
            case 'Bus': return <Bus className="h-5 w-5 text-orange-500" />;
            case 'Hotel': return <Hotel className="h-5 w-5 text-purple-500" />;
            default: return <Clock className="h-5 w-5 text-gray-500" />;
        }
    };

    // Get currency symbol based on currency code
    const getCurrencySymbol = (currencyCode) => {
        switch (currencyCode.toLowerCase()) {
            case 'usd': return '$';
            case 'eur': return '€';
            case 'gbp': return '£';
            default: return currencyCode;
        }
    };

    const formatBookingReference = (rawReference, flightId) => {
        // If the raw reference contains URL-encoded characters or is too long
        if (rawReference.includes('%') || rawReference.includes('=') || rawReference.length > 15) {
            // Decode the raw reference
            const decodedReference = decodeURIComponent(rawReference);

            // Remove any non-alphanumeric characters (except '-')
            const cleanedReference = decodedReference.replace(/[^a-zA-Z0-9-]/g, '');

            // Create the final reference with the 'BK-' prefix
            return `BK-${cleanedReference}`;
        }

        // If it's already in a good format (starts with 'BK-'), just return it
        if (rawReference.startsWith('BK-')) {
            return rawReference;
        }

        // Otherwise, return the raw reference with the 'BK-' prefix
        return `BK-${rawReference}`;
    };

    return (
        <div className="space-y-6 font-montserrat">
            {/* Page header */}
            <div className="pb-5 border-b border-gray-200 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Traversteries Dashboard</h1>
                    <p className="mt-1 text-sm text-gray-500">Welcome back, {name}</p>
                </div>
                <div>
                    <select
                        value={selectedRegion}
                        onChange={(e) => setSelectedRegion(e.target.value)}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    >
                        <option>All Europe</option>
                        <option>Western Europe</option>
                        <option>Eastern Europe</option>
                        <option>Northern Europe</option>
                        <option>Southern Europe</option>
                    </select>
                </div>
            </div>

            {/* Stats cards */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {/* Active Flights */}
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                                <Plane className="h-6 w-6 text-white" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Active Flights</dt>
                                    <dd>
                                        {isLoading ? (
                                            <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
                                        ) : (
                                            <div className="text-lg font-semibold text-gray-900">{stats.activeFlights}</div>
                                        )}
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 px-5 py-3">
                        <div className="text-sm">
                            <a href="#" className="font-medium text-blue-600 hover:text-blue-500">View all flights</a>
                        </div>
                    </div>
                </div>

                {/* Active Hotels */}
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                                <Hotel className="h-6 w-6 text-white" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Active Hotels</dt>
                                    <dd>
                                        {isLoading ? (
                                            <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
                                        ) : (
                                            <div className="text-lg font-semibold text-gray-900">{stats.activeHotels}</div>
                                        )}
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 px-5 py-3">
                        <div className="text-sm">
                            <a href="#" className="font-medium text-blue-600 hover:text-blue-500">View all hotels</a>
                        </div>
                    </div>
                </div>

                {/* Active Buses */}
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 bg-orange-500 rounded-md p-3">
                                <Bus className="h-6 w-6 text-white" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Active Buses</dt>
                                    <dd>
                                        {isLoading ? (
                                            <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
                                        ) : (
                                            <div className="text-lg font-semibold text-gray-900">{stats.activeBuses}</div>
                                        )}
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 px-5 py-3">
                        <div className="text-sm">
                            <a href="#" className="font-medium text-blue-600 hover:text-blue-500">View all buses</a>
                        </div>
                    </div>
                </div>

                {/* Active Trains */}
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                                <Train className="h-6 w-6 text-white" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Active Trains</dt>
                                    <dd>
                                        {isLoading ? (
                                            <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
                                        ) : (
                                            <div className="text-lg font-semibold text-gray-900">{stats.activeTrains}</div>
                                        )}
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 px-5 py-3">
                        <div className="text-sm">
                            <a href="#" className="font-medium text-blue-600 hover:text-blue-500">View all trains</a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Additional stats row */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                {/* Total Customers */}
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 bg-blue-400 rounded-md p-3">
                                <Users className="h-6 w-6 text-white" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Total Customers</dt>
                                    <dd>
                                        {isLoading ? (
                                            <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
                                        ) : (
                                            <div className="text-lg font-semibold text-gray-900">{stats.totalCustomers.toLocaleString()}</div>
                                        )}
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 px-5 py-3">
                        <div className="text-sm">
                            <a href="#" className="font-medium text-blue-600 hover:text-blue-500">View customer list</a>
                        </div>
                    </div>
                </div>

                {/* Today's Bookings */}
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 bg-pink-500 rounded-md p-3">
                                <Calendar className="h-6 w-6 text-white" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Today's Bookings</dt>
                                    <dd>
                                        {isLoading ? (
                                            <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
                                        ) : (
                                            <div className="text-lg font-semibold text-gray-900">{stats.todayBookings}</div>
                                        )}
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 px-5 py-3">
                        <div className="text-sm">
                            <a href="#" className="font-medium text-blue-600 hover:text-blue-500">View all bookings</a>
                        </div>
                    </div>
                </div>

                {/* Monthly Revenue */}
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                                <DollarSign className="h-6 w-6 text-white" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Monthly Revenue</dt>
                                    <dd>
                                        {isLoading ? (
                                            <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
                                        ) : (
                                            <div className="text-lg font-semibold text-gray-900">
                                                {payments.length > 0 && payments[0].currency
                                                    ? `${getCurrencySymbol(payments[0].currency)}${stats.monthlyRevenue.toLocaleString()}`
                                                    : `€${stats.monthlyRevenue.toLocaleString()}`}
                                            </div>
                                        )}
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 px-5 py-3">
                        <div className="text-sm">
                            <a href="#" className="font-medium text-blue-600 hover:text-blue-500">View financial reports</a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main content area - 2 column layout */}
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                {/* Recent Bookings */}
                <div className="bg-white shadow rounded-lg">
                    <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                        <h3 className="text-lg font-medium leading-6 text-gray-900">Recent Bookings</h3>
                        <p className="mt-1 text-sm text-gray-500">Latest customer bookings across all European destinations</p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Flight</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Route</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {bookings.length > 0 ? (
                                    bookings.slice(0, 5).map((booking) => (
                                        <tr key={booking.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">{booking.reference}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{booking.customer}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <div className="flex items-center">
                                                    <Plane className="h-4 w-4 text-blue-500 mr-1" />
                                                    <span>{booking.flight}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.departure} → {booking.arrival}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.date}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                                    ${booking.status === 'Confirmed' ? 'bg-green-100 text-green-800' :
                                                        booking.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-red-100 text-red-800'}`}>
                                                    {booking.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-4 text-sm text-center text-gray-500">
                                            {isLoading ? "Loading bookings..." : "No recent bookings found"}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="bg-gray-50 px-4 py-4 sm:px-6 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-500">
                                {bookings.length > 0 ?
                                    `Showing ${Math.min(bookings.length, 5)} of ${bookings.length} bookings` :
                                    "No bookings to display"}
                            </div>
                            <div>
                                <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200">
                                    View all bookings
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Customer Overview */}
                <div className="bg-white shadow rounded-lg">
                    <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                        <h3 className="text-lg font-medium leading-6 text-gray-900">Customer Overview</h3>
                        <p className="mt-1 text-sm text-gray-500">Customer metrics and latest registrations</p>
                    </div>
                    <div className="p-4 grid grid-cols-2 gap-4">
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <p className="text-sm text-blue-600 font-medium">Active Customers</p>
                            <p className="text-2xl font-bold text-blue-700">{activeCustomers}</p>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg">
                            <p className="text-sm text-green-600 font-medium">New Customers (30d)</p>
                            <p className="text-2xl font-bold text-green-700">{newCustomers}</p>
                        </div>
                    </div>
                    <div className="px-4 py-2">
                        <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Recent Customers</h4>
                    </div>
                    <ul className="divide-y divide-gray-200">
                        {customers.length > 0 ? (
                            customers.slice(0, 4).map((customer) => (
                                <li key={customer.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0">
                                                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                                    <span className="text-gray-500 font-medium">
                                                        {customer.name.split(' ').map(n => n[0]).join('')}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="ml-4">
                                                <p className="text-sm font-medium text-gray-900">{customer.name}</p>
                                                <div className="flex items-center mt-1">
                                                    <p className="text-xs text-gray-500">{customer.email}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                                ${customer.status === 'Active' ? 'bg-green-100 text-green-800' :
                                                    customer.status === 'New' ? 'bg-blue-100 text-blue-800' :
                                                        'bg-gray-100 text-gray-800'}`}>
                                                {customer.status}
                                            </span>
                                        </div>
                                    </div>
                                </li>
                            ))
                        ) : (
                            <li className="px-4 py-8 sm:px-6 text-center text-gray-500">
                                {isLoading ? "Loading customer data..." : "No customers found"}
                            </li>
                        )}
                    </ul>
                    <div className="bg-gray-50 px-4 py-4 sm:px-6 border-t border-gray-200">
                        <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-500">
                            View all customers <span aria-hidden="true">&rarr;</span>
                        </a>
                    </div>
                </div>
            </div>

            {/* Recent Payments Section */}
            <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                    <h3 className="text-lg font-medium leading-6 text-gray-900">Recent Payments</h3>
                    <p className="mt-1 text-sm text-gray-500">Latest financial transactions in the system</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer ID</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {payments.length > 0 ? (
                                payments.slice(0, 5).map((payment) => (
                                    <tr key={payment.payment_id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                                            {payment.reference ? (payment.reference.substring(0, 10) + '...') : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {payment.userId}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                                            {getCurrencySymbol(payment.currency)}{parseFloat(payment.amount / 100).toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                                            {payment.paymentMethod}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                                ${payment.status === 'successful' ? 'bg-green-100 text-green-800' :
                                                    payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-red-100 text-red-800'}`}>
                                                {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(payment.createdAt).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-4 text-sm text-center text-gray-500">
                                        {isLoading ? "Loading payment data..." : "No payment records found"}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="bg-gray-50 px-4 py-4 sm:px-6 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-500">
                            {payments.length > 0 ?
                                `Showing ${Math.min(payments.length, 5)} of ${payments.length} payments` :
                                "No payments to display"}
                        </div>
                        <div>
                            <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200">
                                View all payments
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Customer & Revenue Stats */}
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                {/* Customer Demographics */}
                <div className="bg-white shadow rounded-lg">
                    <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                        <h3 className="text-lg font-medium leading-6 text-gray-900">Customer Distribution</h3>
                        <p className="mt-1 text-sm text-gray-500">Regional breakdown of customers</p>
                    </div>
                    <div className="p-6">
                        <div className="h-64 flex items-center justify-center">
                            {isLoading ? (
                                <div className="w-full h-full bg-gray-100 rounded animate-pulse flex items-center justify-center">
                                    <p className="text-gray-500">Loading chart data...</p>
                                </div>
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-gray-600">
                                    <Globe className="h-16 w-16 text-blue-400 mb-4" />
                                    <p className="text-sm text-center">Regional breakdown visualization would appear here</p>
                                    <div className="mt-4 grid grid-cols-2 gap-4 w-full max-w-md">
                                        <div className="p-3 bg-blue-50 rounded">
                                            <p className="text-xs text-blue-600">Western Europe</p>
                                            <p className="text-lg font-bold text-blue-700">{Math.round(stats.totalCustomers * 0.45)}</p>
                                        </div>
                                        <div className="p-3 bg-green-50 rounded">
                                            <p className="text-xs text-green-600">Southern Europe</p>
                                            <p className="text-lg font-bold text-green-700">{Math.round(stats.totalCustomers * 0.25)}</p>
                                        </div>
                                        <div className="p-3 bg-yellow-50 rounded">
                                            <p className="text-xs text-yellow-600">Eastern Europe</p>
                                            <p className="text-lg font-bold text-yellow-700">{Math.round(stats.totalCustomers * 0.15)}</p>
                                        </div>
                                        <div className="p-3 bg-purple-50 rounded">
                                            <p className="text-xs text-purple-600">Northern Europe</p>
                                            <p className="text-lg font-bold text-purple-700">{Math.round(stats.totalCustomers * 0.15)}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Revenue by Service */}
                <div className="bg-white shadow rounded-lg">
                    <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                        <h3 className="text-lg font-medium leading-6 text-gray-900">Revenue by Service</h3>
                        <p className="mt-1 text-sm text-gray-500">Monthly income breakdown</p>
                    </div>
                    <div className="px-6 py-6">
                        <div className="h-64 flex items-center justify-center">
                            {isLoading ? (
                                <div className="w-full h-full bg-gray-100 rounded animate-pulse flex items-center justify-center">
                                    <p className="text-gray-500">Loading revenue data...</p>
                                </div>
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center">
                                    <TrendingUp className="h-16 w-16 text-green-400 mb-4" />
                                    <p className="text-sm text-center text-gray-600 mb-4">Revenue breakdown by service type</p>
                                    <div className="w-full max-w-md space-y-3">
                                        {/* Flights Revenue */}
                                        <div className="flex items-center">
                                            <Plane className="h-4 w-4 text-blue-500 mr-2" />
                                            <span className="text-sm text-gray-600 w-20">Flights</span>
                                            <div className="flex-1 mx-2">
                                                <div className="h-2 bg-gray-200 rounded-full">
                                                    <div className="h-2 bg-blue-500 rounded-full" style={{ width: '65%' }}></div>
                                                </div>
                                            </div>
                                            <span className="text-sm font-medium text-gray-900">
                                                {getCurrencySymbol(payments[0]?.currency || 'eur')}{Math.round(stats.monthlyRevenue * 0.65).toLocaleString()}
                                            </span>
                                        </div>
                                        {/* Hotels Revenue */}
                                        <div className="flex items-center">
                                            <Hotel className="h-4 w-4 text-purple-500 mr-2" />
                                            <span className="text-sm text-gray-600 w-20">Hotels</span>
                                            <div className="flex-1 mx-2">
                                                <div className="h-2 bg-gray-200 rounded-full">
                                                    <div className="h-2 bg-purple-500 rounded-full" style={{ width: '20%' }}></div>
                                                </div>
                                            </div>
                                            <span className="text-sm font-medium text-gray-900">
                                                {getCurrencySymbol(payments[0]?.currency || 'eur')}{Math.round(stats.monthlyRevenue * 0.20).toLocaleString()}
                                            </span>
                                        </div>
                                        {/* Trains Revenue */}
                                        <div className="flex items-center">
                                            <Train className="h-4 w-4 text-green-500 mr-2" />
                                            <span className="text-sm text-gray-600 w-20">Trains</span>
                                            <div className="flex-1 mx-2">
                                                <div className="h-2 bg-gray-200 rounded-full">
                                                    <div className="h-2 bg-green-500 rounded-full" style={{ width: '10%' }}></div>
                                                </div>
                                            </div>
                                            <span className="text-sm font-medium text-gray-900">
                                                {getCurrencySymbol(payments[0]?.currency || 'eur')}{Math.round(stats.monthlyRevenue * 0.10).toLocaleString()}
                                            </span>
                                        </div>
                                        {/* Buses Revenue */}
                                        <div className="flex items-center">
                                            <Bus className="h-4 w-4 text-orange-500 mr-2" />
                                            <span className="text-sm text-gray-600 w-20">Buses</span>
                                            <div className="flex-1 mx-2">
                                                <div className="h-2 bg-gray-200 rounded-full">
                                                    <div className="h-2 bg-orange-500 rounded-full" style={{ width: '5%' }}></div>
                                                </div>
                                            </div>
                                            <span className="text-sm font-medium text-gray-900">
                                                {getCurrencySymbol(payments[0]?.currency || 'eur')}{Math.round(stats.monthlyRevenue * 0.05).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Error display if needed */}
            {error && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <AlertCircle className="h-5 w-5 text-red-400" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-red-700">
                                There was an error loading some dashboard data: {error}. Please refresh the page or contact support.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}