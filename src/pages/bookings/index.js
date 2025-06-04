import React, { useState, useEffect } from 'react';
import { Calendar, Search, Filter, Plus, ArrowUpDown, CheckCircle, XCircle, Clock, Tag, AlertCircle, MoreHorizontal, IndianRupee } from 'lucide-react';
import { BookingForm } from '../../components/BookingsComponent';
import { API_BASE_URL } from '../../config/apiConfig';
import { FaDollarSign, FaEuroSign, FaPoundSign, FaYenSign, FaRubleSign, FaShekelSign, FaBitcoin, FaLiraSign } from 'react-icons/fa';
import { TbCurrencyDollarCanadian } from 'react-icons/tb';

export default function BookingsPage() {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [bookings, setBookings] = useState([]);
    const [resuls, setResuls] = useState([]);

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(15);

    useEffect(() => {
        fetchBookings();
    }, []);
    const getCurrencyIcon = (currency) => {
        switch (currency) {
            case "USD":
                return <FaDollarSign className="text-md text-green-500" />;
            case "EUR":
                return <FaEuroSign className="text-md text-blue-500" />;
            case "GBP":
                return <FaPoundSign className="text-md text-gray-700" />;
            case "JPY":
                return <FaYenSign className="text-md text-blue-600" />;
            case "RUB":
                return <FaRubleSign className="text-md text-red-600" />;
            case "ILS":
                return <FaShekelSign className="text-md text-yellow-600" />;
            case "INR":
                return <IndianRupee className="text-md text-orange-500" />;
            case "CAD":
                return <TbCurrencyDollarCanadian className="text-md text-cyan-600" />;
            case "AUD":
                return <FaDollarSign className="text-md text-purple-500" />; // Using USD icon for AUD
            case "CHF":
                return <FaEuroSign className="text-md text-gray-600" />; // Using EUR icon for CHF
            case "NGN":
                return <span className="text-md text-green-700">₦</span>; // Naira (NGN)
            case "BRL":
                return <FaDollarSign className="text-md text-yellow-600" />; // Brazilian Real
            case "CNY":
                return <FaYenSign className="text-md text-red-600" />; // Chinese Yuan (same icon as JPY)
            case "MXN":
                return <FaDollarSign className="text-md text-green-500" />; // Mexican Peso
            case "SEK":
                return <FaEuroSign className="text-md text-blue-500" />; // Swedish Krona (using Euro icon)
            case "SAR":
                return <FaRubleSign className="text-md text-green-700" />; // Saudi Riyal (using Ruble icon)
            case "TRY":
                return <FaLiraSign className="text-md text-red-500" />; // Turkish Lira
            case "ZAR":
                return <FaRubleSign className="text-md text-orange-600" />; // South African Rand
            case "BTC":
                return <FaBitcoin className="text-md text-yellow-500" />; // Bitcoin (BTC)
            default:
                return <span className="text-md text-gray-500">{currency}</span>; // Fallback in case no icon is found
        }
    };

    // Function to generate a user-friendly booking reference
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


    const fetchBookings = async () => {
        try {
            setIsLoading(true);
            const response = await fetch(`${API_BASE_URL}/booked-flights`);

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const result = await response.json();
            console.log(result)

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
            } else {
                throw new Error('Failed to fetch bookings');
            }
        } catch (err) {
            setError(err.message);
            console.error('Error fetching bookings:', err);
        } finally {
            setIsLoading(false);
        }
    };


    // console.log(bookings)

    const getRandomStatus = () => {
        const statuses = ['Confirmed', 'Pending', 'Cancelled', 'Refunded'];
        return statuses[Math.floor(Math.random() * statuses.length)];
    };

    const handleSaveBooking = (newBooking) => {
        setBookings([newBooking, ...bookings]);
        setIsFormOpen(false);
    };

    // Pagination logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentBookings = bookings.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(bookings.length / itemsPerPage);

    // Change page
    const paginate = (pageNumber) => setCurrentPage(pageNumber);
    const nextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };
    const prevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    // Generate pagination numbers
    const getPaginationGroup = () => {
        let start = Math.max(currentPage - 2, 1);
        let end = Math.min(start + 4, totalPages);

        if (end - start < 4) {
            start = Math.max(end - 4, 1);
        }

        return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'confirmed':
                return <CheckCircle className="h-3 w-3 mr-1" />;
            case 'pending':
                return <Clock className="h-3 w-3 mr-1" />;
            case 'cancelled':
                return <XCircle className="h-3 w-3 mr-1" />;
            case 'refunded':
                return <Tag className="h-3 w-3 mr-1" />;
            default:
                return null;
        }
    };

    const getStatusClass = (status) => {
        switch (status) {
            case 'confirmed':
                return 'bg-green-100 text-green-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            case 'refunded':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="p-2 md:p-6 max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 md:mb-6">
                <div className="flex items-center mb-3 md:mb-0">
                    <Calendar className="h-6 w-6 md:h-8 md:w-8 text-green-600 mr-2" />
                    <h1 className="text-xl md:text-2xl font-bold text-gray-800">Booking Management</h1>
                </div>
                <button
                    className="w-full md:w-auto bg-green-600 text-white px-3 py-2 rounded-lg flex items-center justify-center hover:bg-green-700"
                    onClick={() => setIsFormOpen(true)}
                >
                    <Plus className="h-5 w-5 mr-1" />
                    New Booking
                </button>
            </div>

            <div className="bg-white rounded-lg shadow mb-4 md:mb-6">
                <div className="p-3 md:p-4 border-b">
                    <h2 className="text-base md:text-lg font-medium">Booking Overview</h2>
                    <p className="text-sm text-gray-500">Monitor booking status and performance</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 p-3 md:p-4">
                    <div className="bg-green-50 p-3 md:p-4 rounded-md">
                        <p className="text-xs md:text-sm text-gray-500">Total Bookings</p>
                        <p className="text-lg md:text-2xl font-bold">{bookings.length}</p>
                    </div>
                    <div className="bg-blue-50 p-3 md:p-4 rounded-md">
                        <p className="text-xs md:text-sm text-gray-500">Confirmed</p>
                        <p className="text-lg md:text-2xl font-bold">{bookings.filter(b => b.status === 'confirmed').length}</p>
                    </div>
                    <div className="bg-yellow-50 p-3 md:p-4 rounded-md">
                        <p className="text-xs md:text-sm text-gray-500">Pending</p>
                        <p className="text-lg md:text-2xl font-bold">{bookings.filter(b => b.status === 'pending').length}</p>
                    </div>
                    <div className="bg-red-50 p-3 md:p-4 rounded-md">
                        <p className="text-xs md:text-sm text-gray-500">Cancelled</p>
                        <p className="text-lg md:text-2xl font-bold">{bookings.filter(b => (b.status === 'cancelled' || b.status === 'refunded')).length}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow">
                <div className="p-3 md:p-4 border-b flex flex-col md:flex-row justify-between md:items-center">
                    <h2 className="text-base md:text-lg font-medium mb-2 md:mb-0">Recent Bookings</h2>
                    <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
                        <div className="relative w-full md:w-auto">
                            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search bookings..."
                                className="w-full md:w-auto pl-10 pr-4 py-2 border rounded-lg text-sm"
                            />
                        </div>
                        <button className="border p-2 rounded-lg hover:bg-gray-50">
                            <Filter className="h-4 w-4 text-gray-500" />
                        </button>
                    </div>
                </div>

                {isLoading ? (
                    <div className="p-6 text-center">
                        <p className="text-gray-500">Loading bookings...</p>
                    </div>
                ) : error ? (
                    <div className="p-6 text-center">
                        <p className="text-red-500">Error loading bookings. Using demo data instead.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="hidden md:table-header-group">
                                <tr className="bg-gray-50">
                                    <th className="px-3 py-2 md:px-4 md:py-3 text-left text-xs md:text-sm font-medium text-gray-500">
                                        <div className="flex items-center">
                                            Reference
                                            <ArrowUpDown className="h-3 w-3 md:h-4 md:w-4 ml-1 text-gray-400" />
                                        </div>
                                    </th>
                                    <th className="px-3 py-2 md:px-4 md:py-3 text-left text-xs md:text-sm font-medium text-gray-500">Customer</th>
                                    <th className="px-3 py-2 md:px-4 md:py-3 text-left text-xs md:text-sm font-medium text-gray-500">Flight</th>
                                    <th className="hidden lg:table-cell px-3 py-2 md:px-4 md:py-3 text-left text-xs md:text-sm font-medium text-gray-500">Route</th>
                                    <th className="px-3 py-2 md:px-4 md:py-3 text-left text-xs md:text-sm font-medium text-gray-500">Date</th>
                                    <th className="px-3 py-2 md:px-4 md:py-3 text-left text-xs md:text-sm font-medium text-gray-500">Status</th>
                                    <th className="px-3 py-2 md:px-4 md:py-3 text-left text-xs md:text-sm font-medium text-gray-500">Amount</th>
                                    <th className="px-3 py-2 md:px-4 md:py-3 text-center text-xs md:text-sm font-medium text-gray-500">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {currentBookings.map((booking) => (
                                    <tr key={booking.id} className="hover:bg-gray-50 flex flex-col md:table-row border-b md:border-0">
                                        <td className="px-3 py-2 md:px-4 md:py-3 text-sm font-medium text-gray-900">
                                            <span className="md:hidden font-medium text-gray-500">Reference: </span>
                                            {booking.reference}
                                        </td>
                                        <td className="px-3 py-2 md:px-4 md:py-3 text-sm text-gray-500">
                                            <span className="md:hidden font-medium text-gray-500">Customer: </span>
                                            {booking.customer}
                                        </td>
                                        <td className="px-3 py-2 md:px-4 md:py-3 text-sm text-gray-500">
                                            <span className="md:hidden font-medium text-gray-500">Flight: </span>
                                            {booking.flight}
                                        </td>
                                        <td className="px-3 py-2 md:px-4 md:py-3 text-sm text-gray-500 hidden lg:table-cell">
                                            <div className="flex items-center">
                                                {booking.departure}
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mx-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                                {booking.arrival}
                                            </div>
                                        </td>
                                        <td className="px-3 py-2 md:px-4 md:py-3 text-sm text-gray-500">
                                            <span className="md:hidden font-medium text-gray-500">Date: </span>
                                            {booking.date}
                                        </td>
                                        <td className="px-3 py-2 md:px-4 md:py-3 text-sm">
                                            <span className="md:hidden font-medium text-gray-500">Status: </span>
                                            <span className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusClass(booking.status)}`}>
                                                {getStatusIcon(booking.status)}
                                                {booking.status}
                                            </span>
                                        </td>
                                        <td className="px-3 py-2 md:px-4 md:py-3 text-sm text-gray-500">
                                            <span className="md:hidden font-medium text-gray-500">Amount: </span>
                                            <div className='flex items-center' >
                                            <span className='text-[15px]' >{getCurrencyIcon(booking.currency)}</span>
                                            <span>{booking.amount} </span>  
                                            </div>
                                        </td>
                                        <td className="px-3 py-2 md:px-4 md:py-3 text-sm">
                                            <div className="flex justify-start md:justify-center space-x-2">
                                                <button className="p-1 rounded hover:bg-blue-100">
                                                    <Calendar className="h-4 w-4 text-blue-600" />
                                                </button>
                                                <button className="p-1 rounded hover:bg-yellow-100">
                                                    <AlertCircle className="h-4 w-4 text-yellow-600" />
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
                )}

                <div className="px-3 py-2 md:px-4 md:py-3 border-t flex flex-col md:flex-row items-center justify-between">
                    <p className="text-xs md:text-sm text-gray-500 mb-2 md:mb-0">
                        Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, bookings.length)} of {bookings.length} bookings
                    </p>
                    <div className="flex flex-wrap justify-center space-x-1">
                        <button
                            onClick={prevPage}
                            disabled={currentPage === 1}
                            className={`px-2 py-1 text-xs md:text-sm border rounded hover:bg-gray-50 ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            Previous
                        </button>

                        {getPaginationGroup().map((number) => (
                            <button
                                key={number}
                                onClick={() => paginate(number)}
                                className={`px-2 py-1 text-xs md:text-sm border rounded ${currentPage === number ? 'bg-green-50 text-green-600' : 'hover:bg-gray-50'
                                    }`}
                            >
                                {number}
                            </button>
                        ))}

                        <button
                            onClick={nextPage}
                            disabled={currentPage === totalPages}
                            className={`px-2 py-1 text-xs md:text-sm border rounded hover:bg-gray-50 ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>

            {/* Render the booking form modal when isFormOpen is true */}
            {isFormOpen && (
                <BookingForm
                    onClose={() => setIsFormOpen(false)}
                    onSave={handleSaveBooking}
                />
            )}
        </div>
    );
}