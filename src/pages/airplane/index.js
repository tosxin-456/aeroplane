import React, { useState, useEffect, useRef } from 'react';
import { FaPlane, FaCalendarAlt, FaUser, FaSearch, FaDollarSign } from 'react-icons/fa';
import { MdFlightTakeoff, MdFlightLand, MdAirlineSeatReclineNormal } from 'react-icons/md';
import { API_BASE_URL } from '../../config/apiConfig';
import FlightSearchResults from '../../components/flightsComponent';
import FlightItinerary from '../../components/flightsComponent';
import FlightSearchUser from '../../components/flightSearchUser';

const currencies = [
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
];

const FlightSearchPage = () => {
    // Refs for dropdown containers
    const originCountryDropdownRef = useRef(null);
    const destCountryDropdownRef = useRef(null);
    const originAirportDropdownRef = useRef(null);
    const destAirportDropdownRef = useRef(null);

    const [formData, setFormData] = useState({
        originCountry: '',
        originCity: '',
        originLocationCode: '',
        originLocationName: '',
        destinationCountry: '',
        destinationCity: '',
        destinationLocationCode: '',
        destinationLocationName: '',
        departureDate: '',
        departureTime: '',
        travelers: 1,
        cabinClass: 'ECONOMY',
        currencyCode: 'USD'
    });

    const [countries, setCountries] = useState([]);
    const [originCities, setOriginCities] = useState({});
    const [destinationCities, setDestinationCities] = useState({});
    const [originAirports, setOriginAirports] = useState([]);
    const [destinationAirports, setDestinationAirports] = useState([]);

    const [isLoading, setIsLoading] = useState(false);
    const [searchError, setSearchError] = useState(null);
    const [loadingCountries, setLoadingCountries] = useState(false);
    const [loadingOriginCities, setLoadingOriginCities] = useState(false);
    const [loadingDestCities, setLoadingDestCities] = useState(false);

    // Dropdown visibility states
    const [showOriginCountryDropdown, setShowOriginCountryDropdown] = useState(false);
    const [showDestCountryDropdown, setShowDestCountryDropdown] = useState(false);
    const [showOriginCityDropdown, setShowOriginCityDropdown] = useState(false);
    const [showDestCityDropdown, setShowDestCityDropdown] = useState(false);
    const [showOriginAirportDropdown, setShowOriginAirportDropdown] = useState(false);
    const [showDestAirportDropdown, setShowDestAirportDropdown] = useState(false);

    // Search inputs
    const [originCountrySearch, setOriginCountrySearch] = useState('');
    const [destCountrySearch, setDestCountrySearch] = useState('');
    const [originCitySearch, setOriginCitySearch] = useState('');
    const [destCitySearch, setDestCitySearch] = useState('');

    const [avaliableFlights, setAvailableFlights] = useState([]);
    const [availableFlightsShow, setAvailableFlightsShow] = useState(false);



    // Fetch all countries that have airports
    useEffect(() => {
        const fetchAllCountries = async () => {
            setLoadingCountries(true);
            try {
                const response = await fetch(`${API_BASE_URL}/airports`);
                const data = await response.json();
                setCountries(Object.keys(data));
                setLoadingCountries(false);
            } catch (error) {
                console.error("Error fetching countries:", error);
                setLoadingCountries(false);
            }
        };

        fetchAllCountries();
    }, []);

    // Handle clicks outside dropdowns
    useEffect(() => {
        function handleClickOutside(event) {
            if (originCountryDropdownRef.current && !originCountryDropdownRef.current.contains(event.target)) {
                setShowOriginCountryDropdown(false);
            }
            if (destCountryDropdownRef.current && !destCountryDropdownRef.current.contains(event.target)) {
                setShowDestCountryDropdown(false);
            }
            if (originAirportDropdownRef.current && !originAirportDropdownRef.current.contains(event.target)) {
                setShowOriginAirportDropdown(false);
            }
            if (destAirportDropdownRef.current && !destAirportDropdownRef.current.contains(event.target)) {
                setShowDestAirportDropdown(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Fetch cities when origin country changes
    useEffect(() => {
        if (formData.originCountry) {
            setLoadingOriginCities(true);
            fetch(`${API_BASE_URL}/airports?country=${encodeURIComponent(formData.originCountry)}`)
                .then(response => response.json())
                .then(data => {
                    setOriginCities(data);
                    setLoadingOriginCities(false);
                })
                .catch(error => {
                    console.error("Error fetching origin cities:", error);
                    setLoadingOriginCities(false);
                });
        }
    }, [formData.originCountry]);

    // Fetch cities when destination country changes
    useEffect(() => {
        if (formData.destinationCountry) {
            setLoadingDestCities(true);
            fetch(`${API_BASE_URL}/airports?country=${encodeURIComponent(formData.destinationCountry)}`)
                .then(response => response.json())
                .then(data => {
                    setDestinationCities(data);
                    setLoadingDestCities(false);
                })
                .catch(error => {
                    console.error("Error fetching destination cities:", error);
                    setLoadingDestCities(false);
                });
        }
    }, [formData.destinationCountry]);

    // Fetch airports when origin city changes
    useEffect(() => {
        if (formData.originCountry && formData.originCity) {
            fetch(`${API_BASE_URL}/airports?country=${encodeURIComponent(formData.originCountry)}&city=${encodeURIComponent(formData.originCity)}`)
                .then(response => response.json())
                .then(data => {
                    setOriginAirports(data);
                })
                .catch(error => {
                    console.error("Error fetching origin airports:", error);
                });
        }
    }, [formData.originCountry, formData.originCity]);

    // Fetch airports when destination city changes
    useEffect(() => {
        if (formData.destinationCountry && formData.destinationCity) {
            fetch(`${API_BASE_URL}/airports?country=${encodeURIComponent(formData.destinationCountry)}&city=${encodeURIComponent(formData.destinationCity)}`)
                .then(response => response.json())
                .then(data => {
                    setDestinationAirports(data);
                })
                .catch(error => {
                    console.error("Error fetching destination airports:", error);
                });
        }
    }, [formData.destinationCountry, formData.destinationCity]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const selectCountry = (type, country) => {
        if (type === 'origin') {
            setFormData({
                ...formData,
                originCountry: country,
                originCity: '',
                originLocationCode: '',
                originLocationName: ''
            });
            setOriginCountrySearch(country);
            setShowOriginCountryDropdown(false);
        } else {
            setFormData({
                ...formData,
                destinationCountry: country,
                destinationCity: '',
                destinationLocationCode: '',
                destinationLocationName: ''
            });
            setDestCountrySearch(country);
            setShowDestCountryDropdown(false);
        }
    };

    const selectCity = (type, city) => {
        if (type === 'origin') {
            setFormData({
                ...formData,
                originCity: city,
                originLocationCode: '',
                originLocationName: ''
            });
            setOriginCitySearch(city);
            setShowOriginCityDropdown(false);
        } else {
            setFormData({
                ...formData,
                destinationCity: city,
                destinationLocationCode: '',
                destinationLocationName: ''
            });
            setDestCitySearch(city);
            setShowDestCityDropdown(false);
        }
    };

    const selectAirport = (type, airport) => {
        if (type === 'origin') {
            setFormData({
                ...formData,
                originLocationCode: airport.iata,
                originLocationName: airport.name
            });
            setShowOriginAirportDropdown(false);
        } else {
            setFormData({
                ...formData,
                destinationLocationCode: airport.iata,
                destinationLocationName: airport.name
            });
            setShowDestAirportDropdown(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setSearchError(null);
        setAvailableFlightsShow(false)

        const payload = {
            currencyCode: formData.currencyCode,
            originLocationCode: formData.originLocationCode,
            destinationLocationCode: formData.destinationLocationCode,
            departureDate: formData.departureDate,
            departureTime: formData.departureTime,
            travelers: formData.travelers,
            cabinClass: formData.cabinClass,
            tripType: formData.tripType, // 🔥 tripType added
            ...(formData.tripType === "roundtrip" && { returnDate: formData.returnDate })
        };

        // 🔥 Add returnDate if roundtrip
        if (formData.tripType === "roundtrip") {
            payload.returnDate = formData.returnDate;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/flights/search`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const result = await response.json();

            if (!response.ok) throw new Error(result.message || "Failed to fetch flights");

            console.log("Flight search result:", result);
            setAvailableFlights(result.data);
            setAvailableFlightsShow(true);
            setIsLoading(false);
        } catch (error) {
            console.error("Error searching flights:", error);
            setSearchError("Failed to search flights. Please try again.");
            setIsLoading(false);
        }
    };


    // Filter countries based on search
    const filteredOriginCountries = countries.filter(country =>
        country.toLowerCase().includes(originCountrySearch.toLowerCase())
    ).slice(0, 8);

    const filteredDestCountries = countries.filter(country =>
        country.toLowerCase().includes(destCountrySearch.toLowerCase())
    ).slice(0, 8);

    // Get cities from the cities object based on search
    const filteredOriginCities = originCities ?
        Object.keys(originCities).filter(city =>
            city.toLowerCase().includes(originCitySearch.toLowerCase())
        ).slice(0, 8) : [];

    const filteredDestCities = destinationCities ?
        Object.keys(destinationCities).filter(city =>
            city.toLowerCase().includes(destCitySearch.toLowerCase())
        ).slice(0, 8) : [];

    return (
        <div className=" min-h-screen bg-gradient-to-br mt-50 from-blue-50 via-indigo-50 to-purple-50 py-8 px-4">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4 shadow-lg">
                        <FaPlane className="text-2xl text-white" />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">
                        Flight Search
                    </h1>
                    <p className="text-xl text-gray-600 font-medium">Find the best flights for your journey</p>
                    <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mt-4 rounded-full"></div>
                </div>

                <div className="bg-white rounded-lg shadow-lg p-6">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Currency Selection */}
                            <div>
                                <label className="block text-sm font-medium text-blue-700 mb-1">
                                    <FaDollarSign className="inline mr-1" /> Currency
                                </label>
                                <select
                                    name="currencyCode"
                                    value={formData.currencyCode}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-blue-300 rounded-md"
                                >
                                    {currencies.map(currency => (
                                        <option key={currency.code} value={currency.code}>
                                            {currency.name} ({currency.symbol})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Countries */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Origin Country */}
                                <div className="relative" ref={originCountryDropdownRef}>
                                    <label className="block text-sm font-medium text-blue-700 mb-1">Origin Country</label>
                                    <input
                                        type="text"
                                        value={originCountrySearch}
                                        onChange={(e) => setOriginCountrySearch(e.target.value)}
                                        onFocus={() => setShowOriginCountryDropdown(true)}
                                        placeholder="Search for a country"
                                        className="w-full px-3 py-2 border border-blue-300 rounded-md"
                                        disabled={loadingCountries}
                                    />
                                    {loadingCountries && <p className="text-xs text-blue-500 mt-1">Loading...</p>}

                                    {showOriginCountryDropdown && filteredOriginCountries.length > 0 && (
                                        <div className="absolute z-20 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 overflow-y-auto">
                                            {filteredOriginCountries.map((country, index) => (
                                                <div
                                                    key={`origin-${country}-${index}`}
                                                    onClick={() => selectCountry('origin', country)}
                                                    className="cursor-pointer px-3 py-2 hover:bg-blue-100"
                                                >
                                                    {country}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Destination Country */}
                                <div className="relative" ref={destCountryDropdownRef}>
                                    <label className="block text-sm font-medium text-blue-700 mb-1">Destination Country</label>
                                    <input
                                        type="text"
                                        value={destCountrySearch}
                                        onChange={(e) => setDestCountrySearch(e.target.value)}
                                        onFocus={() => setShowDestCountryDropdown(true)}
                                        placeholder="Search for a country"
                                        className="w-full px-3 py-2 border border-blue-300 rounded-md"
                                        disabled={loadingCountries}
                                    />
                                    {loadingCountries && <p className="text-xs text-blue-500 mt-1">Loading...</p>}

                                    {showDestCountryDropdown && filteredDestCountries.length > 0 && (
                                        <div className="absolute z-20 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 overflow-y-auto">
                                            {filteredDestCountries.map((country, index) => (
                                                <div
                                                    key={`dest-${country}-${index}`}
                                                    onClick={() => selectCountry('destination', country)}
                                                    className="cursor-pointer px-3 py-2 hover:bg-blue-100"
                                                >
                                                    {country}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Cities */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Origin City */}
                                <div className="relative">
                                    <label className="block text-sm font-medium text-blue-700 mb-1">Origin City</label>
                                    <input
                                        type="text"
                                        value={originCitySearch}
                                        onChange={(e) => setOriginCitySearch(e.target.value)}
                                        onFocus={() => setShowOriginCityDropdown(true)}
                                        placeholder="Select city"
                                        className="w-full px-3 py-2 border border-blue-300 rounded-md"
                                        disabled={!formData.originCountry || loadingOriginCities}
                                    />
                                    {loadingOriginCities && <p className="text-xs text-blue-500 mt-1">Loading...</p>}
                                    {!formData.originCountry && <p className="text-xs text-blue-500 mt-1">Select country first</p>}

                                    {showOriginCityDropdown && filteredOriginCities.length > 0 && (
                                        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 overflow-y-auto">
                                            {filteredOriginCities.map((city, index) => (
                                                <div
                                                    key={`origin-city-${index}`}
                                                    onClick={() => selectCity('origin', city)}
                                                    className="cursor-pointer px-3 py-2 hover:bg-blue-100"
                                                >
                                                    {city}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Destination City */}
                                <div className="relative">
                                    <label className="block text-sm font-medium text-blue-700 mb-1">Destination City</label>
                                    <input
                                        type="text"
                                        value={destCitySearch}
                                        onChange={(e) => setDestCitySearch(e.target.value)}
                                        onFocus={() => setShowDestCityDropdown(true)}
                                        placeholder="Select city"
                                        className="w-full px-3 py-2 border border-blue-300 rounded-md"
                                        disabled={!formData.destinationCountry || loadingDestCities}
                                    />
                                    {loadingDestCities && <p className="text-xs text-blue-500 mt-1">Loading...</p>}
                                    {!formData.destinationCountry && <p className="text-xs text-blue-500 mt-1">Select country first</p>}

                                    {showDestCityDropdown && filteredDestCities.length > 0 && (
                                        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 overflow-y-auto">
                                            {filteredDestCities.map((city, index) => (
                                                <div
                                                    key={`dest-city-${index}`}
                                                    onClick={() => selectCity('destination', city)}
                                                    className="cursor-pointer px-3 py-2 hover:bg-blue-100"
                                                >
                                                    {city}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Airports */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Origin Airport */}
                                <div className="relative" ref={originAirportDropdownRef}>
                                    <label className="text-sm font-medium text-blue-700 mb-1">
                                        <MdFlightTakeoff className="inline mr-1" /> Origin Airport
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.originLocationName}
                                        onChange={handleInputChange}
                                        name="originLocationName"
                                        onFocus={() => formData.originCity && setShowOriginAirportDropdown(true)}
                                        placeholder="Select airport"
                                        className="w-full px-3 py-2 border border-blue-300 rounded-md"
                                        required
                                        readOnly
                                        disabled={!formData.originCity}
                                    />
                                    {!formData.originCity && formData.originCountry && <p className="text-xs text-blue-500 mt-1">Select city first</p>}

                                    {showOriginAirportDropdown && originAirports.length > 0 && (
                                        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 overflow-y-auto">
                                            {originAirports.map((airport, index) => (
                                                <div
                                                    key={`origin-airport-${index}`}
                                                    onClick={() => selectAirport('origin', airport)}
                                                    className="cursor-pointer px-3 py-2 hover:bg-blue-100"
                                                >
                                                    {airport.name} ({airport.iata})
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Destination Airport */}
                                <div className="relative" ref={destAirportDropdownRef}>
                                    <label className="text-sm font-medium text-blue-700 mb-1">
                                        <MdFlightLand className="inline mr-1" /> Destination Airport
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.destinationLocationName}
                                        onChange={handleInputChange}
                                        name="destinationLocationName"
                                        onFocus={() => formData.destinationCity && setShowDestAirportDropdown(true)}
                                        placeholder="Select airport"
                                        className="w-full px-3 py-2 border border-blue-300 rounded-md"
                                        required
                                        readOnly
                                        disabled={!formData.destinationCity}
                                    />
                                    {!formData.destinationCity && formData.destinationCountry && <p className="text-xs text-blue-500 mt-1">Select city first</p>}

                                    {showDestAirportDropdown && destinationAirports.length > 0 && (
                                        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 overflow-y-auto">
                                            {destinationAirports.map((airport, index) => (
                                                <div
                                                    key={`dest-airport-${index}`}
                                                    onClick={() => selectAirport('destination', airport)}
                                                    className="cursor-pointer px-3 py-2 hover:bg-blue-100"
                                                >
                                                    {airport.name} ({airport.iata})
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Date, Time, and Travelers */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Departure Date */}
                                <div>
                                    <label className="text-sm font-medium text-blue-700 mb-1">
                                        <FaCalendarAlt className="inline mr-1" /> Departure Date
                                    </label>
                                    <input
                                        type="date"
                                        name="departureDate"
                                        value={formData.departureDate}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-blue-300 rounded-md"
                                        required
                                    />
                                </div>

                                {/* Departure Time - Optional */}
                                <div>
                                    <label className="text-sm font-medium text-blue-700 mb-1">
                                        Departure Time (Optional)
                                    </label>
                                    <input
                                        type="time"
                                        name="departureTime"
                                        value={formData.departureTime}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-blue-300 rounded-md"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    {/* Travelers */}
                                    <div>
                                        <label className="text-sm font-medium text-blue-700 mb-1 block">
                                            <FaUser className="inline mr-1" /> Travelers
                                        </label>
                                        <input
                                            type="number"
                                            name="travelers"
                                            value={formData.travelers}
                                            onChange={handleInputChange}
                                            min="1"
                                            max="9"
                                            className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        />
                                    </div>

                                    {/* Trip Type */}
                                    <div>
                                        <label className="text-sm font-medium text-blue-700 mb-1 block">
                                            Trip Type
                                        </label>
                                        <select
                                            value={formData.tripType || "oneway"}
                                            onChange={(e) => setFormData({ ...formData, tripType: e.target.value })}
                                            className="w-full p-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="oneway">One Way</option>
                                            <option value="roundtrip">Round Trip</option>
                                        </select>
                                    </div>

                                    {/* 🔥 Conditionally show Return Date if tripType is roundtrip */}
                                    {formData.tripType === "roundtrip" && (
                                        <div className="md:col-span-2">
                                            <label className="text-sm font-medium text-blue-700 mb-1 block">
                                                Return Date
                                            </label>
                                            <input
                                                type="date"
                                                name="returnDate"
                                                value={formData.returnDate || ""}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                required
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Cabin Class */}
                            <div>
                                <label className="text-sm font-medium text-blue-700 mb-1">
                                    <MdAirlineSeatReclineNormal className="inline mr-1" /> Cabin Class
                                </label>
                                <select
                                    name="cabinClass"
                                    value={formData.cabinClass}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-blue-300 rounded-md"
                                    required
                                >
                                    <option value="ECONOMY">Economy</option>
                                    <option value="PREMIUM_ECONOMY">Premium Economy</option>
                                    <option value="BUSINESS">Business</option>
                                    <option value="FIRST">First Class</option>
                                </select>
                            </div>

                            {searchError && (
                                <div className="text-red-500 text-sm">{searchError}</div>
                            )}

                            <div className="flex justify-center">
                                <button
                                    type="submit"
                                    className="flex items-center justify-center px-5 py-2 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                                >
                                    <FaSearch className="mr-2" />
                                    Search Flights
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
            <div className='mt-7' >
                {availableFlightsShow && <FlightSearchUser flights={avaliableFlights} />}
            </div>

        </div>
    );
};

export default FlightSearchPage;