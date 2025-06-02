import { useState, useEffect } from "react";
import {
    Plane, Calendar, Luggage, Timer, MapPin,
    ChevronDown, ChevronUp, CircleDot, Circle, Briefcase,
    Clock, Users, Shield, ArrowRight, ArrowUpRight
} from "lucide-react";
import { FaDollarSign, FaPoundSign, FaRupeeSign, FaYenSign } from "react-icons/fa";
import { FaEuroSign, FaNairaSign } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/apiConfig";
import FlightCheckinModal from "./flight.modal";

const currencyIcons = {
    USD: <FaDollarSign />,
    EUR: <FaEuroSign />,
    GBP: <FaPoundSign />,
    NGN: <FaNairaSign />,
    JPY: <FaYenSign />,
    INR: <FaRupeeSign />,
};

export default function FlightSearchUser({ flights }) {
    const [expandedFlight, setExpandedFlight] = useState(null);
    const [hoveredFlight, setHoveredFlight] = useState(null);
    const [airlineData, setAirlineData] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [checkinUrl, setCheckinUrl] = useState('');
    const [showModal, setShowModal] = useState(false);

    // Fetch airline data when component mounts
    useEffect(() => {
        const fetchAirlineData = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/airline`);
                if (!response.ok) {
                    throw new Error('Failed to fetch airline data');
                }
                const data = await response.json();
                setAirlineData(data);
            } catch (error) {
                console.error('Error fetching airline data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAirlineData();
    }, []);
    const navigate = useNavigate()

    // Get airline name from code
    const getAirlineName = (code) => {
        return airlineData[code] || code;
    };

    // Calculate price with 15% markup
    const calculatePriceWithMarkup = (originalPrice) => {
        const original = parseFloat(originalPrice);
        const markedUp = original * 1.15;
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
        const h = str.match(/(\d+)H/), m = str.match(/(\d+)M/);
        return `${h ? `${h[1]}h ` : ''}${m ? `${m[1]}m` : ''}`;
    };

    const getConnectionLabel = (segments) => {
        const stopCount = segments.length - 1;
        if (stopCount === 0) return "Nonstop";
        if (stopCount === 1) return "1 connection";
        return `${stopCount} connections`;
    };

    function isRoundTrip(flight) {
        if (!flight || !Array.isArray(flight.itineraries)) {
            return false;
        }
        return flight.itineraries.length === 2;
    }

    const handleClick = (flight) => {
        // Calculate both prices for passing to booking
        const prices = calculatePriceWithMarkup(flight.price.grandTotal);

        // Create enhanced flight data with both original and marked up prices
        const enhancedFlightData = {
            ...flight,
            pricing: {
                original: {
                    amount: prices.original,
                    currency: flight.price.currency
                },
                display: {
                    amount: prices.markedUp,
                    currency: flight.price.currency
                }
            }
        };

        navigate("/book/flight", {
            state: { flightData: enhancedFlightData }
        });
    };

    const handleSubmit = async (airlineCode) => {
        try {
            const response = await fetch(`${API_BASE_URL}/flights/get-link`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ airlineCode }),
            });

            const result = await response.json();

            if (!response.ok) throw new Error(result.message || "Failed to fetch flights");

            console.log("Flight search result:", result);

            if (result.checkinUrl) {
                setCheckinUrl(result.checkinUrl);
                setShowModal(true);
            }

        } catch (error) {
            console.error("Error searching flights:", error);
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="max-w-4xl mx-auto p-4 sm:p-6 bg-gray-50 rounded-xl sm:rounded-2xl shadow-sm">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6 sm:mb-8 flex items-center">
                    <Plane className="mr-2 sm:mr-3 text-blue-600" /> Loading Flight Results...
                </h2>
                <div className="flex justify-center items-center h-40">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </div>
        );
    }

    // Helper function to render flight timeline
    const renderFlightTimeline = (itinerary, index) => {
        const segs = itinerary.segments;
        const dep = segs[0].departure;
        const arr = segs[segs.length - 1].arrival;

        return (
            <div className="mb-6">
                {index > 0 && (
                    <div className="text-sm flex items-center text-blue-600 font-medium mb-3 pb-2 border-b border-blue-100">
                        <ArrowUpRight size={16} className="mr-2" />
                        Return Flight
                    </div>
                )}

                {index === 0 && isRoundTrip(flights) && (
                    <div className="text-sm flex items-center text-blue-600 font-medium mb-3 pb-2 border-b border-blue-100">
                        <Plane size={16} className="mr-2" />
                        Outbound Flight
                    </div>
                )}

                {/* Flight Timeline (Mobile: Stack, Desktop: Horizontal) */}
                <div className="flex flex-col sm:flex-row justify-between mb-4 sm:mb-6 sm:items-center">
                    {/* Mobile Timeline View */}
                    <div className="flex justify-between items-center sm:hidden mb-4">
                        {/* Departure */}
                        <div className="text-left">
                            <div className="text-lg font-bold text-gray-800">{formatDateTime(dep.at).time}</div>
                            <div className="flex items-center">
                                <MapPin size={14} className="mr-1 text-blue-500" />
                                <span className="font-medium text-gray-700">{dep.iataCode}</span>
                            </div>
                        </div>

                        {/* Arrow */}
                        <div className="flex flex-col items-center px-3">
                            <div className="text-xs text-gray-600 font-medium mb-1">
                                {formatDuration(itinerary.duration)}
                            </div>
                            <ArrowRight size={20} className="text-blue-500" />
                            <div className={`text-xs font-medium rounded-full px-2 py-0.5 mt-1 ${segs.length > 1 ? 'bg-amber-50 text-amber-700' : 'bg-green-50 text-green-700'}`}>
                                {getConnectionLabel(segs)}
                            </div>
                        </div>

                        {/* Arrival */}
                        <div className="text-right">
                            <div className="text-lg font-bold text-gray-800">{formatDateTime(arr.at).time}</div>
                            <div className="flex items-center justify-end">
                                <MapPin size={14} className="mr-1 text-blue-500" />
                                <span className="font-medium text-gray-700">{arr.iataCode}</span>
                            </div>
                        </div>
                    </div>

                    {/* Desktop Timeline View */}
                    <div className="hidden sm:flex justify-between w-full items-center">
                        {/* Departure */}
                        <div className="text-left">
                            <div className="text-xl font-bold text-gray-800">{formatDateTime(dep.at).time}</div>
                            <div className="flex items-center mt-1">
                                <MapPin size={14} className="mr-1 text-blue-500" />
                                <span className="font-medium text-gray-700">{dep.iataCode}</span>
                            </div>
                            <div className="text-sm text-gray-500 mt-1">{formatDateTime(dep.at).day}, {formatDateTime(dep.at).date.split(", ")[0]}</div>
                        </div>

                        {/* Flight Path Visualization */}
                        <div className="flex flex-col items-center px-4 md:px-8 flex-1 max-w-sm">
                            <div className="text-sm text-gray-600 font-medium flex items-center">
                                <Clock size={14} className="mr-1 text-blue-500" />
                                {formatDuration(itinerary.duration)}
                            </div>
                            <div className="relative w-full my-3">
                                <div className="border-t-2 border-gray-200 absolute w-full top-1/2" />
                                <div className="absolute -top-1 left-0">
                                    <Circle size={12} className="text-blue-500 fill-blue-500" />
                                </div>

                                {segs.length > 1 && segs.map((_, idx) => {
                                    if (idx === 0) return null;
                                    return (
                                        <div key={idx} className="absolute -top-1" style={{ left: `${(idx / segs.length) * 100}%` }}>
                                            <CircleDot size={14} className="text-blue-500" />
                                        </div>
                                    );
                                })}

                                <div className="absolute -top-1 right-0">
                                    <Circle size={12} className="text-blue-500 fill-blue-500" />
                                </div>
                            </div>
                            <div className={`text-xs font-medium rounded-full px-3 py-1 ${segs.length > 1 ? 'bg-amber-50 text-amber-700' : 'bg-green-50 text-green-700'}`}>
                                {getConnectionLabel(segs)}
                            </div>
                        </div>

                        {/* Arrival */}
                        <div className="text-right">
                            <div className="text-xl font-bold text-gray-800">{formatDateTime(arr.at).time}</div>
                            <div className="flex items-center justify-end mt-1">
                                <MapPin size={14} className="mr-1 text-blue-500" />
                                <span className="font-medium text-gray-700">{arr.iataCode}</span>
                            </div>
                            <div className="text-sm text-gray-500 mt-1">{formatDateTime(arr.at).day}, {formatDateTime(arr.at).date.split(", ")[0]}</div>
                        </div>
                    </div>
                </div>

                {/* Date & Day Info - Mobile Only */}
                <div className="flex justify-between text-xs text-gray-500 mb-4 sm:hidden">
                    <div>{formatDateTime(dep.at).day}, {formatDateTime(dep.at).date.split(", ")[0]}</div>
                    <div>{formatDateTime(arr.at).day}, {formatDateTime(arr.at).date.split(", ")[0]}</div>
                </div>
            </div>
        );
    };

    // Helper function to render detailed flight segments
    const renderDetailedSegments = (itinerary, itineraryIndex) => {
        return itinerary.segments.map((seg, idx) => {
            const segAirlineCode = seg.carrierCode;
            const segAirlineName = getAirlineName(segAirlineCode);

            return (
                <div key={`${itineraryIndex}-${idx}`} className="mb-6 pb-5 border-b border-blue-100 last:border-0 last:pb-0">
                    <div className="flex flex-col sm:flex-row sm:justify-between bg-white p-3 sm:p-4 rounded-xl shadow-sm mb-4">
                        <div className="flex items-center mb-2 sm:mb-0">
                            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-blue-50 flex items-center justify-center mr-2 sm:mr-3 border border-blue-100">
                                <Plane size={14} className="text-blue-600" />
                            </div>
                            <div>
                                <div className="font-medium text-gray-900 text-base sm:text-lg">{segAirlineName}</div>
                                <div className="text-xs sm:text-sm text-gray-500">
                                    {segAirlineCode} {seg.number} • Aircraft: {seg.aircraft.code}
                                </div>
                            </div>
                        </div>
                        <div className="text-left sm:text-right">
                            <div className="font-medium text-gray-900">{formatDuration(seg.duration)}</div>
                            <div className="text-xs sm:text-sm text-gray-500">{seg.numberOfStops === 0 ? 'Direct flight' : `${seg.numberOfStops} stop(s)`}</div>
                        </div>
                    </div>

                    <div className="flex justify-between mb-2 px-2">
                        <div className="flex flex-col items-start text-sm">
                            <div className="font-bold text-gray-800">{formatDateTime(seg.departure.at).time}</div>
                            <div className="flex items-center mt-1">
                                <MapPin size={14} className="mr-1 text-blue-500" />
                                <span className="font-medium">{seg.departure.iataCode}</span>
                            </div>
                        </div>

                        <div className="flex flex-col items-end text-sm">
                            <div className="font-bold text-gray-800">{formatDateTime(seg.arrival.at).time}</div>
                            <div className="flex items-center mt-1">
                                <MapPin size={14} className="mr-1 text-blue-500" />
                                <span className="font-medium">{seg.arrival.iataCode}</span>
                            </div>
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

    return (
        <>
            <div className="max-w-4xl mx-auto p-4 sm:p-6 bg-gray-50 rounded-xl sm:rounded-2xl shadow-sm">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6 sm:mb-8 flex items-center">
                    <Plane className="mr-2 sm:mr-3 text-blue-600" /> Flight Search Results
                </h2>

                {flights.map((flight) => {
                    const flightId = flight.id;
                    const isExpanded = expandedFlight === flightId;
                    const isHovered = hoveredFlight === flightId;
                    const airlineCode = flight.validatingAirlineCodes[0];
                    const airlineName = getAirlineName(airlineCode);
                    const roundTrip = isRoundTrip(flight);

                    // Calculate prices
                    const prices = calculatePriceWithMarkup(flight.price.grandTotal);

                    // Get outbound flight details (first itinerary)
                    const outboundSegs = flight.itineraries[0].segments;
                    const outboundDep = outboundSegs[0].departure;
                    const outboundArr = outboundSegs[outboundSegs.length - 1].arrival;

                    // Get return flight details if it's a round trip
                    const returnSegs = roundTrip ? flight.itineraries[1].segments : null;
                    const returnDep = returnSegs ? returnSegs[0].departure : null;
                    const returnArr = returnSegs ? returnSegs[returnSegs.length - 1].arrival : null;

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
                                {/* Top Section - Airline & Price (Mobile: stack, Desktop: side by side) */}
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6">
                                    <div className="flex items-center space-x-3 sm:space-x-4 mb-3 sm:mb-0">
                                        <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-blue-50 flex items-center justify-center shadow-sm">
                                            <Plane size={18} className="text-blue-600" />
                                        </div>
                                        <div>
                                            <div className="font-semibold text-lg">{airlineName}</div>
                                            <div className="text-sm text-gray-500">
                                                {airlineCode} #{outboundSegs[0].number}
                                                {roundTrip && ` + Return`}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="text-blue-700 font-bold text-xl sm:text-2xl flex items-center bg-blue-50 px-4 py-2 rounded-lg self-start sm:self-auto">
                                        <span className="mr-1 text-blue-600">{currencyIcons[flight.price.currency] || flight.price.currency}</span>
                                        {prices.markedUp}
                                    </div>
                                </div>

                                {/* Outbound Flight Timeline */}
                                {renderFlightTimeline(flight.itineraries[0], 0)}

                                {/* Return Flight Timeline (if round trip) */}
                                {roundTrip && renderFlightTimeline(flight.itineraries[1], 1)}

                                {/* Meta Info - Responsive Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 text-sm text-gray-600 border-t pt-4">
                                    <div className="flex items-center bg-gray-50 p-2 rounded-lg">
                                        <Calendar size={16} className="mr-2 text-blue-500 shrink-0" />
                                        <span className="truncate">
                                            {roundTrip ? 'Round Trip' : 'One Way'} • {formatDateTime(outboundDep.at).date}
                                            {roundTrip && ` to ${formatDateTime(returnArr.at).date}`}
                                        </span>
                                    </div>
                                    <div className="flex items-center bg-gray-50 p-2 rounded-lg">
                                        <Luggage size={16} className="mr-2 text-blue-500 shrink-0" />
                                        <span className="truncate">{flight.pricingOptions.includedCheckedBagsOnly ? "Checked bags included" : "No checked bags"}</span>
                                    </div>
                                    <div className="flex items-center bg-gray-50 p-2 rounded-lg">
                                        <Timer size={16} className="mr-2 text-blue-500 shrink-0" />
                                        <span className="truncate">Book by: {new Date(flight.lastTicketingDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                    </div>
                                </div>

                                {/* Expand Toggle and Select Button */}
                                <div className="flex flex-col sm:flex-row justify-between items-center mt-4 gap-3">
                                    <button
                                        onClick={() => handleClick(flight)}
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
                                        {renderDetailedSegments(flight.itineraries[0], 0)}
                                    </div>

                                    {/* Return Flight Details (if round trip) */}
                                    {roundTrip && (
                                        <div className="pt-4 border-t border-blue-100">
                                            <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                                                <Briefcase size={18} className="mr-2 text-blue-600" /> Return Flight Details
                                            </h3>
                                            {renderDetailedSegments(flight.itineraries[1], 1)}
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
            </div>

            {/* Modal rendered outside of the conditional logic but controlled by showModal state */}
            {showModal && <FlightCheckinModal checkinUrl={checkinUrl} onClose={() => setShowModal(false)} />}
        </>
    );
}