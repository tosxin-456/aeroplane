import { useState } from 'react';
import { FaSubway, FaTrain, FaGlobe, FaTicketAlt, FaMapMarkerAlt, FaCalendarAlt } from 'react-icons/fa';

const renderTrainOperatorCards = () => {
    const [tripParams, setTripParams] = useState({
        departureLocation: '',
        destination: '',
        departureDate: new Date().toISOString().split('T')[0] // Today's date as default
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setTripParams(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Function to build the ticket URL with parameters
    const buildTicketUrl = (baseUrl) => {
        // Skip if the base URL is missing
        if (!baseUrl) return null;

        try {
            const url = new URL(baseUrl);

            // Add parameters if they exist
            if (tripParams.departureLocation) {
                url.searchParams.append('from', tripParams.departureLocation);
            }
            if (tripParams.destination) {
                url.searchParams.append('to', tripParams.destination);
            }
            if (tripParams.departureDate) {
                url.searchParams.append('date', tripParams.departureDate);
            }

            return url.toString();
        } catch (error) {
            // If URL parsing fails, return the original URL
            return baseUrl;
        }
    };

    if (!trainOperators.data || !Array.isArray(trainOperators.data)) return null;

    if (trainOperators.data.length === 0) {
        return (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-700">
                No train operators found in this area. Try expanding the search radius or checking a nearby city.
            </div>
        );
    }

    return (
        <>
            {/* Trip parameters form */}
            <div className="bg-white p-4 rounded-md shadow border border-gray-200 mb-4">
                <h3 className="font-bold text-lg text-gray-800 mb-3">Plan Your Trip</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            <FaMapMarkerAlt className="inline mr-1 text-green-600" /> From
                        </label>
                        <input
                            type="text"
                            name="departureLocation"
                            value={tripParams.departureLocation}
                            onChange={handleInputChange}
                            placeholder="Departure station"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            <FaMapMarkerAlt className="inline mr-1 text-green-600" /> To
                        </label>
                        <input
                            type="text"
                            name="destination"
                            value={tripParams.destination}
                            onChange={handleInputChange}
                            placeholder="Destination station"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            <FaCalendarAlt className="inline mr-1 text-green-600" /> Date
                        </label>
                        <input
                            type="date"
                            name="departureDate"
                            value={tripParams.departureDate}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                        />
                    </div>
                </div>
            </div>

            {/* Train operator cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {trainOperators.data.map((operator, index) => (
                    <div key={operator.id || index} className="bg-white p-4 rounded-md shadow border border-gray-200 hover:shadow-lg transition-shadow duration-200">
                        <div className="flex items-start">
                            <div className="bg-green-100 rounded-full p-3 text-green-700 mr-3">
                                {operator.type === 'highspeed' ?
                                    <FaSubway className="text-xl" /> :
                                    <FaTrain className="text-xl" />
                                }
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-lg text-gray-800">{operator.name}</h3>
                                {operator.short_name && <p className="text-sm text-gray-600">Short name: {operator.short_name}</p>}

                                {/* Service type tag */}
                                <div className="mt-2 flex flex-wrap gap-2">
                                    <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                        {operator.type === 'highspeed' ? 'High-Speed Rail' : 'Regional Train'}
                                    </span>

                                    {operator.international && (
                                        <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                            International
                                        </span>
                                    )}
                                </div>

                                {/* Links section */}
                                <div className="mt-3 flex items-center gap-3">
                                    {operator.website && (
                                        <a
                                            href={operator.website}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                                        >
                                            <FaGlobe className="mr-1" /> Website
                                        </a>
                                    )}

                                    {operator.ticketing_url && (
                                        <a
                                            href={buildTicketUrl(operator.ticketing_url)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-green-600 hover:text-green-800 text-sm flex items-center"
                                        >
                                            <FaTicketAlt className="mr-1" /> Buy Tickets
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
};

export default renderTrainOperatorCards;