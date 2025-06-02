import React, { useState, useEffect } from 'react';
import { FaTrain, FaMapMarkerAlt, FaCity, FaGlobe, FaSearch, FaSubway, FaTicketAlt } from 'react-icons/fa';
import { API_BASE_URL } from '../../config/apiConfig';

const TrainSearchForm = () => {
    const [searchParams, setSearchParams] = useState({
        fromCountry: '',
        fromState: '',
        fromCity: '',
        fromGeocode: { lat: null, lng: null }
    });

    const [europeanCountries, setEuropeanCountries] = useState([]);
    const [fromCountrySuggestions, setFromCountrySuggestions] = useState([]);
    const [fromStates, setFromStates] = useState([]);
    const [fromCities, setFromCities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stateLoading, setStateLoading] = useState(false);
    const [cityLoading, setCityLoading] = useState(false);
    const [destinationCity, setDestinationCity] = useState('');
    const [departureDate, setDepartureDate] = useState('');
    const [departureTime, setDepartureTime] = useState('');

    // Function to generate booking URL with parameters
    const generateBookingUrl = (baseUrl, fromCity, toCity, date, time) => {
        if (!baseUrl || !fromCity || !toCity) return baseUrl;

        try {
            const url = new URL(baseUrl);

            // Format the date and time (if both are provided)
            let formattedDateTime = '';
            if (date) {
                formattedDateTime = date;
                if (time) {
                    // Combine date and time for datetime parameters
                    formattedDateTime = `${date}T${time}`;
                }
            }

            // Different operators use different parameter names, this is a simplified approach
            // In a real application, you might need operator-specific parameter mapping
            const commonParams = {
                'from': fromCity,
                'to': toCity,
                'fromCity': fromCity,
                'toCity': toCity,
                'departure': formattedDateTime,
                'date': date,
                'time': time,
                'departureDate': date,
                'departureTime': time
            };

            // Add all common parameters - operators will ignore ones they don't use
            Object.entries(commonParams).forEach(([key, value]) => {
                if (value) url.searchParams.append(key, value);
            });

            return url.toString();
        } catch (e) {
            console.error("Invalid URL:", e);
            return baseUrl;
        }
    };

    // Train operators state
    const [trainOperators, setTrainOperators] = useState({
        loading: false,
        data: null,
        error: null
    });

    // Fetch European countries on component mount
    useEffect(() => {
        const fetchEuropeanCountries = async () => {
            try {
                setLoading(true);
                const response = await fetch('https://restcountries.com/v3.1/region/europe');
                if (!response.ok) {
                    throw new Error('Failed to fetch countries');
                }
                const data = await response.json();

                // Sort countries alphabetically by name
                const sortedCountries = data
                    .map(country => ({
                        name: country.name.common,
                        code: country.cca2,
                        flag: country.flags?.svg || ''
                    }))
                    .sort((a, b) => a.name.localeCompare(b.name));

                setEuropeanCountries(sortedCountries);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchEuropeanCountries();
    }, []);

    // Fetch states for selected country
    const fetchStates = async (country) => {
        if (!country) return;

        try {
            setStateLoading(true);
            const response = await fetch('https://countriesnow.space/api/v0.1/countries/states', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ country }),
            });

            if (!response.ok) {
                throw new Error('Failed to fetch states');
            }

            const data = await response.json();

            if (data.error) {
                console.warn(`No states found for ${country}: ${data.msg}`);
                setFromStates([]);
                return;
            }

            const states = data.data.states.map(state => ({
                name: state.name,
                code: state.state_code
            })).sort((a, b) => a.name.localeCompare(b.name));

            setFromStates(states);
            setSearchParams(prev => ({ ...prev, fromState: '', fromCity: '', fromGeocode: { lat: null, lng: null } }));
            // Reset train operators when country changes
            setTrainOperators({ loading: false, data: null, error: null });
        } catch (err) {
            console.error("Error fetching states:", err);
            setFromStates([]);
        } finally {
            setStateLoading(false);
        }
    };

    // Fetch cities for selected state
    const fetchCities = async (country, state) => {
        if (!country || !state) return;

        try {
            setCityLoading(true);
            const response = await fetch('https://countriesnow.space/api/v0.1/countries/state/cities', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ country, state }),
            });

            if (!response.ok) {
                throw new Error('Failed to fetch cities');
            }

            const data = await response.json();

            if (data.error) {
                console.warn(`No cities found for ${state}, ${country}: ${data.msg}`);
                setFromCities([]);
                return;
            }

            const cities = data.data.sort((a, b) => a.localeCompare(b));
            setFromCities(cities);
            setSearchParams(prev => ({ ...prev, fromCity: '', fromGeocode: { lat: null, lng: null } }));
            // Reset train operators when state changes
            setTrainOperators({ loading: false, data: null, error: null });
        } catch (err) {
            console.error("Error fetching cities:", err);
            setFromCities([]);
        } finally {
            setCityLoading(false);
        }
    };

    // Fetch geocode for selected city
    const fetchGeocode = async (city, country) => {
        if (!city || !country) return;

        try {
            // Using nominatim (OpenStreetMap)
            const encodedCity = encodeURIComponent(city);
            const encodedCountry = encodeURIComponent(country);
            const response = await fetch(`https://nominatim.openstreetmap.org/search?city=${encodedCity}&country=${encodedCountry}&format=json`, {
                headers: {
                    'Accept-Language': 'en',
                    'User-Agent': 'TrainSearch/1.0'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch geocode');
            }

            const data = await response.json();

            if (data.length === 0) {
                console.warn(`No geocode found for ${city}, ${country}`);
                return;
            }

            const geocode = {
                lat: parseFloat(data[0].lat),
                lng: parseFloat(data[0].lon)
            };

            setSearchParams(prev => ({ ...prev, fromGeocode: geocode }));
            console.log(`Geocode for ${city}, ${country}:`, geocode);

            // Automatically fetch train operators when geocode is available
            fetchTrainOperators(geocode.lat, geocode.lng);
        } catch (err) {
            console.error("Error fetching geocode:", err);
        }
    };

    // Function to fetch train operators
    const fetchTrainOperators = async (lat, lng) => {
        if (!lat || !lng) return;

        try {
            setTrainOperators(prev => ({ ...prev, loading: true, error: null }));

            // Use relative URL that will be resolved against the base URL
            const response = await fetch(`${API_BASE_URL}/train-routes/operators?lat=${lat}&lon=${lng}&radius=1500`);

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || 'Failed to fetch train operators');
            }

            setTrainOperators({
                loading: false,
                data: data.trainOperators || [],
                error: null
            });

        } catch (err) {
            console.error("Error fetching train operators:", err);
            setTrainOperators({
                loading: false,
                data: null,
                error: err.message
            });
        }
    };

    // Effect for fetching states when country changes
    useEffect(() => {
        if (searchParams.fromCountry) {
            fetchStates(searchParams.fromCountry);
        }
    }, [searchParams.fromCountry]);

    // Effect for fetching cities when state changes
    useEffect(() => {
        if (searchParams.fromCountry && searchParams.fromState) {
            fetchCities(searchParams.fromCountry, searchParams.fromState);
        }
    }, [searchParams.fromState, searchParams.fromCountry]);

    // Effect for fetching geocode when city changes
    useEffect(() => {
        if (searchParams.fromCity && searchParams.fromCountry) {
            fetchGeocode(searchParams.fromCity, searchParams.fromCountry);
        }
    }, [searchParams.fromCity, searchParams.fromCountry]);

    // Filter country suggestions based on user input
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSearchParams(prev => ({ ...prev, [name]: value }));

        if (name === 'fromCountry') {
            const filteredCountries = europeanCountries
                .filter(country => country.name.toLowerCase().includes(value.toLowerCase()))
                .slice(0, 5);

            setFromCountrySuggestions(value.length > 0 ? filteredCountries : []);
        }
    };

    const selectCountry = (country) => {
        setSearchParams(prev => ({ ...prev, fromCountry: country.name }));
        setFromCountrySuggestions([]);
    };

    // Manually trigger train operator search
    const handleSearchTrainOperators = () => {
        if (searchParams.fromGeocode.lat && searchParams.fromGeocode.lng) {
            fetchTrainOperators(searchParams.fromGeocode.lat, searchParams.fromGeocode.lng);
        }
    };

    // Render train operator cards
    const renderTrainOperatorCards = () => {
        if (!trainOperators.data || !Array.isArray(trainOperators.data)) return null;

        if (trainOperators.data.length === 0) {
            return (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-700">
                    No train operators found in this area. Try expanding the search radius or checking a nearby city.
                </div>
            );
        }

        return (
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
                                            href={operator.ticketing_url}
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
        );
    };

    // Generate train operator metrics
    const getOperatorMetrics = () => {
        if (!trainOperators.data || !Array.isArray(trainOperators.data)) return null;

        const totalOperators = trainOperators.data.length;
        const highSpeedOperators = trainOperators.data.filter(op => op.type === 'highspeed').length;
        const regionalOperators = trainOperators.data.filter(op => op.type !== 'highspeed').length;
        const internationalOperators = trainOperators.data.filter(op => op.international).length;

        return { totalOperators, highSpeedOperators, regionalOperators, internationalOperators };
    };

    return (
        <div className="max-w-4xl mx-auto p-4">
            <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-green-600">
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                    <FaTrain className="mr-2 text-green-600" /> European Train Operator Finder
                </h2>

                {loading && <div className="text-center py-4">Loading countries...</div>}
                {error && <div className="text-red-500 text-center py-4">Error: {error}</div>}

                {!loading && !error && (
                    <div className="space-y-4">
                        <div className="space-y-2 relative">
                            <label className="text-gray-700 font-medium flex items-center">
                                <FaGlobe className="mr-2 text-green-600" /> Country
                            </label>
                            <input
                                type="text"
                                name="fromCountry"
                                value={searchParams.fromCountry}
                                onChange={(e) => handleInputChange(e)}
                                placeholder="Select a European country"
                                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
                            />
                            {fromCountrySuggestions.length > 0 && (
                                <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 shadow-lg max-h-60 overflow-auto">
                                    {fromCountrySuggestions.map((country) => (
                                        <li
                                            key={country.code}
                                            className="p-2 hover:bg-green-50 cursor-pointer flex items-center"
                                            onClick={() => selectCountry(country)}
                                        >
                                            <img src={country.flag} alt={`${country.name} flag`} className="w-6 h-4 mr-2" />
                                            {country.name}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="text-gray-700 font-medium flex items-center">
                                <FaMapMarkerAlt className="mr-2 text-green-600" /> State/Region
                            </label>
                            <select
                                name="fromState"
                                value={searchParams.fromState}
                                onChange={(e) => handleInputChange(e)}
                                disabled={!searchParams.fromCountry || stateLoading || fromStates.length === 0}
                                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400 disabled:bg-gray-100"
                            >
                                <option value="">Select state/region</option>
                                {fromStates.map(state => (
                                    <option key={state.code} value={state.name}>
                                        {state.name}
                                    </option>
                                ))}
                            </select>
                            {stateLoading && searchParams.fromCountry && (
                                <div className="text-sm text-gray-500">Loading states...</div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="text-gray-700 font-medium flex items-center">
                                <FaCity className="mr-2 text-green-600" /> City
                            </label>
                            <select
                                name="fromCity"
                                value={searchParams.fromCity}
                                onChange={(e) => handleInputChange(e)}
                                disabled={!searchParams.fromState || cityLoading || fromCities.length === 0}
                                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400 disabled:bg-gray-100"
                            >
                                <option value="">Select city</option>
                                {fromCities.map(city => (
                                    <option key={city} value={city}>
                                        {city}
                                    </option>
                                ))}
                            </select>
                            {cityLoading && searchParams.fromState && (
                                <div className="text-sm text-gray-500">Loading cities...</div>
                            )}
                        </div>

                        {searchParams.fromGeocode.lat && (
                            <div className="p-3 bg-green-50 rounded-md text-sm text-gray-700 flex items-center justify-between">
                                <div>
                                    <span className="font-semibold">Coordinates:</span> {searchParams.fromGeocode.lat.toFixed(4)}, {searchParams.fromGeocode.lng.toFixed(4)}
                                </div>

                                <button
                                    onClick={handleSearchTrainOperators}
                                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm flex items-center transition-colors duration-200"
                                >
                                    <FaSearch className="mr-2" /> Find Train Operators
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Display train operators section */}
            {searchParams.fromGeocode.lat && (
                <div className="mt-6 bg-white rounded-lg shadow-md p-6 border-l-4 border-green-600">
                    <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                        <FaTrain className="mr-2 text-green-600" /> Train Operators
                        {searchParams.fromCity && (
                            <span className="ml-2 text-base font-normal text-gray-600">
                                in {searchParams.fromCity}, {searchParams.fromCountry}
                            </span>
                        )}
                    </h2>

                    {trainOperators.loading && (
                        <div className="text-center py-6">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-green-500 border-t-transparent"></div>
                            <p className="mt-2 text-gray-600">Loading train operators...</p>
                        </div>
                    )}

                    {trainOperators.error && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
                            Error: {trainOperators.error}
                        </div>
                    )}

                    {trainOperators.data && (
                        <div>
                            {/* Metrics display */}
                            {getOperatorMetrics() && (
                                <div className="mb-4 p-4 bg-green-50 rounded-md grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="flex flex-col items-center p-2 bg-white rounded-lg shadow-sm">
                                        <span className="text-2xl font-bold text-green-700">{getOperatorMetrics().totalOperators}</span>
                                        <span className="text-sm text-gray-600">Total Operators</span>
                                    </div>
                                    <div className="flex flex-col items-center p-2 bg-white rounded-lg shadow-sm">
                                        <span className="text-2xl font-bold text-green-700">{getOperatorMetrics().highSpeedOperators}</span>
                                        <span className="text-sm text-gray-600">High-Speed</span>
                                    </div>
                                    <div className="flex flex-col items-center p-2 bg-white rounded-lg shadow-sm">
                                        <span className="text-2xl font-bold text-green-700">{getOperatorMetrics().regionalOperators}</span>
                                        <span className="text-sm text-gray-600">Regional</span>
                                    </div>
                                    <div className="flex flex-col items-center p-2 bg-white rounded-lg shadow-sm">
                                        <span className="text-2xl font-bold text-green-700">{getOperatorMetrics().internationalOperators}</span>
                                        <span className="text-sm text-gray-600">International</span>
                                    </div>
                                </div>
                            )}

                            {renderTrainOperatorCards()}
                        </div>
                    )}

                    {!trainOperators.loading && !trainOperators.data && !trainOperators.error && (
                        <div className="text-center py-6 border-2 border-dashed border-gray-300 rounded-lg">
                            <FaTrain className="mx-auto text-gray-400 text-4xl mb-3" />
                            <p className="text-gray-500">Click "Find Train Operators" to search for rail services in this area.</p>
                        </div>
                    )}
                </div>
            )}

            {!loading && europeanCountries.length > 0 && (
                <div className="mt-4 p-4 bg-gray-50 rounded-md border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Popular Train Countries</h3>
                    <div className="flex flex-wrap gap-2">
                        {['France', 'Germany', 'Italy', 'Spain', 'Switzerland', 'Netherlands', 'Belgium', 'Austria']
                            .map(countryName => {
                                const country = europeanCountries.find(c => c.name === countryName);
                                return country ? (
                                    <button
                                        key={country.code}
                                        onClick={() => selectCountry(country)}
                                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white border border-gray-300 hover:bg-green-50 transition-colors duration-200"
                                    >
                                        <img src={country.flag} alt={`${country.name} flag`} className="w-4 h-3 mr-1" />
                                        {country.name}
                                    </button>
                                ) : null;
                            })
                            .filter(Boolean)
                        }
                    </div>
                </div>
            )}
        </div>
    );
};

export default TrainSearchForm;