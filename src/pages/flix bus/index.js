import React, { useState, useEffect } from "react";
import {
  Search,
  MapPin,
  Calendar,
  Clock,
  Users,
  ArrowRight,
  Bus,
  DollarSign,
  Wifi,
  Zap,
  RefreshCw,
  Globe
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function BusSearchPage() {
  const [countries] = useState({
    "GB": "Great Britain",
    "RS": "Serbia",
    "BA": "Bosnia and Herzegovina",
    "NO": "Norway",
    "UA": "Ukraine",
    "BY": "Belarus",
    "AL": "Albania",
    "AE": "United Arab Emirates",
    "AM": "Armenia",
    "NZ": "New Zealand",
    "BD": "Bangladesh",
    "BR": "Brazil",
    "CN": "China",
    "EG": "Egypt",
    "EE": "Estonia",
    "FI": "Finland",
    "GE": "Georgia",
    "GR": "Greece",
    "IN": "India",
    "IL": "Israel",
    "JP": "Japan",
    "KR": "Korea",
    "KW": "Kuwait",
    "LB": "Lebanon",
    "LK": "Sri Lanka",
    "LT": "Lithuania",
    "LV": "Latvia",
    "MT": "Malta",
    "ME": "Montenegro",
    "MX": "Mexico",
    "MK": "North Macedonia",
    "MY": "Malaysia",
    "MD": "Moldova",
    "OM": "Oman",
    "PY": "Paraguay",
    "XK": "Kosovo",
    "US": "USA",
    "ZA": "South Africa",
    "ZM": "Zambia",
    "TW": "Taiwan",
    "CO": "Colombia",
    "CY": "Cyprus",
    "AU": "Australia",
    "IQ": "Iraq",
    "CA": "Canada",
    "AR": "Argentina",
    "AZ": "Azerbaijan",
    "CL": "Chile",
    "DO": "Dominican Republic",
    "PA": "Panama",
    "PE": "Peru",
    "IE": "Ireland",
    "PH": "Philippines",
    "ID": "Indonesia",
    "SM": "San Marino",
    "EC": "Ecuador",
    "IT": "Italy",
    "DE": "Germany",
    "CH": "Switzerland",
    "FR": "France",
    "LU": "Luxembourg",
    "SE": "Sweden",
    "NL": "Netherlands",
    "AT": "Austria",
    "PL": "Poland",
    "DK": "Denmark",
    "ES": "Spain",
    "BG": "Bulgaria",
    "RO": "Romania",
    "SK": "Slovakia",
    "SI": "Slovenia",
    "HU": "Hungary",
    "UK": "United Kingdom",
    "HR": "Croatia",
    "TR": "Turkey",
    "CZ": "Czech Republic",
    "BE": "Belgium",
    "RU": "Russia",
    "PT": "Portugal",
    "AD": "Andorra",
    "TH": "Thailand"
  });

  const [selectedCountry, setSelectedCountry] = useState("US");
  const [cities, setCities] = useState([]);
  const [filteredFromCities, setFilteredFromCities] = useState([]);
  const [filteredToCities, setFilteredToCities] = useState([]);
  const [fromCity, setFromCity] = useState("");
  const [toCity, setToCity] = useState("");
  const [fromCityId, setFromCityId] = useState("");
  const [toCityId, setToCityId] = useState("");
  const [date, setDate] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingCities, setLoadingCities] = useState(true);
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const [filteredCountries, setFilteredCountries] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [priceFilter, setPriceFilter] = useState({ min: "", max: "" });
  const [durationFilter, setDurationFilter] = useState({ max: "" });
  const [transferFilter, setTransferFilter] = useState("all");

  // Fetch cities on component mount and when country changes
  useEffect(() => {
    fetchCities();
  }, [selectedCountry]);

  // Initialize filtered countries
  useEffect(() => {
    setFilteredCountries(Object.entries(countries));
  }, [countries]);

  // Apply filters to results
  useEffect(() => {
    let filtered = [...results];

    // Price filter
    if (priceFilter.min) {
      filtered = filtered.filter(trip => trip.price.total_with_platform_fee >= parseFloat(priceFilter.min));
    }
    if (priceFilter.max) {
      filtered = filtered.filter(trip => trip.price.total_with_platform_fee <= parseFloat(priceFilter.max));
    }

    // Duration filter
    if (durationFilter.max) {
      filtered = filtered.filter(trip => {
        const totalMinutes = trip.duration.hours * 60 + trip.duration.minutes;
        return totalMinutes <= parseFloat(durationFilter.max) * 60;
      });
    }

    // Transfer filter
    if (transferFilter === "direct") {
      filtered = filtered.filter(trip => trip.transfer_type === "Direct" || !trip.transfer_type);
    } else if (transferFilter === "transfer") {
      filtered = filtered.filter(trip => trip.transfer_type === "Transfer");
    }

    setFilteredResults(filtered);
  }, [results, priceFilter, durationFilter, transferFilter]);

  const fetchCities = async () => {
    setLoadingCities(true);
    // Reset city selections when country changes
    setFromCity("");
    setToCity("");
    setFromCityId("");
    setToCityId("");

    try {
      const response = await fetch(
        `https://global.api.flixbus.com/cms/cities?language=en-us&country=${selectedCountry}`
      );
      const data = await response.json();
      const cityList = data.result
        .filter((city) => city.transportation_category.includes("bus"))
        .sort((a, b) => b.search_volume - a.search_volume)
        .map((city) => ({
          id: city.uuid,
          name: city.name,
          country: countries[selectedCountry],
          searchVolume: city.search_volume
        }));
      setCities(cityList);
      setFilteredFromCities(cityList);
      setFilteredToCities(cityList);
    } catch (error) {
      console.error("Failed to fetch cities:", error);
      setCities([]);
      setFilteredFromCities([]);
      setFilteredToCities([]);
    } finally {
      setLoadingCities(false);
    }
  };

  const handleCountryChange = (countryCode) => {
    setSelectedCountry(countryCode);
    setShowCountryDropdown(false);
    setCountrySearch("");
    setResults([]); // Clear previous results
  };

  const handleCountrySearch = (value) => {
    setCountrySearch(value);
    const filtered = Object.entries(countries).filter(([code, name]) =>
      name.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredCountries(filtered);
  };

  const handleFromCityChange = (value) => {
    setFromCity(value);
    setShowFromDropdown(true);
    const filtered = cities.filter(
      (city) =>
        city.name.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredFromCities(filtered);
  };
  const navigate = useNavigate()

  const handleClick = (busData) => {
    // Calculate both prices for passing to booking
    // const prices = calculatePriceWithMarkup(flight.price.grandTotal);

    // Create enhanced flight data with both original and marked up prices
    // const enhancedFlightData = {
    //   ...flight,
    //   pricing: {
    //     original: {
    //       amount: prices.original,
    //       currency: flight.price.currency
    //     },
    //     display: {
    //       amount: prices.markedUp,
    //       currency: flight.price.currency
    //     }
    //   }
    // };
    console.log(busData)

    navigate("/book/bus", {
      state: { busData }
    });
  };

  const handleToCityChange = (value) => {
    setToCity(value);
    setShowToDropdown(true);
    const filtered = cities.filter(
      (city) =>
        city.name.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredToCities(filtered);
  };

  const selectFromCity = (city) => {
    setFromCity(city.name);
    setFromCityId(city.id);
    setShowFromDropdown(false);
  };

  const selectToCity = (city) => {
    setToCity(city.name);
    setToCityId(city.id);
    setShowToDropdown(false);
  };

  const searchTrips = async () => {
    if (!fromCityId || !toCityId || !date) return;

    setLoading(true);
    // Format date as DD.MM.YYYY for FlixBus API
    const formattedDate = new Date(date)
      .toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
      })
      .replace(/\//g, ".");

    const url = `https://global.api.flixbus.com/search/service/v4/search?from_city_id=${fromCityId}&to_city_id=${toCityId}&departure_date=${formattedDate}&products=%7B"adult"%3A1%7D&currency=USD&locale=en_US&search_by=cities&include_after_midnight_rides=1&disable_distribusion_trips=0&disable_global_trips=0`;

    try {
      const res = await fetch(url);
      const data = await res.json();
      console.log(data.trips)
      if (data.trips && data.trips.length > 0) {
        const trips = data.trips[0]?.results || {};
        const tripList = Object.values(trips);
        setResults(tripList);

      } else {
        setResults([]);
      }
    } catch (err) {
      console.error("Failed to fetch trips", err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (hours, minutes) => {
    if (hours > 0 && minutes > 0) {
      return `${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${minutes}m`;
    }
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString)
      .toLocaleString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
      })
      .replace(",", " at");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 text-blue-600">
            <Bus size={32} />
            <h1 className="text-3xl font-bold">European Bus Search</h1>
          </div>
          <p className="text-gray-600">
            Find the best bus routes for your journey
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          {/* Country Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Globe size={16} className="inline mr-1" />
              Select Country
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search countries..."
                value={showCountryDropdown ? countrySearch : countries[selectedCountry]}
                onChange={(e) => handleCountrySearch(e.target.value)}
                onFocus={() => setShowCountryDropdown(true)}
                onBlur={() => setTimeout(() => setShowCountryDropdown(false), 200)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {showCountryDropdown && (
                <div className="absolute z-20 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto mt-1">
                  {filteredCountries.map(([code, name]) => (
                    <div
                      key={code}
                      className={`px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm ${selectedCountry === code ? 'bg-blue-50 text-blue-600 font-medium' : ''
                        }`}
                      onClick={() => handleCountryChange(code)}
                    >
                      {name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* From City */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin size={16} className="inline mr-1" />
                From
              </label>
              <input
                type="text"
                placeholder={
                  loadingCities ? "Loading cities..." : "Search departure city"
                }
                value={fromCity}
                onChange={(e) => handleFromCityChange(e.target.value)}
                onFocus={() => setShowFromDropdown(true)}
                disabled={loadingCities || cities.length === 0}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              {showFromDropdown && filteredFromCities.length > 0 && (
                <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto mt-1">
                  {filteredFromCities.slice(0, 10).map((city) => (
                    <div
                      key={city.id}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                      onClick={() => selectFromCity(city)}
                    >
                      <div className="font-medium">{city.name}</div>
                      <div className="text-gray-500 text-xs">
                        {city.country}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* To City */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin size={16} className="inline mr-1" />
                To
              </label>
              <input
                type="text"
                placeholder={
                  loadingCities
                    ? "Loading cities..."
                    : "Search destination city"
                }
                value={toCity}
                onChange={(e) => handleToCityChange(e.target.value)}
                onFocus={() => setShowToDropdown(true)}
                disabled={loadingCities || cities.length === 0}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              {showToDropdown && filteredToCities.length > 0 && (
                <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto mt-1">
                  {filteredToCities.slice(0, 10).map((city) => (
                    <div
                      key={city.id}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                      onClick={() => selectToCity(city)}
                    >
                      <div className="font-medium">{city.name}</div>
                      <div className="text-gray-500 text-xs">
                        {city.country}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar size={16} className="inline mr-1" />
                Departure Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <button
            onClick={searchTrips}
            disabled={!fromCityId || !toCityId || !date || loading || loadingCities}
            className="w-full mt-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 text-lg font-medium rounded-md transition-colors duration-200"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Searching...
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <Search size={20} />
                Search Buses
              </div>
            )}
          </button>
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-800">
                Found {filteredResults.length} of {results.length} trip{results.length !== 1 ? "s" : ""}
              </h2>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-md p-4 border border-gray-200">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Filters</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Price Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <DollarSign size={14} className="inline mr-1" />
                    Price Range
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={priceFilter.min}
                      onChange={(e) =>
                        setPriceFilter({ ...priceFilter, min: Number(e.target.value) })
                      }
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={priceFilter.max}
                      onChange={(e) =>
                        setPriceFilter({ ...priceFilter, max: Number(e.target.value) })
                      }
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>


                {/* Duration Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Clock size={14} className="inline mr-1" />
                    Max Duration (hours)
                  </label>
                  <input
                    type="number"
                    placeholder="Max hours"
                    value={durationFilter.max}
                    onChange={(e) => setDurationFilter({ max: e.target.value })}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* Transfer Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <RefreshCw size={14} className="inline mr-1" />
                    Transfer Type
                  </label>
                  <select
                    value={transferFilter}
                    onChange={(e) => setTransferFilter(e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="all">All</option>
                    <option value="direct">Direct only</option>
                    <option value="transfer">With transfers</option>
                  </select>
                </div>

                {/* Clear Filters */}
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setPriceFilter({ min: "", max: "" });
                      setDurationFilter({ max: "" });
                      setTransferFilter("all");
                    }}
                    className="w-full px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {filteredResults.map((trip, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow border border-gray-200"
                >
                  <div className="flex flex-col space-y-4">
                    {/* Header with Provider and Transfer Type */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Bus size={18} className="text-blue-600" />
                        <span className="font-semibold text-gray-800 capitalize">
                          {trip.provider}
                        </span>
                        {trip.transfer_type && (
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${trip.transfer_type === "Direct"
                              ? "bg-green-100 text-green-800"
                              : "bg-orange-100 text-orange-800"
                              }`}
                          >
                            {trip.transfer_type === "Transfer" ? (
                              <div className="flex items-center gap-1">
                                <RefreshCw size={12} />
                                Transfer
                              </div>
                            ) : (
                              "Direct"
                            )}
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-2xl font-bold text-green-600">
                          <DollarSign size={24} />
                          {trip.price.total_with_platform_fee.toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {trip.price.total !==
                            trip.price.total_with_platform_fee && (
                              <span className="line-through mr-1">
                                ${trip.price.total.toFixed(2)}
                              </span>
                            )}
                          per person
                        </div>
                      </div>
                    </div>

                    {/* Journey Timeline */}
                    <div className="flex items-center gap-4">
                      <div className="text-center flex-shrink-0">
                        <div className="font-bold text-xl text-gray-800">
                          {formatDateTime(trip.departure.date).split(" at ")[1]}
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatDateTime(trip.departure.date).split(" at ")[0]}
                        </div>
                      </div>

                      <div className="flex-1 flex items-center">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <div className="flex-1 h-0.5 bg-gray-300 relative">
                          <Bus
                            size={16}
                            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-blue-500 bg-white"
                          />
                        </div>
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      </div>

                      <div className="text-center flex-shrink-0">
                        <div className="font-bold text-xl text-gray-800">
                          {formatDateTime(trip.arrival.date).split(" at ")[1]}
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatDateTime(trip.arrival.date).split(" at ")[0]}
                        </div>
                      </div>
                    </div>

                    {/* Trip Details */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Clock size={16} />
                        {formatDuration(
                          trip.duration.hours,
                          trip.duration.minutes
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users size={16} />
                        {trip.available.seats} seats available
                      </div>
                      {trip.remaining?.capacity && (
                        <div
                          className={`px-2 py-1 rounded text-xs font-medium ${trip.remaining.capacity === "high"
                            ? "bg-green-100 text-green-800"
                            : trip.remaining.capacity === "medium"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                            }`}
                        >
                          {trip.remaining.capacity} availability
                        </div>
                      )}
                    </div>

                    {/* Amenities */}
                    {trip.legs &&
                      trip.legs[0]?.amenities &&
                      trip.legs[0].amenities.length > 0 && (
                        <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                          <span className="text-sm text-gray-600">
                            Amenities:
                          </span>
                          <div className="flex gap-2">
                            {trip.legs[0].amenities.map((amenity, idx) => (
                              <div
                                key={idx}
                                className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs"
                              >
                                {amenity === "WIFI" && <Wifi size={12} />}
                                {amenity === "POWER_SOCKETS" && (
                                  <Zap size={12} />
                                )}
                                <span>
                                  {amenity.replace("_", " ").toLowerCase()}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    {/* Legs Information for Transfers */}
                    {trip.legs && trip.legs.length > 1 && (
                      <div className="pt-2 border-t border-gray-100">
                        <div className="text-sm font-medium text-gray-700 mb-2">
                          Journey Details:
                        </div>
                        <div className="space-y-2">
                          {trip.legs.map((leg, legIndex) => (
                            <div
                              key={legIndex}
                              className="text-xs text-gray-600 flex items-center gap-2"
                            >
                              <div className="w-4 h-4 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold">
                                {legIndex + 1}
                              </div>
                              <span>
                                {
                                  formatDateTime(leg.departure.date).split(
                                    " at "
                                  )[1]
                                }{" "}
                                →{" "}
                                {
                                  formatDateTime(leg.arrival.date).split(
                                    " at "
                                  )[1]
                                }
                                {leg.means_of_transport &&
                                  ` (${leg.means_of_transport})`}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col sm:flex-row justify-between items-center mt-4 gap-3">
                    <button
                      onClick={() => handleClick(trip)}
                      className="bg-blue-600 text-white cursor-pointer px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm w-full sm:w-auto">
                      Select Bus
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Results */}
        {!loading && filteredResults.length === 0 && results.length > 0 && (
          <div className="text-center py-8">
            <Bus size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">
              No trips match your filter criteria.
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Try adjusting your filters or search criteria.
            </p>
          </div>
        )}

        {/* No Results */}
        {!loading && results.length === 0 && fromCityId && toCityId && date && (
          <div className="text-center py-8">
            <Bus size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">
              No trips found for your search criteria.
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Try adjusting your departure date or cities.
            </p>
          </div>
        )}

        {/* No Cities Available */}
        {!loadingCities && cities.length === 0 && (
          <div className="text-center py-8">
            <Globe size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">
              No cities available for {countries[selectedCountry]}.
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Try selecting a different country.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}