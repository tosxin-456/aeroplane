import React, { useState, useEffect, useRef } from 'react';
import { FaPlane, FaCalendarAlt, FaUser, FaSearch, FaDollarSign } from 'react-icons/fa';
import { MdFlightTakeoff, MdFlightLand, MdAirlineSeatReclineNormal } from 'react-icons/md';
import { API_BASE_URL } from '../../config/apiConfig';
import FlightSearchResults from '../../components/flightsComponent';
import FlightItinerary from '../../components/flightsComponent';
import FlightSearchUser from '../../components/flightSearchUser';
import { Minus, Plus } from 'lucide-react';

const currencies = [
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
    { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
    { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
    { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
    { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
    { code: 'RUB', name: 'Russian Ruble', symbol: '₽' },
    { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
    { code: 'KRW', name: 'South Korean Won', symbol: '₩' },
    { code: 'MXN', name: 'Mexican Peso', symbol: '$' },
    { code: 'SEK', name: 'Swedish Krona', symbol: 'kr' },
    { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr' },
    { code: 'DKK', name: 'Danish Krone', symbol: 'kr' },
    { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
    { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$' },
    { code: 'TRY', name: 'Turkish Lira', symbol: '₺' },
    { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ' },
    { code: 'SAR', name: 'Saudi Riyal', symbol: 'ر.س' },
    { code: 'NGN', name: 'Nigerian Naira', symbol: '₦' },
    { code: 'EGP', name: 'Egyptian Pound', symbol: '£' },
    { code: 'ARS', name: 'Argentine Peso', symbol: '$' },
    { code: 'PLN', name: 'Polish Złoty', symbol: 'zł' },
    { code: 'THB', name: 'Thai Baht', symbol: '฿' },
    { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp' },
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
        cabinClass: 'economy',
        currencyCode: 'USD',
        passengers: {
            adults: 1,
            children: 0,
            infantsOnLap: 0,
            infantsInSeat: 0,
        },
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
            passengers: formData.passengers,
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

    const [showPassengerPopup, setShowPassengerPopup] = useState(false);

    const passengerTypes = [
        {
            key: "adults",
            title: "Adults",
            description: "Ages 12 and above",
            minValue: 1,
        },
        {
            key: "children",
            title: "Children",
            description: "Ages 2–11",
            minValue: 0,
        },
        {
            key: "infantsOnLap",
            title: "Infants (on lap)",
            description: "Under 2, sitting on adult’s lap",
            minValue: 0,
        },
        {
            key: "infantsInSeat",
            title: "Infants (in seat)",
            description: "Under 2, with own seat",
            minValue: 0,
        },
    ];

    const updatePassenger = (key, increment) => {
        setFormData((prev) => {
            const currentCount = prev.passengers[key];
            const min = passengerTypes.find((t) => t.key === key)?.minValue || 0;
            const newCount = increment
                ? currentCount + 1
                : Math.max(min, currentCount - 1);

            return {
                ...prev,
                passengers: {
                    ...prev.passengers,
                    [key]: newCount,
                },
            };
        });
    };

    const getPassengerSummary = () => {
        const { adults, children, infantsOnLap, infantsInSeat } = formData.passengers;
        const parts = [];

        if (adults > 0) parts.push(`${adults} Adult${adults > 1 ? "s" : ""}`);
        if (children > 0) parts.push(`${children} Child${children > 1 ? "ren" : ""}`);
        if (infantsOnLap > 0)
            parts.push(`${infantsOnLap} Infant${infantsOnLap > 1 ? "s" : ""} on lap`);
        if (infantsInSeat > 0)
            parts.push(`${infantsInSeat} Infant${infantsInSeat > 1 ? "s" : ""} in seat`);

        return parts.join(", ") || "Select passengers";
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
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Currency Selection */}
                            <div>
                                <label className="block text-sm font-medium text-blue-700 mb-2">
                                    <FaDollarSign className="inline mr-1" /> Currency
                                </label>
                                <select
                                    name="currencyCode"
                                    value={formData.currencyCode}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                    <label className="block text-sm font-medium text-blue-700 mb-2">Origin Country</label>
                                    <input
                                        type="text"
                                        value={originCountrySearch}
                                        onChange={(e) => setOriginCountrySearch(e.target.value)}
                                        onFocus={() => setShowOriginCountryDropdown(true)}
                                        placeholder="Search for a country"
                                        className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        disabled={loadingCountries}
                                    />
                                    {loadingCountries && <p className="text-xs text-blue-500 mt-1">Loading...</p>}

                                    {showOriginCountryDropdown && filteredOriginCountries.length > 0 && (
                                        <div className="absolute z-20 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 overflow-y-auto border border-gray-200">
                                            {filteredOriginCountries.map((country, index) => (
                                                <div
                                                    key={`origin-${country}-${index}`}
                                                    onClick={() => selectCountry('origin', country)}
                                                    className="cursor-pointer px-3 py-2 hover:bg-blue-100 transition-colors"
                                                >
                                                    {country}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Destination Country */}
                                <div className="relative" ref={destCountryDropdownRef}>
                                    <label className="block text-sm font-medium text-blue-700 mb-2">Destination Country</label>
                                    <input
                                        type="text"
                                        value={destCountrySearch}
                                        onChange={(e) => setDestCountrySearch(e.target.value)}
                                        onFocus={() => setShowDestCountryDropdown(true)}
                                        placeholder="Search for a country"
                                        className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        disabled={loadingCountries}
                                    />
                                    {loadingCountries && <p className="text-xs text-blue-500 mt-1">Loading...</p>}

                                    {showDestCountryDropdown && filteredDestCountries.length > 0 && (
                                        <div className="absolute z-20 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 overflow-y-auto border border-gray-200">
                                            {filteredDestCountries.map((country, index) => (
                                                <div
                                                    key={`dest-${country}-${index}`}
                                                    onClick={() => selectCountry('destination', country)}
                                                    className="cursor-pointer px-3 py-2 hover:bg-blue-100 transition-colors"
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
                                    <label className="block text-sm font-medium text-blue-700 mb-2">Origin City</label>
                                    <input
                                        type="text"
                                        value={originCitySearch}
                                        onChange={(e) => setOriginCitySearch(e.target.value)}
                                        onFocus={() => setShowOriginCityDropdown(true)}
                                        placeholder="Select city"
                                        className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        disabled={!formData.originCountry || loadingOriginCities}
                                    />
                                    {loadingOriginCities && <p className="text-xs text-blue-500 mt-1">Loading...</p>}
                                    {!formData.originCountry && <p className="text-xs text-blue-500 mt-1">Select country first</p>}

                                    {showOriginCityDropdown && filteredOriginCities.length > 0 && (
                                        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 overflow-y-auto border border-gray-200">
                                            {filteredOriginCities.map((city, index) => (
                                                <div
                                                    key={`origin-city-${index}`}
                                                    onClick={() => selectCity('origin', city)}
                                                    className="cursor-pointer px-3 py-2 hover:bg-blue-100 transition-colors"
                                                >
                                                    {city}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Destination City */}
                                <div className="relative">
                                    <label className="block text-sm font-medium text-blue-700 mb-2">Destination City</label>
                                    <input
                                        type="text"
                                        value={destCitySearch}
                                        onChange={(e) => setDestCitySearch(e.target.value)}
                                        onFocus={() => setShowDestCityDropdown(true)}
                                        placeholder="Select city"
                                        className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        disabled={!formData.destinationCountry || loadingDestCities}
                                    />
                                    {loadingDestCities && <p className="text-xs text-blue-500 mt-1">Loading...</p>}
                                    {!formData.destinationCountry && <p className="text-xs text-blue-500 mt-1">Select country first</p>}

                                    {showDestCityDropdown && filteredDestCities.length > 0 && (
                                        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 overflow-y-auto border border-gray-200">
                                            {filteredDestCities.map((city, index) => (
                                                <div
                                                    key={`dest-city-${index}`}
                                                    onClick={() => selectCity('destination', city)}
                                                    className="cursor-pointer px-3 py-2 hover:bg-blue-100 transition-colors"
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
                                    <label className="block text-sm font-medium text-blue-700 mb-2">
                                        <MdFlightTakeoff className="inline mr-1" /> Origin Airport
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.originLocationName}
                                        onChange={handleInputChange}
                                        name="originLocationName"
                                        onFocus={() => formData.originCity && setShowOriginAirportDropdown(true)}
                                        placeholder="Select airport"
                                        className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                        readOnly
                                        disabled={!formData.originCity}
                                    />
                                    {!formData.originCity && formData.originCountry && <p className="text-xs text-blue-500 mt-1">Select city first</p>}

                                    {showOriginAirportDropdown && originAirports.length > 0 && (
                                        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 overflow-y-auto border border-gray-200">
                                            {originAirports.map((airport, index) => (
                                                <div
                                                    key={`origin-airport-${index}`}
                                                    onClick={() => selectAirport('origin', airport)}
                                                    className="cursor-pointer px-3 py-2 hover:bg-blue-100 transition-colors"
                                                >
                                                    {airport.name} ({airport.iata})
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Destination Airport */}
                                <div className="relative" ref={destAirportDropdownRef}>
                                    <label className="block text-sm font-medium text-blue-700 mb-2">
                                        <MdFlightLand className="inline mr-1" /> Destination Airport
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.destinationLocationName}
                                        onChange={handleInputChange}
                                        name="destinationLocationName"
                                        onFocus={() => formData.destinationCity && setShowDestAirportDropdown(true)}
                                        placeholder="Select airport"
                                        className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                        readOnly
                                        disabled={!formData.destinationCity}
                                    />
                                    {!formData.destinationCity && formData.destinationCountry && <p className="text-xs text-blue-500 mt-1">Select city first</p>}

                                    {showDestAirportDropdown && destinationAirports.length > 0 && (
                                        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 overflow-y-auto border border-gray-200">
                                            {destinationAirports.map((airport, index) => (
                                                <div
                                                    key={`dest-airport-${index}`}
                                                    onClick={() => selectAirport('destination', airport)}
                                                    className="cursor-pointer px-3 py-2 hover:bg-blue-100 transition-colors"
                                                >
                                                    {airport.name} ({airport.iata})
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Passenger Selector */}
                            <div>
                                <label className="block text-sm font-medium text-blue-700 mb-2">Passengers</label>
                                <button
                                    type="button"
                                    onClick={() => setShowPassengerPopup(true)}
                                    className="w-full text-left bg-white px-4 py-3 border border-blue-300 rounded-md shadow-sm hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                                >
                                    <div className="text-gray-900">{getPassengerSummary()}</div>
                                </button>
                            </div>

                            {/* Modal for Passenger Selection */}
                            {showPassengerPopup && (
                                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6 space-y-4">
                                        <h2 className="text-lg font-semibold text-gray-800">Select Passengers</h2>

                                        {passengerTypes.map((type) => (
                                            <div key={type.key} className="flex items-center justify-between">
                                                <div>
                                                    <div className="font-medium text-gray-800">{type.title}</div>
                                                    <div className="text-sm text-gray-500">{type.description}</div>
                                                </div>

                                                <div className="flex items-center space-x-3">
                                                    <button
                                                        type="button"
                                                        onClick={() => updatePassenger(type.key, false)}
                                                        disabled={formData.passengers[type.key] <= type.minValue}
                                                        className="w-8 h-8 border border-gray-300 rounded-full flex items-center justify-center disabled:opacity-50 hover:bg-gray-100 transition-colors"
                                                    >
                                                        <Minus size={14} />
                                                    </button>
                                                    <span className="w-6 text-center font-medium">{formData.passengers[type.key]}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => updatePassenger(type.key, true)}
                                                        className="w-8 h-8 border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
                                                    >
                                                        <Plus size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}

                                        <button
                                            type="button"
                                            onClick={() => setShowPassengerPopup(false)}
                                            className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                                        >
                                            Done
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Date and Time Section */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Departure Date */}
                                <div>
                                    <label className="block text-sm font-medium text-blue-700 mb-2">
                                        <FaCalendarAlt className="inline mr-1" /> Departure Date
                                    </label>
                                    <input
                                        type="date"
                                        name="departureDate"
                                        value={formData.departureDate}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                {/* Departure Time - Optional */}
                                <div>
                                    <label className="block text-sm font-medium text-blue-700 mb-2">
                                        Departure Time (Optional)
                                    </label>
                                    <input
                                        type="time"
                                        name="departureTime"
                                        value={formData.departureTime}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            {/* Trip Configuration */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Trip Type */}
                                <div>
                                    <label className="block text-sm font-medium text-blue-700 mb-2">
                                        Trip Type
                                    </label>
                                    <select
                                        value={formData.tripType || "oneway"}
                                        onChange={(e) => setFormData({ ...formData, tripType: e.target.value })}
                                        className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="oneway">One Way</option>
                                        <option value="roundtrip">Round Trip</option>
                                    </select>
                                </div>

                                {/* Travelers */}
                                <div>
                                    <label className="block text-sm font-medium text-blue-700 mb-2">
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
                            </div>

                            {/* Return Date - Conditionally show if roundtrip */}
                            {formData.tripType === "roundtrip" && (
                                <div>
                                    <label className="block text-sm font-medium text-blue-700 mb-2">
                                        <FaCalendarAlt className="inline mr-1" /> Return Date
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

                            {/* Cabin Class */}
                            <div>
                                <label className="block text-sm font-medium text-blue-700 mb-2">
                                    <MdAirlineSeatReclineNormal className="inline mr-1" /> Cabin Class
                                </label>
                                <select
                                    name="cabinClass"
                                    value={formData.cabinClass}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                >
                                    <option value="economy">Economy</option>
                                    <option value="premium_economy">Premium Economy</option>
                                    <option value="business">Business</option>
                                    <option value="first">First Class</option>
                                </select>
                            </div>

                            {/* Error Message */}
                            {searchError && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                                    <div className="text-red-700 text-sm">{searchError}</div>
                                </div>
                            )}

                            {/* Submit Button */}
                            <div className="flex justify-center pt-4">
                                <button
                                    type="submit"
                                    className="flex items-center justify-center px-8 py-3 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors font-medium"
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