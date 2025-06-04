import React, { useState, useEffect } from 'react';
import { Copy, ExternalLink, Plane, Calendar, Users, MapPin, CheckCircle, Clock, AlertCircle, ChevronDown, ChevronUp, User, CreditCard, FileText, Phone, Mail } from 'lucide-react';
import { BsPassport } from 'react-icons/bs';
import { API_BASE_URL } from '../../config/apiConfig';

const FlightBookingsDisplay = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [copiedText, setCopiedText] = useState('');
    const [expandedSections, setExpandedSections] = useState({});

    // Mock data based on your provided data structure
    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/manual-booking`);
            if (!response.ok) {
                throw new Error('Failed to fetch bookings');
            }
            const data = await response.json();
            setBookings(data.data);
            console.log(data.data)
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = async (text, label) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedText(label);
            setTimeout(() => setCopiedText(''), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const openInNewTab = (url) => {
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString();
    };

    const formatCurrency = (amount, currency = 'USD') => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency.toUpperCase()
        }).format(amount);
    };

    const toggleSection = (bookingId, section) => {
        const key = `${bookingId}-${section}`;
        setExpandedSections(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'manually_confirmed':
                return <CheckCircle className="w-4 h-4 text-green-600" />;
            case 'pending':
                return <Clock className="w-4 h-4 text-yellow-600" />;
            case 'failed':
                return <AlertCircle className="w-4 h-4 text-red-600" />;
            default:
                return <Clock className="w-4 h-4 text-gray-600" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'manually_confirmed':
                return 'bg-green-100 text-green-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'failed':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const renderTravelerDetails = (booking) => {
        try {
            const travelers = JSON.parse(booking.travelersInfo);
            return travelers.map((traveler, index) => (
                <div key={index} className="border rounded-lg p-4 mb-4 bg-white">
                    <div className="flex items-center gap-2 mb-3">
                        <User className="w-5 h-5 text-blue-600" />
                        <h4 className="font-semibold text-gray-900">
                            {traveler.name.title} {traveler.name.firstName} {traveler.name.lastName}
                        </h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <h5 className="font-medium text-gray-700 mb-2">Personal Information</h5>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Date of Birth:</span>
                                    <span>{new Date(traveler.dateOfBirth).toLocaleDateString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Gender:</span>
                                    <span>{traveler.gender}</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h5 className="font-medium text-gray-700 mb-2">Contact Information</h5>
                            <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2">
                                    <Mail className="w-4 h-4 text-gray-400" />
                                    <span className="truncate">{traveler.contact.emailAddress}</span>
                                    <button
                                        onClick={() => copyToClipboard(traveler.contact.emailAddress, 'Email')}
                                        className="p-1 text-gray-400 hover:text-blue-600 rounded"
                                    >
                                        <Copy className="w-3 h-3" />
                                    </button>
                                </div>
                                {traveler.contact.phones.map((phone, phoneIndex) => (
                                    <div key={phoneIndex} className="flex items-center gap-2">
                                        <Phone className="w-4 h-4 text-gray-400" />
                                        <span>+{phone.countryCallingCode} {phone.number}</span>
                                        <button
                                            onClick={() => copyToClipboard(`+${phone.countryCallingCode}${phone.number}`, 'Phone')}
                                            className="p-1 text-gray-400 hover:text-blue-600 rounded"
                                        >
                                            <Copy className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {traveler.documents && traveler.documents.length > 0 && (
                        <div className="mt-4 pt-4 border-t">
                            <h5 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
                                <BsPassport className="w-4 h-4" />
                                Travel Documents
                            </h5>
                            {traveler.documents.map((doc, docIndex) => (
                                <div key={docIndex} className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm bg-gray-50 p-3 rounded">
                                    <div>
                                        <span className="text-gray-600">Type:</span>
                                        <div className="font-medium">{doc.documentType}</div>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Number:</span>
                                        <div className="font-mono flex items-center gap-2">
                                            {doc.number}
                                            <button
                                                onClick={() => copyToClipboard(doc.number, 'Document Number')}
                                                className="p-1 text-gray-400 hover:text-blue-600 rounded"
                                            >
                                                <Copy className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Expiry:</span>
                                        <div>{new Date(doc.expiryDate).toLocaleDateString()}</div>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Nationality:</span>
                                        <div>{doc.nationality}</div>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Issued in:</span>
                                        <div>{doc.issuanceCountry}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ));
        } catch (error) {
            return <div className="text-red-600 text-sm">Error parsing traveler information</div>;
        }
    };

    const renderPaymentDetails = (booking) => {
        try {
            const payment = JSON.parse(booking.paymentDetails);
            return (
                <div className="border rounded-lg p-4 bg-white">
                    <div className="flex items-center gap-2 mb-4">
                        <CreditCard className="w-5 h-5 text-green-600" />
                        <h4 className="font-semibold text-gray-900">Payment Information</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${payment.status === 'succeeded' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                            {payment.status.toUpperCase()}
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Total Amount:</span>
                                <span className="font-semibold text-lg">
                                    {formatCurrency(payment.totalAmount, payment.currency)}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Total Flight Price:</span>
                                <span className="font-semibold text-lg">
                                    {formatCurrency(payment.totalPrice, payment.currency)}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Total Charge:</span>
                                <span className="font-semibold text-lg">
                                    {formatCurrency(payment.totalCharge, payment.currency)}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Customer:</span>
                                <span>{payment.customerName}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Email:</span>
                                <span className="truncate">{payment.customerEmail}</span>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Payment Method ID:</span>
                                <div className="flex items-center gap-2">
                                    <span className="font-mono text-sm">{payment.paymentMethodId.slice(-8)}</span>
                                    <button
                                        onClick={() => copyToClipboard(payment.paymentMethodId, 'Payment Method ID')}
                                        className="p-1 text-gray-400 hover:text-blue-600 rounded"
                                    >
                                        <Copy className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Processed:</span>
                                <span>{formatDate(payment.timestamp)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            );
        } catch (error) {
            return <div className="text-red-600 text-sm">Error parsing payment information</div>;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Plane className="w-8 h-8 text-blue-600 animate-bounce mx-auto mb-4" />
                    <p className="text-gray-600">Loading flight bookings...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-4" />
                    <p className="text-red-600">Error: {error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <Plane className="w-8 h-8 text-blue-600" />
                        Flight Bookings Management
                    </h1>
                    <p className="mt-2 text-gray-600">
                        {bookings.length} booking{bookings.length !== 1 ? 's' : ''} found
                    </p>
                </div>

                {copiedText && (
                    <div className="fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-md shadow-lg z-50">
                        Copied {copiedText}!
                    </div>
                )}

                <div className="grid gap-6">
                    {bookings.map((booking) => (
                        <div key={booking.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                            <div className="p-6">
                                {/* Header */}
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl font-bold text-gray-900">
                                            {booking.airlineCode}
                                        </span>
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${getStatusColor(booking.status)}`}>
                                            {getStatusIcon(booking.status)}
                                            {booking.status.replace('_', ' ').toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-gray-500">Booking ID</p>
                                        <p className="font-mono text-lg font-semibold">#{booking.id}</p>
                                    </div>
                                </div>

                                {/* Flight Route */}
                                <div className="flex items-center justify-between mb-6 p-4 bg-blue-50 rounded-lg">
                                    <div className="text-center">
                                        <MapPin className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                                        <p className="text-sm text-gray-600">From</p>
                                        <p className="text-xl font-bold text-gray-900">{booking.origin}</p>
                                    </div>
                                    <div className="flex-1 flex items-center justify-center">
                                        <div className="w-16 h-0.5 bg-blue-300"></div>
                                        <Plane className="w-6 h-6 text-blue-600 mx-2" />
                                        <div className="w-16 h-0.5 bg-blue-300"></div>
                                    </div>
                                    <div className="text-center">
                                        <MapPin className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                                        <p className="text-sm text-gray-600">To</p>
                                        <p className="text-xl font-bold text-gray-900">{booking.destination}</p>
                                    </div>
                                </div>

                                {/* Flight Details Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Calendar className="w-4 h-4 text-gray-600" />
                                            <span className="text-sm font-medium text-gray-600">Departure</span>
                                        </div>
                                        <p className="text-sm font-mono">{formatDate(booking.departureTime)}</p>
                                    </div>

                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Calendar className="w-4 h-4 text-gray-600" />
                                            <span className="text-sm font-medium text-gray-600">Arrival</span>
                                        </div>
                                        <p className="text-sm font-mono">{formatDate(booking.arrivalTime)}</p>
                                    </div>

                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Users className="w-4 h-4 text-gray-600" />
                                            <span className="text-sm font-medium text-gray-600">Travelers</span>
                                        </div>
                                        <p className="text-lg font-semibold">{booking.travelerCount}</p>
                                    </div>

                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-sm font-medium text-gray-600">Created</span>
                                        </div>
                                        <p className="text-sm">{formatDate(booking.createdAt)}</p>
                                    </div>
                                </div>

                                {/* Copyable Information */}
                                <div className="space-y-3 mb-6">
                                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">Booking Reference</p>
                                            <p className="font-mono text-lg">{booking.bookingReference}</p>
                                        </div>
                                        <button
                                            onClick={() => copyToClipboard(booking.bookingReference, 'Booking Reference')}
                                            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                        >
                                            <Copy className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">Flight Offer ID</p>
                                            <p className="font-mono">{booking.flightOfferId}</p>
                                        </div>
                                        <button
                                            onClick={() => copyToClipboard(booking.flightOfferId, 'Flight Offer ID')}
                                            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                        >
                                            <Copy className="w-4 h-4" />
                                        </button>
                                    </div>

                                    {booking.checkInLink && (
                                        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-600">Check-in Link</p>
                                                <p className="font-mono text-sm text-blue-600 truncate">
                                                    {booking.checkInLink}
                                                </p>
                                            </div>
                                            <div className="flex gap-2 ml-4">
                                                <button
                                                    onClick={() => copyToClipboard(booking.checkInLink, 'Check-in Link')}
                                                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-100 rounded-md transition-colors"
                                                >
                                                    <Copy className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => openInNewTab(booking.checkInLink)}
                                                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-100 rounded-md transition-colors"
                                                >
                                                    <ExternalLink className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Expandable Sections */}
                                <div className="space-y-4">
                                    {/* Traveler Details Section */}
                                    <div className="border rounded-lg">
                                        <button
                                            onClick={() => toggleSection(booking.id, 'travelers')}
                                            className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                                        >
                                            <div className="flex items-center gap-2">
                                                <User className="w-5 h-5 text-blue-600" />
                                                <span className="font-medium">Traveler Details</span>
                                            </div>
                                            {expandedSections[`${booking.id}-travelers`] ?
                                                <ChevronUp className="w-5 h-5 text-gray-400" /> :
                                                <ChevronDown className="w-5 h-5 text-gray-400" />
                                            }
                                        </button>
                                        {expandedSections[`${booking.id}-travelers`] && (
                                            <div className="p-4 border-t bg-gray-50">
                                                {renderTravelerDetails(booking)}
                                            </div>
                                        )}
                                    </div>

                                    {/* Payment Details Section */}
                                    <div className="border rounded-lg">
                                        <button
                                            onClick={() => toggleSection(booking.id, 'payment')}
                                            className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                                        >
                                            <div className="flex items-center gap-2">
                                                <CreditCard className="w-5 h-5 text-green-600" />
                                                <span className="font-medium">Payment Details</span>
                                            </div>
                                            {expandedSections[`${booking.id}-payment`] ?
                                                <ChevronUp className="w-5 h-5 text-gray-400" /> :
                                                <ChevronDown className="w-5 h-5 text-gray-400" />
                                            }
                                        </button>
                                        {expandedSections[`${booking.id}-payment`] && (
                                            <div className="p-4 border-t bg-gray-50">
                                                {renderPaymentDetails(booking)}
                                            </div>
                                        )}
                                    </div>

                                    {/* Booking Data Section */}
                                    <div className="border rounded-lg">
                                        <button
                                            onClick={() => toggleSection(booking.id, 'booking-data')}
                                            className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                                        >
                                            <div className="flex items-center gap-2">
                                                <FileText className="w-5 h-5 text-purple-600" />
                                                <span className="font-medium">Raw Booking Data</span>
                                            </div>
                                            {expandedSections[`${booking.id}-booking-data`] ?
                                                <ChevronUp className="w-5 h-5 text-gray-400" /> :
                                                <ChevronDown className="w-5 h-5 text-gray-400" />
                                            }
                                        </button>
                                        {expandedSections[`${booking.id}-booking-data`] && (
                                            <div className="p-4 border-t bg-gray-50">
                                                <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                                                    <pre>{JSON.stringify(JSON.parse(booking.amadeusBookingData), null, 2)}</pre>
                                                </div>
                                                <button
                                                    onClick={() => copyToClipboard(booking.amadeusBookingData, 'Booking Data')}
                                                    className="mt-2 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                                                >
                                                    Copy Raw Data
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {bookings.length === 0 && (
                    <div className="text-center py-12">
                        <Plane className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
                        <p className="text-gray-600">There are no flight bookings to display.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FlightBookingsDisplay;