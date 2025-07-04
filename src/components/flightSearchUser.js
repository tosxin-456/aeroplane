import { useState, useEffect } from "react";
import {
    Plane, Calendar, Luggage, Timer, MapPin,
    ChevronDown, ChevronUp, CircleDot, Circle, Briefcase,
    Clock, Users, Shield, ArrowRight, ArrowUpRight, Star,
    Wifi, Coffee, Monitor, Utensils, Heart, TrendingUp,
    Award, CheckCircle, AlertCircle, Info, Zap, Globe
} from "lucide-react";

import { FaEuroSign, FaNairaSign } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/apiConfig";
import FlightCheckinModal from "./flight.modal";

// Mock currency icons since we can't import react-icons
const currencyIcons = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    NGN: "₦",
    JPY: "¥",
    INR: "₹",
};

export default function FlightSearchUser({ flights = [] }) {
    const [expandedFlight, setExpandedFlight] = useState(null);
    const [hoveredFlight, setHoveredFlight] = useState(null);
    const [airlineData, setAirlineData] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [checkinUrl, setCheckinUrl] = useState('');
    const [showModal, setShowModal] = useState(false);

    const [filters, setFilters] = useState({
        airline: '',
        maxPrice: '',
        tripType: 'all', // 'all', 'roundtrip', 'oneway'
        stops: 'all' // 'all', 'nonstop', 'onestop', 'twostop'
    });

    // Get unique airlines for filter dropdown

    // Reset filters function
    const resetFilters = () => {
        setFilters({
            airline: '',
            maxPrice: '',
            tripType: 'all',
            stops: 'all'
        });
    };

    const navigate = useNavigate()

    // Fetch airline data when component mounts
    useEffect(() => {
        const fetchAirlineData = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/airline`);
                if (!response.ok) {
                    throw new Error('Failed to fetch airline data');
                }
                const data = await response.json();
                // Convert array to object with iata_code as key
                const airlineMap = {};
                data.forEach(airline => {
                    airlineMap[airline.iata_code] = airline.name;
                });
                setAirlineData(airlineMap);
            } catch (error) {
                console.error('Error fetching airline data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAirlineData();
    }, []);



    // Get airline name from code
    const getAirlineName = (code) => {
        return airlineData[code] || code;
    };

    // Calculate price with 10% markup (as per original code)
    const calculatePriceWithMarkup = (originalPrice) => {
        const original = parseFloat(originalPrice);
        const markedUp = original * 1.10;
        return {
            original: original.toFixed(2),
            markedUp: markedUp.toFixed(2)
        };
    };

    // Expand/collapse flight
    const toggleFlightDetails = (id) => {
        setExpandedFlight(prev => prev === id ? null : id);
    };

    // Format helpers
    const formatDateTime = (str) => {
        const date = new Date(str);
        return {
            date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
            day: date.toLocaleDateString('en-US', { weekday: 'short' })
        };
    };

    const formatDuration = (str) => {
        // Handle ISO 8601 duration format (PT8H30M)
        const h = str.match(/(\d+)H/);
        const m = str.match(/(\d+)M/);
        return `${h ? `${h[1]}h ` : ''}${m ? `${m[1]}m` : ''}`;
    };

    const getConnectionLabel = (segments) => {
        const stopCount = segments.length - 1;
        if (stopCount === 0) return "Nonstop";
        if (stopCount === 1) return "1 connection";
        return `${stopCount} connections`;
    };

    function isRoundTrip(flight) {
        if (!flight || !Array.isArray(flight.slices)) {
            return false;
        }
        return flight.slices.length === 2;
    }

    if (isLoading) {
        return (
            <div className="max-w-5xl mx-auto p-4 sm:p-6 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl shadow-lg">
                <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4 animate-pulse">
                        <Plane className="text-white animate-bounce" size={24} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Finding Your Perfect Flight</h2>
                    <div className="flex justify-center items-center space-x-2">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                        <span className="text-gray-600">Searching hundreds of airlines...</span>
                    </div>
                </div>
            </div>
        );
    }

    // Helper function to render flight timeline
    const renderFlightTimeline = (slice, index) => {
        const segs = slice.segments;
        const dep = segs[0].departing_at;
        const arr = segs[segs.length - 1].arriving_at;
        const depAirport = segs[0].origin.iata_code;
        const arrAirport = segs[segs.length - 1].destination.iata_code;

        return (
            <div className="mb-6">
                {index > 0 && (
                    <div className="text-sm flex items-center text-emerald-600 font-medium mb-3 pb-2 border-b border-emerald-100">
                        <ArrowUpRight size={16} className="mr-2 animate-pulse" />
                        Return Journey
                    </div>
                )}

                {index === 0 && isRoundTrip({ slices: [slice] }) && (
                    <div className="text-sm flex items-center text-blue-600 font-medium mb-3 pb-2 border-b border-blue-100">
                        <Plane size={16} className="mr-2" />
                        Outbound Journey
                    </div>
                )}

                {/* Mobile Timeline View */}
                <div className="flex justify-between items-center sm:hidden mb-4 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl">
                    <div className="text-left">
                        <div className="text-2xl font-bold text-gray-800 flex items-center">
                            {formatDateTime(dep).time}
                            <Clock size={16} className="ml-2 text-blue-500" />
                        </div>
                        <div className="flex items-center mt-1">
                            <MapPin size={14} className="mr-1 text-blue-500" />
                            <span className="font-semibold text-gray-700">{depAirport}</span>
                        </div>
                    </div>

                    <div className="flex flex-col items-center px-4">
                        <div className="text-xs text-gray-600 font-medium mb-1 flex items-center">
                            <Timer size={12} className="mr-1" />
                            {formatDuration(slice.duration || segs[0].duration)}
                        </div>
                        <div className="relative">
                            <ArrowRight size={24} className="text-blue-500 animate-pulse" />
                            <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-400 rounded-full animate-ping"></div>
                        </div>
                        <div className={`text-xs font-medium rounded-full px-3 py-1 mt-1 shadow-sm ${segs.length > 1 ? 'bg-amber-100 text-amber-700 border border-amber-200' : 'bg-emerald-100 text-emerald-700 border border-emerald-200'}`}>
                            {getConnectionLabel(segs)}
                        </div>
                    </div>

                    <div className="text-right">
                        <div className="text-2xl font-bold text-gray-800 flex items-center">
                            <Clock size={16} className="mr-2 text-blue-500" />
                            {formatDateTime(arr).time}
                        </div>
                        <div className="flex items-center justify-end mt-1">
                            <MapPin size={14} className="mr-1 text-blue-500" />
                            <span className="font-semibold text-gray-700">{arrAirport}</span>
                        </div>
                    </div>
                </div>

                {/* Enhanced Desktop Timeline */}
                <div className="hidden sm:flex justify-between w-full items-center bg-gradient-to-r from-blue-50 via-white to-blue-50 p-6 rounded-xl shadow-sm">
                    <div className="text-left">
                        <div className="text-2xl font-bold text-gray-800 flex items-center">
                            {formatDateTime(dep).time}
                            <Clock size={18} className="ml-2 text-blue-500" />
                        </div>
                        <div className="flex items-center mt-2">
                            <MapPin size={16} className="mr-2 text-blue-500" />
                            <span className="font-semibold text-gray-700 text-lg">{depAirport}</span>
                        </div>
                        <div className="text-sm text-gray-500 mt-1 flex items-center">
                            <Calendar size={14} className="mr-1" />
                            {formatDateTime(dep).day}, {formatDateTime(dep).date}
                        </div>
                    </div>

                    {/* Enhanced Flight Path */}
                    <div className="flex flex-col items-center px-8 flex-1 max-w-md">
                        <div className="text-sm text-gray-600 font-medium flex items-center mb-2">
                            <Timer size={14} className="mr-2 text-blue-500" />
                            {formatDuration(slice.duration || segs[0].duration)}
                        </div>
                        <div className="relative w-full my-4">
                            <div className="border-t-2 border-dashed border-blue-300 absolute w-full top-1/2 animate-pulse" />
                            <div className="absolute -top-2 left-0">
                                <div className="w-4 h-4 bg-blue-500 rounded-full shadow-lg animate-pulse" />
                            </div>

                            {segs.length > 1 && segs.map((_, idx) => {
                                if (idx === 0) return null;
                                return (
                                    <div key={idx} className="absolute -top-2" style={{ left: `${(idx / segs.length) * 100}%` }}>
                                        <div className="w-3 h-3 bg-amber-500 rounded-full shadow animate-bounce" style={{ animationDelay: `${idx * 0.2}s` }} />
                                    </div>
                                );
                            })}

                            <div className="absolute -top-2 right-0">
                                <div className="w-4 h-4 bg-emerald-500 rounded-full shadow-lg animate-pulse" />
                            </div>
                        </div>
                        <div className={`text-xs font-semibold rounded-full px-4 py-2 shadow-sm transition-all hover:shadow-md ${segs.length > 1 ? 'bg-gradient-to-r from-amber-100 to-amber-200 text-amber-800 border border-amber-300' : 'bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-800 border border-emerald-300'}`}>
                            {getConnectionLabel(segs)}
                        </div>
                    </div>

                    <div className="text-right">
                        <div className="text-2xl font-bold text-gray-800 flex items-center">
                            <Clock size={18} className="mr-2 text-blue-500" />
                            {formatDateTime(arr).time}
                        </div>
                        <div className="flex items-center justify-end mt-2">
                            <MapPin size={16} className="mr-2 text-blue-500" />
                            <span className="font-semibold text-gray-700 text-lg">{arrAirport}</span>
                        </div>
                        <div className="text-sm text-gray-500 mt-1 flex items-center justify-end">
                            <Calendar size={14} className="mr-1" />
                            {formatDateTime(arr).day}, {formatDateTime(arr).date}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Helper function to render detailed flight segments
    const renderDetailedSegments = (slice, sliceIndex) => {
        return slice.segments.map((seg, idx) => {
            const segAirlineCode = seg.operating_carrier.iata_code;
            const segAirlineName = getAirlineName(segAirlineCode);

            return (
                <div key={`${sliceIndex}-${idx}`} className="mb-6 pb-5 border-b border-blue-100 last:border-0 last:pb-0">
                    <div className="flex flex-col sm:flex-row sm:justify-between bg-white p-3 sm:p-4 rounded-xl shadow-sm mb-4">
                        <div className="flex items-center mb-2 sm:mb-0">
                            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-blue-50 flex items-center justify-center mr-2 sm:mr-3 border border-blue-100">
                                <Plane size={14} className="text-blue-600" />
                            </div>
                            <div>
                                <div className="font-medium text-gray-900 text-base sm:text-lg">{segAirlineName}</div>
                                <div className="text-xs sm:text-sm text-gray-500">
                                    {segAirlineCode} • Aircraft: {seg.aircraft?.name || 'N/A'}
                                </div>
                            </div>
                        </div>
                        <div className="text-left sm:text-right">
                            <div className="font-medium text-gray-900">{formatDuration(seg.duration)}</div>
                            <div className="text-xs sm:text-sm text-gray-500">Direct flight</div>
                        </div>
                    </div>

                    <div className="flex justify-between mb-2 px-2">
                        <div className="flex flex-col items-start text-sm">
                            <div className="font-bold text-gray-800">{formatDateTime(seg.departing_at).time}</div>
                            <div className="flex items-center mt-1">
                                <MapPin size={14} className="mr-1 text-blue-500" />
                                <span className="font-medium">{seg.origin.iata_code}</span>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">{seg.origin.name}</div>
                        </div>

                        <div className="flex flex-col items-end text-sm">
                            <div className="font-bold text-gray-800">{formatDateTime(seg.arriving_at).time}</div>
                            <div className="flex items-center mt-1">
                                <MapPin size={14} className="mr-1 text-blue-500" />
                                <span className="font-medium">{seg.destination.iata_code}</span>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">{seg.destination.name}</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
                        <div className="flex items-center text-sm text-gray-600">
                            <Users size={14} className="mr-2 text-blue-500" />
                            Economy Class
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                            <Shield size={14} className="mr-2 text-blue-500" />
                            Flight Protection Available
                        </div>
                    </div>
                </div>
            );
        });
    };

    const handleClick = (flight) => {

        navigate("/book/flight", {
            state: { flightData: flight }
        });
    };


    const displayFlights = flights?.offers
    console.log(displayFlights)

    const uniqueAirlines = [...new Set(displayFlights.map(flight => {
        const airlineCode = flight.owner?.iata_code || flight.slices[0].segments[0].operating_carrier.iata_code;
        return flight.owner?.name || getAirlineName(airlineCode);
    }))].sort();

    // Get price range
    const prices = displayFlights.map(flight => Number(calculatePriceWithMarkup(flight.total_amount).markedUp));
    const maxPrice = Math.max(...prices);

    // Filter flights based on current filters
    const filteredFlights = displayFlights.filter(flight => {
        const airlineCode = flight.owner?.iata_code || flight.slices[0].segments[0].operating_carrier.iata_code;
        const airlineName = flight.owner?.name || getAirlineName(airlineCode);
        const flightPrice = Number(calculatePriceWithMarkup(flight.total_amount).markedUp);
        const roundTrip = isRoundTrip(flight);
        const stops = flight.slices[0].segments.length - 1; // Number of stops in outbound

        // Airline filter
        if (filters.airline && airlineName !== filters.airline) return false;

        // Price filter
        if (filters.maxPrice && flightPrice > Number(filters.maxPrice)) return false;

        // Trip type filter
        if (filters.tripType === 'roundtrip' && !roundTrip) return false;
        if (filters.tripType === 'oneway' && roundTrip) return false;

        // Stops filter
        if (filters.stops === 'nonstop' && stops > 0) return false;
        if (filters.stops === 'onestop' && stops !== 1) return false;
        if (filters.stops === 'twostop' && stops < 2) return false;

        return true;
    });


    return (
        <div className="max-w-6xl mx-auto p-4 sm:p-6 bg-gradient-to-br from-blue-50 via-white to-indigo-50 rounded-2xl shadow-xl">
            {/* Enhanced Header */}
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full mb-4 shadow-lg">
                    <Plane className="text-white" size={24} />
                </div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Your Flight Options</h2>
                <p className="text-gray-600 flex items-center justify-center">
                    <Globe size={16} className="mr-2" />
                    Found {displayFlights.length} amazing deals for your journey
                </p>
            </div>

            {/* Filters Section */}
            <div className="bg-white rounded-xl p-4 sm:p-6 mb-6 shadow-sm border">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                    <h3 className="font-semibold text-gray-800 mb-2 sm:mb-0 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
                        </svg>
                        Filter Results
                    </h3>
                    <button
                        onClick={resetFilters}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium self-start sm:self-auto"
                    >
                        Clear All
                    </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Airline Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Airline</label>
                        <select
                            value={filters.airline}
                            onChange={(e) => setFilters({ ...filters, airline: e.target.value })}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">All Airlines</option>
                            {uniqueAirlines.map(airline => (
                                <option key={airline} value={airline}>{airline}</option>
                            ))}
                        </select>
                    </div>

                    {/* Max Price Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Max Price {filters.maxPrice && `(${currencyIcons[displayFlights[0]?.total_currency] || displayFlights[0]?.total_currency}${Number(filters.maxPrice).toLocaleString()})`}
                        </label>
                        <input
                            type="range"
                            min="0"
                            max={maxPrice}
                            step="50"
                            value={filters.maxPrice || maxPrice}
                            onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                        />
                    </div>

                    {/* Trip Type Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Trip Type</label>
                        <select
                            value={filters.tripType}
                            onChange={(e) => setFilters({ ...filters, tripType: e.target.value })}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="all">All Types</option>
                            <option value="roundtrip">Round Trip</option>
                            <option value="oneway">One Way</option>
                        </select>
                    </div>

                    {/* Stops Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Stops</label>
                        <select
                            value={filters.stops}
                            onChange={(e) => setFilters({ ...filters, stops: e.target.value })}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="all">All</option>
                            <option value="nonstop">Non-stop</option>
                            <option value="onestop">1 Stop</option>
                            <option value="twostop">2+ Stops</option>
                        </select>
                    </div>
                </div>

                {/* Results count */}
                <div className="mt-4 text-sm text-gray-600">
                    Showing {filteredFlights.length} of {displayFlights.length} flights
                </div>
            </div>

            {filteredFlights?.map((flight) => {
                const flightId = flight.id;
                const isExpanded = expandedFlight === flightId;
                const isHovered = hoveredFlight === flightId;
                const airlineCode = flight.owner?.iata_code || flight.slices[0].segments[0].operating_carrier.iata_code;
                const airlineName = flight.owner?.name || getAirlineName(airlineCode);
                const roundTrip = isRoundTrip(flight);
                const aeroplaneImage = flight.owner?.logo_symbol_url
                // Calculate prices
                const prices = calculatePriceWithMarkup(flight.total_amount);

                // Get outbound flight details (first slice)
                const outboundSegs = flight.slices[0].segments;
                const outboundDep = outboundSegs[0].departing_at;
                const outboundArr = outboundSegs[outboundSegs.length - 1].arriving_at;

                // Get return flight details if it's a round trip
                const returnSegs = roundTrip ? flight.slices[1].segments : null;
                const returnDep = returnSegs ? returnSegs[0].departing_at : null;
                const returnArr = returnSegs ? returnSegs[returnSegs.length - 1].arriving_at : null;

                return (
                    <div
                        key={flightId}
                        className={`mb-4 sm:mb-6 bg-white rounded-xl border transition-all duration-300 ${isExpanded ? 'shadow-md border-blue-200' : isHovered ? 'shadow-md' : ''}`}
                        onMouseEnter={() => setHoveredFlight(flightId)}
                        onMouseLeave={() => setHoveredFlight(null)}
                    >
                        {/* Main Card */}
                        <div
                            onClick={() => toggleFlightDetails(flightId)}
                            className={`p-4 sm:p-6 cursor-pointer transition-all duration-300 ${isExpanded ? 'border-l-4 border-blue-500 rounded-l-xl' : ''}`}
                        >
                            {/* Top Section - Airline & Price */}
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6">
                                <div className="flex items-center space-x-3 sm:space-x-4 mb-3 sm:mb-0">
                                    <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-blue-50 flex items-center justify-center shadow-sm">
                                        <Plane size={18} className="text-blue-600" />
                                    </div>
                                    <div>
                                        <img className="w-[25px]" src={`${aeroplaneImage}`} />
                                        <div className="font-semibold text-lg">{airlineName}</div>
                                        <div className="text-sm text-gray-500">
                                            {airlineCode}
                                            {roundTrip && ` • Round Trip`}
                                        </div>
                                    </div>
                                </div>

                                <div className="text-blue-700 font-bold text-xl sm:text-2xl flex items-center bg-blue-50 px-4 py-2 rounded-lg self-start sm:self-auto">
                                    <span className="mr-1 text-blue-600">{currencyIcons[flight.total_currency] || flight.total_currency}</span>
                                    {Number(prices.markedUp).toLocaleString()}
                                </div>
                            </div>

                            {/* Outbound Flight Timeline */}
                            {renderFlightTimeline(flight.slices[0], 0)}

                            {/* Return Flight Timeline (if round trip) */}
                            {roundTrip && renderFlightTimeline(flight.slices[1], 1)}

                            {/* Meta Info - Responsive Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 text-sm text-gray-600 border-t pt-4">
                                <div className="flex items-center bg-gray-50 p-2 rounded-lg">
                                    <Calendar size={16} className="mr-2 text-blue-500 shrink-0" />
                                    <span className="truncate">
                                        {roundTrip ? 'Round Trip' : 'One Way'} • {formatDateTime(outboundDep).date}
                                        {roundTrip && returnArr && ` to ${formatDateTime(returnArr).date}`}
                                    </span>
                                </div>
                                <div className="flex items-center bg-gray-50 p-2 rounded-lg">
                                    <Luggage size={16} className="mr-2 text-blue-500 shrink-0" />
                                    <span className="truncate">Economy Class</span>
                                </div>
                                <div className="flex items-center bg-gray-50 p-2 rounded-lg">
                                    <Timer size={16} className="mr-2 text-blue-500 shrink-0" />
                                    <span className="truncate">Book by: {new Date(flight.expires_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                </div>
                            </div>

                            {/* Expand Toggle and Select Button */}
                            <div className="flex flex-col sm:flex-row justify-between items-center mt-4 gap-3">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleClick(flight);
                                    }}
                                    className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm w-full sm:w-auto">
                                    Select Flight
                                </button>

                                <button className={`flex items-center text-sm font-medium px-3 sm:px-4 py-1.5 sm:py-2 rounded-full transition-colors ${isExpanded ? 'bg-blue-100 text-blue-700' : 'text-blue-600 hover:bg-blue-50'}`}>
                                    {isExpanded ? (
                                        <>Hide details <ChevronUp size={16} className="ml-1" /></>
                                    ) : (
                                        <>View details <ChevronDown size={16} className="ml-1" /></>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Expanded Details */}
                        {isExpanded && (
                            <div className="bg-blue-50 p-4 sm:p-6 border-t border-blue-100 rounded-b-xl transition-all duration-300">
                                {/* Outbound Flight Details */}
                                <div className="mb-6">
                                    <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                                        <Briefcase size={18} className="mr-2 text-blue-600" />
                                        {roundTrip ? 'Outbound Flight Details' : 'Flight Details'}
                                    </h3>
                                    {renderDetailedSegments(flight.slices[0], 0)}
                                </div>

                                {/* Return Flight Details (if round trip) */}
                                {roundTrip && (
                                    <div className="pt-4 border-t border-blue-100">
                                        <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                                            <Briefcase size={18} className="mr-2 text-blue-600" /> Return Flight Details
                                        </h3>
                                        {renderDetailedSegments(flight.slices[1], 1)}
                                    </div>
                                )}

                                <div className="mt-6 flex justify-center sm:justify-end">
                                    <button
                                        onClick={() => handleClick(flight)}
                                        className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm w-full sm:w-auto">
                                        Select Flight
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
            {/* Modal rendered outside of the conditional logic but controlled by showModal state */}
            {showModal && <FlightCheckinModal checkinUrl={checkinUrl} onClose={() => setShowModal(false)} />}
        </div>

    );
}