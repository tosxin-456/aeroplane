import { useState, useEffect, useRef } from 'react';
import { FaHotel, FaSearch, FaCalendarAlt, FaUser, FaMapMarkerAlt, FaGlobeAmericas, FaDollarSign, FaStar, FaSwimmingPool, FaCreditCard } from 'react-icons/fa';
import { IoIosArrowDown } from 'react-icons/io';
import { MdRestaurant, MdMeetingRoom } from 'react-icons/md';
import { API_BASE_URL } from '../../config/apiConfig';
import HotelCard from '../../components/hotelsComponent';

const HotelSearch = () => {
    const [formData, setFormData] = useState({
        country: '',
        cityCode: '',
        cityName: '',
        checkInDate: '',
        checkOutDate: '',
        adults: 2,
        roomQuantity: 1,
        priceRange: '',
        ratings: '',
        amenities: [],
        boardType: '',
        paymentPolicy: '',
        currency: 'USD',
        bestRateOnly: false,
        hotelSource: 'ALL'
    });

    const [countries, setCountries] = useState([]);
    const [filteredCountries, setFilteredCountries] = useState([]);
    const [countrySearch, setCountrySearch] = useState('');
    const [showCountryDropdown, setShowCountryDropdown] = useState(false);

    const [cities, setCities] = useState({});
    const [filteredCities, setFilteredCities] = useState([]);
    const [citySearch, setCitySearch] = useState('');
    const [showCityDropdown, setShowCityDropdown] = useState(false);

    const [isLoading, setIsLoading] = useState(false);
    const [loadingCountries, setLoadingCountries] = useState(false);
    const [loadingCities, setLoadingCities] = useState(false);
    const [searchError, setSearchError] = useState(null);
    const [availableHotels, setAvailableHotels] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const [availableHotelsShow, setAvailableHotelsShow] = useState(false);

    const cityDropdownRef = useRef(null);
    const countryDropdownRef = useRef(null);

    // Available amenities
    const availableAmenities = [
        { id: 'pool', label: 'Swimming Pool', icon: <FaSwimmingPool /> },
        { id: 'gym', label: 'Fitness Center', icon: <FaUser /> },
        { id: 'wifi', label: 'Free WiFi', icon: <FaGlobeAmericas /> },
        { id: 'restaurant', label: 'Restaurant', icon: <MdRestaurant /> },
        { id: 'spa', label: 'Spa', icon: <FaUser /> },
    ];

    // Board types
    const boardTypes = [
        { value: '', label: 'Any Board Type' },
        { value: 'FULL_BOARD', label: 'Full Board' },
        { value: 'HALF_BOARD', label: 'Half Board' },
        { value: 'BED_AND_BREAKFAST', label: 'Bed & Breakfast' },
        { value: 'ROOM_ONLY', label: 'Room Only' }
    ];

    // Payment policies
    const paymentPolicies = [
        { value: '', label: 'Any Payment Policy' },
        { value: 'PAY_AT_HOTEL', label: 'Pay at Hotel' },
        { value: 'PREPAID', label: 'Prepaid' }
    ];

    // Hotel sources
    const hotelSources = [
        { value: 'ALL', label: 'All Sources' },
        { value: 'BRANDS', label: 'Hotel Brands' },
        { value: 'CHAIN', label: 'Hotel Chains' }
    ];

    // Currencies
    const currencies = [
        { value: 'USD', label: 'USD' },
        { value: 'EUR', label: 'EUR' },
        { value: 'GBP', label: 'GBP' },
        { value: 'JPY', label: 'JPY' }
    ];

    // Fetch all countries that have airports (used for hotels as well)
    useEffect(() => {
        const fetchAllCountries = async () => {
            setLoadingCountries(true);
            try {
                const response = await fetch(`${API_BASE_URL}/airports`);
                const data = await response.json();
                const countryList = Object.keys(data);
                setCountries(countryList);
                setFilteredCountries(countryList);
                setLoadingCountries(false);
            } catch (error) {
                console.error("Error fetching countries:", error);
                setLoadingCountries(false);
            }
        };

        fetchAllCountries();
    }, []);

    // Fetch cities when country changes
    useEffect(() => {
        if (formData.country) {
            setLoadingCities(true);
            fetch(`${API_BASE_URL}/airports?country=${encodeURIComponent(formData.country)}`)
                .then(response => response.json())
                .then(data => {
                    setCities(data);
                    // Get city names as an array
                    const cityNames = Object.keys(data);
                    setFilteredCities(cityNames);
                    setLoadingCities(false);

                    // Reset city selection when country changes
                    setFormData(prevState => ({
                        ...prevState,
                        cityCode: '',
                        cityName: ''
                    }));
                    setCitySearch('');
                })
                .catch(error => {
                    console.error("Error fetching cities:", error);
                    setLoadingCities(false);
                });
        }
    }, [formData.country]);

    // Handle clicks outside dropdowns
    useEffect(() => {
        function handleClickOutside(event) {
            if (cityDropdownRef.current && !cityDropdownRef.current.contains(event.target)) {
                setShowCityDropdown(false);
            }
            if (countryDropdownRef.current && !countryDropdownRef.current.contains(event.target)) {
                setShowCountryDropdown(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Filter countries based on search input
    useEffect(() => {
        if (countrySearch) {
            const filtered = countries.filter(country =>
                country.toLowerCase().includes(countrySearch.toLowerCase())
            );
            setFilteredCountries(filtered);
        } else {
            setFilteredCountries(countries);
        }
    }, [countrySearch, countries]);

    // Filter cities based on search input
    useEffect(() => {
        if (formData.country && citySearch) {
            const cityNames = Object.keys(cities);
            const filtered = cityNames.filter(city =>
                city.toLowerCase().includes(citySearch.toLowerCase())
            );
            setFilteredCities(filtered);
        } else if (formData.country) {
            setFilteredCities(Object.keys(cities));
        }
    }, [citySearch, cities, formData.country]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (type === 'checkbox') {
            setFormData({ ...formData, [name]: checked });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleCountrySearch = (e) => {
        setCountrySearch(e.target.value);
    };

    const handleCitySearch = (e) => {
        setCitySearch(e.target.value);
    };

    const selectCountry = (country) => {
        setFormData({
            ...formData,
            country: country,
            cityCode: '',
            cityName: ''
        });
        setCountrySearch(country);
        setShowCountryDropdown(false);
    };

    const selectCity = (cityName) => {
        // Get the first airport for this city to use as the city code
        const cityAirports = cities[cityName] || [];
        const airportCode = cityAirports.length > 0 ? cityAirports[0].iata : '';

        setFormData({
            ...formData,
            cityCode: airportCode,
            cityName: cityName
        });
        setCitySearch(cityName);
        setShowCityDropdown(false);
    };

    const handleAmenityToggle = (amenityId) => {
        setFormData(prevState => {
            const currentAmenities = [...prevState.amenities];

            if (currentAmenities.includes(amenityId)) {
                return {
                    ...prevState,
                    amenities: currentAmenities.filter(id => id !== amenityId)
                };
            } else {
                return {
                    ...prevState,
                    amenities: [...currentAmenities, amenityId]
                };
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setSearchError(null);
        setAvailableHotelsShow(false)
        // Prepare the payload
        const payload = {
            cityCode: formData.cityCode,
            checkInDate: formData.checkInDate,
            checkOutDate: formData.checkOutDate,
            adults: parseInt(formData.adults),
        };

        // Add optional fields if they have values
        if (formData.roomQuantity) payload.roomQuantity = parseInt(formData.roomQuantity);
        if (formData.priceRange) payload.priceRange = formData.priceRange;
        if (formData.ratings) payload.ratings = parseInt(formData.ratings);
        if (formData.amenities.length > 0) payload.amenities = formData.amenities.join(',');
        if (formData.boardType) payload.boardType = formData.boardType;
        if (formData.paymentPolicy) payload.paymentPolicy = formData.paymentPolicy;
        if (formData.currency) payload.currency = formData.currency;
        if (formData.bestRateOnly) payload.bestRateOnly = formData.bestRateOnly;
        if (formData.hotelSource) payload.hotelSource = formData.hotelSource;

        try {
            const response = await fetch(`${API_BASE_URL}/hotels`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const result = await response.json();

            if (!response.ok) throw new Error(result.message || "Failed to fetch hotels");

            console.log("Hotel search result:", result);
            setAvailableHotels(result.data);
            setAvailableHotelsShow(true)
            setShowResults(true);
            setIsLoading(false);
        } catch (error) {
            console.error("Error searching hotels:", error);
            setSearchError("Failed to search hotels. Please try again.");
            setIsLoading(false);
        }
    };

    // Calculate minimum check-out date (must be after check-in)
    const minCheckoutDate = formData.checkInDate ? new Date(formData.checkInDate) : null;
    if (minCheckoutDate) {
        minCheckoutDate.setDate(minCheckoutDate.getDate() + 1);
    }
    const minCheckoutString = minCheckoutDate ? minCheckoutDate.toISOString().split('T')[0] : '';

    return (
        <div className="w-full mx-auto p-4">
            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                <div className="flex items-center mb-6">
                    <FaHotel className="text-blue-600 text-2xl mr-3" />
                    <h2 className="text-2xl font-bold text-gray-800">Hotel Search</h2>
                </div>
                <p className="text-sm text-gray-600 mb-4 italic">
                    Only fields marked with <span className="text-red-600 text-base">*</span> are required. You can leave the rest optional.
                </p>

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Country Selection */}
                        <div className="relative" ref={countryDropdownRef}>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                <span className="flex items-center gap-1">
                                    <FaGlobeAmericas className="text-blue-500" />
                                    <span>Country</span>
                                    <span className="text-red-600 text-lg">*</span>
                                </span>
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    placeholder={loadingCountries ? "Loading countries..." : "Search for a country"}
                                    value={countrySearch}
                                    onChange={handleCountrySearch}
                                    onClick={() => !loadingCountries && setShowCountryDropdown(true)}
                                    disabled={loadingCountries}
                                    required
                                />
                                <IoIosArrowDown className="absolute right-3 top-3 text-gray-400" />
                            </div>

                            {showCountryDropdown && (
                                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                                    {filteredCountries.length > 0 ? (
                                        filteredCountries.map((country, index) => (
                                            <div
                                                key={index}
                                                className="px-4 py-2 hover:bg-blue-50 cursor-pointer flex items-center"
                                                onClick={() => selectCountry(country)}
                                            >
                                                <FaGlobeAmericas className="mr-2 text-blue-500" />
                                                <span>{country}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="px-4 py-2 text-gray-500">No countries found</div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* City Selection */}
                        <div className="relative" ref={cityDropdownRef}>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                <span className="flex items-center gap-1">
                                    <FaMapMarkerAlt className="text-blue-500" />
                                    <span>City</span>
                                    <span className="text-red-600 text-lg">*</span>
                                </span>
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    placeholder={
                                        !formData.country
                                            ? "Select a country first"
                                            : loadingCities
                                                ? "Loading cities..."
                                                : "Search for a city"
                                    }
                                    value={citySearch}
                                    onChange={handleCitySearch}
                                    onClick={() => formData.country && !loadingCities && setShowCityDropdown(true)}
                                    disabled={!formData.country || loadingCities}
                                    required
                                />
                                <IoIosArrowDown className="absolute right-3 top-3 text-gray-400" />
                            </div>

                            {showCityDropdown && (
                                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                                    {filteredCities.length > 0 ? (
                                        filteredCities.map((city, index) => (
                                            <div
                                                key={index}
                                                className="px-4 py-2 hover:bg-blue-50 cursor-pointer flex items-center"
                                                onClick={() => selectCity(city)}
                                            >
                                                <FaMapMarkerAlt className="mr-2 text-blue-500" />
                                                <span>{city}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="px-4 py-2 text-gray-500">No cities found</div>
                                    )}
                                </div>
                            )}
                            <input type="hidden" name="cityCode" value={formData.cityCode} />
                            <input type="hidden" name="cityName" value={formData.cityName} />
                        </div>

                        {/* Check-in Date */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                <span className="flex items-center gap-1">
                                    <FaCalendarAlt className="text-blue-500" />
                                    <span>Check-in Date</span>
                                    <span className="text-red-600 text-lg">*</span>
                                </span>
                            </label>
                            <input
                                type="date"
                                name="checkInDate"
                                value={formData.checkInDate}
                                onChange={handleInputChange}
                                min={new Date().toISOString().split('T')[0]}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                        </div>

                        {/* Check-out Date */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                <span className="flex items-center gap-1">
                                    <FaCalendarAlt className="text-blue-500" />
                                    <span>Check-out Date</span>
                                    <span className="text-red-600 text-lg">*</span>
                                </span>
                            </label>
                            <input
                                type="date"
                                name="checkOutDate"
                                value={formData.checkOutDate}
                                onChange={handleInputChange}
                                min={minCheckoutString || new Date().toISOString().split('T')[0]}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                        </div>

                        {/* Adults */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                <span className="flex items-center gap-1">
                                    <FaUser className="text-blue-500" />
                                    <span>Adults</span>
                                    <span className="text-red-600 text-lg">*</span>
                                </span>
                            </label>
                            <input
                                type="number"
                                name="adults"
                                value={formData.adults}
                                onChange={handleInputChange}
                                min="1"
                                max="10"
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                        </div>

                        {/* Room Quantity */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                <MdMeetingRoom className="inline mr-2 text-blue-500" />
                                Rooms
                            </label>
                            <input
                                type="number"
                                name="roomQuantity"
                                value={formData.roomQuantity}
                                onChange={handleInputChange}
                                min="1"
                                max="5"
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        {/* Price Range */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                <FaDollarSign className="inline mr-2 text-blue-500" />
                                Price Range
                            </label>
                            <div className="mb-1">
                                <div className="flex justify-between text-xs text-gray-500">
                                    <span>${formData.priceMin || 0}</span>
                                    <span>${formData.priceMax || 1000}</span>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4">
                                <input
                                    type="range"
                                    name="priceMin"
                                    min="0"
                                    max="1000"
                                    step="10"
                                    value={formData.priceMin || 0}
                                    onChange={(e) => {
                                        const value = parseInt(e.target.value);
                                        // Ensure min doesn't exceed max
                                        if (value <= (formData.priceMax || 1000)) {
                                            setFormData({
                                                ...formData,
                                                priceMin: value,
                                                priceRange: `${value}-${formData.priceMax || 1000}`
                                            });
                                        }
                                    }}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                />
                                <span className="text-sm text-gray-600">to</span>
                                <input
                                    type="range"
                                    name="priceMax"
                                    min="0"
                                    max="1000"
                                    step="10"
                                    value={formData.priceMax || 1000}
                                    onChange={(e) => {
                                        const value = parseInt(e.target.value);
                                        // Ensure max doesn't go below min
                                        if (value >= (formData.priceMin || 0)) {
                                            setFormData({
                                                ...formData,
                                                priceMax: value,
                                                priceRange: `${formData.priceMin || 0}-${value}`
                                            });
                                        }
                                    }}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                />
                            </div>
                            <div className="mt-2 flex justify-between px-1">
                                <input
                                    type="number"
                                    min="0"
                                    max={formData.priceMax || 1000}
                                    value={formData.priceMin || 0}
                                    onChange={(e) => {
                                        const value = parseInt(e.target.value);
                                        if (value <= (formData.priceMax || 1000)) {
                                            setFormData({
                                                ...formData,
                                                priceMin: value,
                                                priceRange: `${value}-${formData.priceMax || 1000}`
                                            });
                                        }
                                    }}
                                    className="w-20 px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                />
                                <input
                                    type="number"
                                    min={formData.priceMin || 0}
                                    max="1000"
                                    value={formData.priceMax || 1000}
                                    onChange={(e) => {
                                        const value = parseInt(e.target.value);
                                        if (value >= (formData.priceMin || 0)) {
                                            setFormData({
                                                ...formData,
                                                priceMax: value,
                                                priceRange: `${formData.priceMin || 0}-${value}`
                                            });
                                        }
                                    }}
                                    className="w-20 px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>

                        {/* Minimum Rating */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                <FaStar className="inline mr-2 text-blue-500" />
                                Minimum Rating
                            </label>
                            <select
                                name="ratings"
                                value={formData.ratings}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">Any Rating</option>
                                <option value="1">1+ Star</option>
                                <option value="2">2+ Stars</option>
                                <option value="3">3+ Stars</option>
                                <option value="4">4+ Stars</option>
                                <option value="5">5 Stars Only</option>
                            </select>
                        </div>

                        {/* Board Type */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                <MdRestaurant className="inline mr-2 text-blue-500" />
                                Board Type
                            </label>
                            <select
                                name="boardType"
                                value={formData.boardType}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            >
                                {boardTypes.map((type, idx) => (
                                    <option key={idx} value={type.value}>{type.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Payment Policy */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                <FaCreditCard className="inline mr-2 text-blue-500" />
                                Payment Policy
                            </label>
                            <select
                                name="paymentPolicy"
                                value={formData.paymentPolicy}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            >
                                {paymentPolicies.map((policy, idx) => (
                                    <option key={idx} value={policy.value}>{policy.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Currency */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                <FaDollarSign className="inline mr-2 text-blue-500" />
                                Currency
                            </label>
                            <select
                                name="currency"
                                value={formData.currency}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            >
                                {currencies.map((currency, idx) => (
                                    <option key={idx} value={currency.value}>{currency.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Hotel Source */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                <FaHotel className="inline mr-2 text-blue-500" />
                                Hotel Source
                            </label>
                            <select
                                name="hotelSource"
                                value={formData.hotelSource}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            >
                                {hotelSources.map((source, idx) => (
                                    <option key={idx} value={source.value}>{source.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Amenities Section */}
                    <div className="mt-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <FaSwimmingPool className="inline mr-2 text-blue-500" />
                            Amenities
                        </label>
                        <div className="flex flex-wrap gap-3">
                            {availableAmenities.map(amenity => (
                                <div
                                    key={amenity.id}
                                    className={`flex items-center px-3 py-2 rounded-full border cursor-pointer transition-colors
                                    ${formData.amenities.includes(amenity.id)
                                            ? 'bg-blue-100 border-blue-500 text-blue-700'
                                            : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'}`}
                                    onClick={() => handleAmenityToggle(amenity.id)}
                                >
                                    <span className="mr-2">{amenity.icon}</span>
                                    <span>{amenity.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Show Best Rate Only */}
                    <div className="mt-4">
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                                type="checkbox"
                                name="bestRateOnly"
                                checked={formData.bestRateOnly}
                                onChange={handleInputChange}
                                className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">Show best rate only</span>
                        </label>
                    </div>

                    <div className="mt-6 flex justify-center">
                        <button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg flex items-center transition duration-300"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <span className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Searching...
                                </span>
                            ) : (
                                <>
                                    <FaSearch className="mr-2" />
                                    Search Hotels
                                </>
                            )}
                        </button>
                    </div>
                </form>

                {searchError && (
                    <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
                        <p>{searchError}</p>
                    </div>
                )}
            </div>
            {availableHotelsShow && availableHotels.map((hotel, index) => (
                <HotelCard key={index} hotel={hotel} checkInDate={formData.checkInDate} checkOutDate={formData.checkOutDate} adults={formData.adults} />
            ))}

        </div>
    );
};

export default HotelSearch;