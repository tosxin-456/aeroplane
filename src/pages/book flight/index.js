import { useEffect, useState } from "react";
import {
    Plane,
    Calendar,
    User,
    Phone,
    Mail,
    MapPin,
    CreditCard,
    Shield,
    ArrowLeft,
    Check,
    AlertCircle,
    Loader2,
} from "lucide-react";
import { FaDollarSign, FaPoundSign, FaRupeeSign, FaYenSign } from "react-icons/fa";
import { FaEuroSign, FaNairaSign, FaPassport } from "react-icons/fa6";
import { useLocation, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../config/apiConfig";
import PaymentPage from "../../components/paymentIdComponent";
import TravelLoader from "../../components/airlplaneLoader";

const currencyIcons = {
    USD: <FaDollarSign />,
    EUR: <FaEuroSign />,
    GBP: <FaPoundSign />,
    NGN: <FaNairaSign />,
    JPY: <FaYenSign />,
    INR: <FaRupeeSign />,
};

export default function FlightBookingForm({ flightOffer }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [activeStep, setActiveStep] = useState(1);
    const [upsellOptions, setUpsellOptions] = useState([]);
    const [paymentDetails, setPaymentDetails] = useState({
        cardholderName: '',
        cardNumber: '',
        expiryMonth: '',
        expiryYear: '',
        expiryDate: '', // This will be formatted as YYYY-MM for Amadeus
        cvc: '',
        cardType: ''
    });


    const navigate = useNavigate()

    // If no flight was passed, use location state
    const location = useLocation();
    const [bookingReferences, setBookingReference] = useState("")
    const [ticketNumber, setTicketNumber] = useState("")

    const flight = flightOffer || location.state?.flightData || null;
    const originalOffer = flight
    // console.log(flight);
    const [travelers, setTravelers] = useState([
        {
            id: 1,
            type: "ADULT",
            title: "Mr",
            firstName: "",
            lastName: "",
            dateOfBirth: "",
            email: "",
            phone: "",
            nationality: "",
            passportNumber: "",
            passportExpiry: "",
        },
    ]);

    // Extract flight details from flight offer
    const segs = flight?.itineraries[0]?.segments || [];
    const dep = segs[0]?.departure;
    const arr = segs[segs.length - 1]?.arrival;

    const [countries, setCountries] = useState([]);

    useEffect(() => {
        const fetchCountries = async () => {
            try {
                const res = await fetch('https://restcountries.com/v3.1/all');
                const data = await res.json();

                const sortedCountries = data
                    .map(country => ({
                        name: country.name.common,
                        code: country.cca2, // ISO 3166-1 alpha-2 country code
                    }))
                    .sort((a, b) => a.name.localeCompare(b.name));

                setCountries(sortedCountries);
            } catch (error) {
                console.error("Failed to fetch countries:", error);
            }
        };

        fetchCountries();
    }, []);


    // Format helpers
    const formatDateTime = (str) => {
        const date = new Date(str);
        return {
            date: date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
            }),
            time: date.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
            }),
            day: date.toLocaleDateString("en-US", { weekday: "short" }),
        };
    };

    const formatDuration = (str) => {
        const h = str.match(/(\d+)H/),
            m = str.match(/(\d+)M/);
        return `${h ? `${h[1]}h ` : ""}${m ? `${m[1]}m` : ""}`;
    };

    const getConnectionLabel = (segments) => {
        const stopCount = segments.length - 1;
        if (stopCount === 0) return "Nonstop";
        if (stopCount === 1) return "1 connection";
        return `${stopCount} connections`;
    };

    const handleInputChange = (id, field, value) => {
        setTravelers((prev) =>
            prev.map((traveler) =>
                traveler.id === id ? { ...traveler, [field]: value } : traveler
            )
        );
    };

    const addTraveler = () => {
        setTravelers((prev) => [
            ...prev,
            {
                id: prev.length + 1,
                type: "ADULT",
                title: "Mr",
                firstName: "",
                lastName: "",
                dateOfBirth: "",
                email: "",
                phone: "",
                nationality: "",
                passportNumber: "",
                passportExpiry: "",
            },
        ]);
    };

    const removeTraveler = (id) => {
        if (travelers.length > 1) {
            setTravelers((prev) => prev.filter((traveler) => traveler.id !== id));
        }
    };

    const proceedToNextStep = () => {
        if (activeStep < 3) {
            setActiveStep(activeStep + 1);
            window.scrollTo(0, 0);
        }
    };

    const goToPreviousStep = () => {
        if (activeStep > 1) {
            setActiveStep(activeStep - 1);
            window.scrollTo(0, 0);
        }
    };
    const amount = parseFloat(flight?.price?.grandTotal); // From frontend
    const currency = flight?.price?.currency?.toLowerCase(); // e.g. 'usd'

    console.log(amount, currency)

    const getCountryCallingCode = async (countryName) => {
        try {
            const response = await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(countryName)}?fullText=true`);
            const data = await response.json();

            const idd = data?.[0]?.idd;
            if (idd?.root && idd?.suffixes?.length > 0) {
                return `${idd.root}${idd.suffixes[0]}`.replace("+", ""); // remove plus sign
            }
        } catch (error) {
            console.error("Error fetching country calling code:", error);
        }
        return "1";
    };


    const handlePaymentSuccess = async (paymentData) => {
        try {
            setLoading(true);
            setError(null);
            await new Promise((resolve) => setTimeout(resolve, 100));

            const formattedTravelers = await Promise.all(
                travelers.map(async (traveler, index) => {
                    const countryCallingCode = await getCountryCallingCode(traveler.nationality);

                    return {
                        id: (index + 1).toString(),
                        dateOfBirth: traveler.dateOfBirth,
                        name: {
                            firstName: traveler.firstName,
                            lastName: traveler.lastName,
                            title: traveler.title,
                        },
                        gender: traveler.title === "Mr" ? "MALE" : "FEMALE",
                        contact: {
                            emailAddress: traveler.email,
                            phones: [
                                {
                                    deviceType: "MOBILE",
                                    countryCallingCode,
                                    number: traveler.phone,
                                },
                            ],
                        },
                        documents: [
                            {
                                documentType: "PASSPORT",
                                number: traveler.passportNumber,
                                expiryDate: traveler.passportExpiry,
                                issuanceCountry: traveler.nationality,
                                nationality: traveler.nationality,
                                holder: true,
                            },
                        ],
                    };
                })
            );

            // Call the booking endpoint with payment data
            const response = await fetch(`${API_BASE_URL}/flights/book`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    flightOffer: flight,
                    travelersInfo: formattedTravelers,
                    paymentDetails: paymentData,
                    // userId: currentUser?.id // If you track logged-in users
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || "Failed to book and ticket flight");
            }

            // Update state with booking reference and ticket number
            setBookingReference(data.data.bookingReference);
            setTicketNumber(data.data.ticketNumber);

            setSuccess(true);
            setActiveStep(3);
        } catch (err) {
            console.error("Booking error:", err);
            setError(err.message || "An error occurred during booking and ticketing");
        } finally {
            setLoading(false);
        }

    };



    // Return loading state if no flight data yet
    if (!flight) {
        return (
            <div className="max-w-4xl mx-auto p-6 bg-gray-50 rounded-2xl shadow-sm text-center">
                <div className="animate-pulse">Loading flight details...</div>
            </div>
        );
    }
    const groupExtras = (extras) => {
        const grouped = {};
        extras.forEach((desc) => {
            const key = desc.split(" ")[0]; // crude grouping
            if (!grouped[key]) grouped[key] = [];
            grouped[key].push(desc);
        });
        return grouped;
    };
    console.log(flight)


    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-6 bg-gray-50 rounded-xl sm:rounded-2xl shadow-sm">
            {/* Header Section */}
            <div className="mb-6 sm:mb-8">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center">
                    <Plane className="mr-2 sm:mr-3 text-blue-600" /> Book Your Flight
                </h2>
                <div className="mt-4 flex items-center">
                    <div
                        className={`flex items-center ${activeStep >= 1 ? "text-blue-600" : "text-gray-400"
                            }`}
                    >
                        <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${activeStep >= 1
                                ? "bg-blue-100 text-blue-700"
                                : "bg-gray-100 text-gray-500"
                                }`}
                        >
                            1
                        </div>
                        <span className="hidden sm:inline font-medium">Flight Details</span>
                    </div>
                    <div className="mx-2 sm:mx-4 border-t-2 border-gray-200 w-8 sm:w-16"></div>
                    <div
                        className={`flex items-center ${activeStep >= 2 ? "text-blue-600" : "text-gray-400"
                            }`}
                    >
                        <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${activeStep >= 2
                                ? "bg-blue-100 text-blue-700"
                                : "bg-gray-100 text-gray-500"
                                }`}
                        >
                            2
                        </div>
                        <span className="hidden sm:inline font-medium">Travelers</span>
                    </div>
                    <div className="mx-2 sm:mx-4 border-t-2 border-gray-200 w-8 sm:w-16"></div>
                    <div
                        className={`flex items-center ${activeStep >= 3 ? "text-blue-600" : "text-gray-400"
                            }`}
                    >
                        <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${activeStep >= 3
                                ? "bg-blue-100 text-blue-700"
                                : "bg-gray-100 text-gray-500"
                                }`}
                        >
                            3
                        </div>
                        <span className="hidden sm:inline font-medium">Confirmation</span>
                    </div>
                </div>
            </div>

            {loading && <TravelLoader />}

            {/* Step 1: Flight Details */}
            {activeStep === 1 && (
                <section className="mb-6">
                    <div className="bg-white p-4 sm:p-6 rounded-xl border shadow-sm mb-6">
                        <h3 className="text-lg font-semibold mb-4 text-gray-800">
                            Flight Summary
                        </h3>

                        {/* Flight Card */}
                        <div className="border rounded-lg p-4 mb-4 bg-blue-50 border-blue-100">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                                <div className="flex items-center space-x-3">
                                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                        <Plane size={18} className="text-blue-600" />
                                    </div>
                                    <div>
                                        <div className="font-semibold">
                                            {flight.validatingAirlineCodes[0]}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            Flight #{segs[0].number}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-2 sm:mt-0 flex items-center text-blue-700 font-bold text-xl">
                                    <span className="mr-1 text-blue-600">
                                        {currencyIcons[flight.price.currency] ||
                                            flight.price.currency}
                                    </span>
                                    {parseFloat(flight.pricing.display.amount).toFixed(2)}
                                </div>
                            </div>

                            <div className="flex justify-between items-center mb-3">
                                <div className="text-center">
                                    <div className="text-lg font-bold">
                                        {formatDateTime(dep.at).time}
                                    </div>
                                    <div className="text-sm font-medium">{dep.iataCode}</div>
                                </div>

                                <div className="flex flex-col items-center flex-grow px-4">
                                    <div className="text-xs text-gray-500">
                                        {formatDuration(flight.itineraries[0].duration)}
                                    </div>
                                    <div className="relative w-full my-2">
                                        <div className="border-t-2 border-gray-300 absolute w-full top-1/2"></div>
                                        <Plane
                                            size={16}
                                            className="text-blue-600 absolute top-1/2 left-1/2 transform -translate-y-1/2 -translate-x-1/2"
                                        />
                                    </div>
                                    <div
                                        className={`text-xs font-medium rounded-full px-2 py-0.5 ${segs.length > 1
                                            ? "bg-amber-50 text-amber-700"
                                            : "bg-green-50 text-green-700"
                                            }`}
                                    >
                                        {getConnectionLabel(segs)}
                                    </div>
                                </div>

                                <div className="text-center">
                                    <div className="text-lg font-bold">
                                        {formatDateTime(arr.at).time}
                                    </div>
                                    <div className="text-sm font-medium">{arr.iataCode}</div>
                                </div>
                            </div>

                            <div className="flex justify-between text-sm text-gray-500">
                                <div>{formatDateTime(dep.at).day}, {formatDateTime(dep.at).date}</div>
                                <div>{formatDateTime(arr.at).day}, {formatDateTime(arr.at).date}</div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex items-center bg-gray-50 p-3 rounded-lg">
                                <Calendar size={18} className="mr-3 text-blue-500" />
                                <div>
                                    <div className="text-sm text-gray-500">Departure Date</div>
                                    <div className="font-medium">
                                        {formatDateTime(dep.at).date}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center bg-gray-50 p-3 rounded-lg">
                                <MapPin size={18} className="mr-3 text-blue-500" />
                                <div>
                                    <div className="text-sm text-gray-500">Route</div>
                                    <div className="font-medium">
                                        {dep.iataCode} → {arr.iataCode}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Fare Details */}
                    <div className="bg-white p-4 sm:p-6 rounded-xl border shadow-sm">

                        <div className="flex items-center justify-between text-lg font-medium">
                            <span>Total</span>
                            <div className="flex items-center" >
                                <span className="text-blue-700 font-semibold">
                                    {currencyIcons[flight.price.currency] || flight.price.currency}{" "}
                                </span>
                                <span>
                                    {parseFloat(flight.pricing.display.amount).toFixed(2)}
                                </span>

                            </div>
                        </div>

                    </div>

                    <div className="mt-6 flex justify-end">
                        <button
                            onClick={proceedToNextStep}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
                        >
                            Continue to Traveler Information
                        </button>
                    </div>
                </section>
            )}

            {/* Step 2: Traveler Information */}
            {activeStep === 2 && (
                <section className="mb-6">
                    <div className="bg-white p-4 sm:p-6 rounded-xl border shadow-sm mb-6">
                        <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
                            <User className="mr-2 text-blue-600" /> Traveler Information
                        </h3>

                        {travelers.map((traveler, index) => (
                            <div
                                key={traveler.id}
                                className="mb-6 pb-6 border-b border-gray-100 last:border-0 last:pb-0"
                            >
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="font-medium text-gray-800">
                                        Traveler {index + 1}
                                    </h4>
                                    {travelers.length > 1 && (
                                        <button
                                            onClick={() => removeTraveler(traveler.id)}
                                            className="text-red-500 text-sm hover:text-red-700"
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Title
                                        </label>
                                        <select
                                            value={traveler.title}
                                            onChange={(e) =>
                                                handleInputChange(traveler.id, "title", e.target.value)
                                            }
                                            className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value="Mr">Mr</option>
                                            <option value="Ms">Ms</option>
                                            <option value="Mrs">Mrs</option>
                                            <option value="Dr">Dr</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            First Name
                                        </label>
                                        <input
                                            type="text"
                                            value={traveler.firstName}
                                            onChange={(e) =>
                                                handleInputChange(
                                                    traveler.id,
                                                    "firstName",
                                                    e.target.value
                                                )
                                            }
                                            className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Last Name
                                        </label>
                                        <input
                                            type="text"
                                            value={traveler.lastName}
                                            onChange={(e) =>
                                                handleInputChange(
                                                    traveler.id,
                                                    "lastName",
                                                    e.target.value
                                                )
                                            }
                                            className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Date of Birth
                                        </label>
                                        <input
                                            type="date"
                                            value={traveler.dateOfBirth}
                                            onChange={(e) =>
                                                handleInputChange(
                                                    traveler.id,
                                                    "dateOfBirth",
                                                    e.target.value
                                                )
                                            }
                                            className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Nationality
                                        </label>
                                        <select
                                            value={traveler.nationality}
                                            onChange={(e) =>
                                                handleInputChange(traveler.id, "nationality", e.target.value)
                                            }
                                            className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        >
                                            <option value="">Select nationality</option>
                                            {countries.map((country) => (
                                                <option key={country.code} value={country.code}>
                                                    {country.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            value={traveler.email}
                                            onChange={(e) =>
                                                handleInputChange(traveler.id, "email", e.target.value)
                                            }
                                            className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Phone Number
                                        </label>
                                        <input
                                            type="tel"
                                            value={traveler.phone}
                                            onChange={(e) =>
                                                handleInputChange(traveler.id, "phone", e.target.value)
                                            }
                                            className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="border-t border-gray-100 pt-4 mt-4">
                                    <h5 className="font-medium text-gray-800 mb-3 flex items-center">
                                        <FaPassport className="mr-2 text-blue-600" size={18} /> Passport Details
                                    </h5>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Passport Number
                                            </label>
                                            <input
                                                type="text"
                                                value={traveler.passportNumber}
                                                onChange={(e) =>
                                                    handleInputChange(
                                                        traveler.id,
                                                        "passportNumber",
                                                        e.target.value
                                                    )
                                                }
                                                className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Passport Expiry Date
                                            </label>
                                            <input
                                                type="date"
                                                value={traveler.passportExpiry}
                                                onChange={(e) =>
                                                    handleInputChange(
                                                        traveler.id,
                                                        "passportExpiry",
                                                        e.target.value
                                                    )
                                                }
                                                className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        <div className="mt-4">
                            <button
                                onClick={addTraveler}
                                className="text-blue-600 font-medium hover:text-blue-800 flex items-center"
                            >
                                + Add another traveler
                            </button>
                        </div>
                    </div>

                    {/* Payment Section - Basic Card Details */}

                    <PaymentPage
                        currency={currency}
                        amount={parseFloat(flight.pricing.display.amount).toFixed(2)}
                        onPaymentSuccess={handlePaymentSuccess}
                        loading={loading}
                        error={error}
                    />

                    <div className="flex flex-col-reverse sm:flex-row justify-between mt-6">
                        <button
                            onClick={goToPreviousStep}
                            className="mt-3 sm:mt-0 text-blue-600 px-6 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors flex items-center justify-center"
                        >
                            <ArrowLeft size={16} className="mr-2" /> Back to Flight Details
                        </button>
                    </div>

                    {/* Error message */}
                    {error && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start">
                            <AlertCircle className="mr-2 shrink-0 mt-0.5" size={16} />
                            <div>{error}</div>
                        </div>
                    )}
                </section>
            )}

            {/* Step 3: Confirmation */}
            {activeStep === 3 && (
                <section>
                    <div className="bg-white p-4 sm:p-6 rounded-xl border shadow-sm mb-6 text-center">
                        {success ? (
                            <div className="py-6">
                                <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Check size={32} className="text-green-600" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 mb-2">
                                    Booking Confirmed!
                                </h3>
                                <p className="text-gray-600 mb-6">
                                    Your booking has been successfully processed. An email confirmation
                                    has been sent to your email address.
                                </p>

                                <div className="bg-gray-50 p-4 rounded-lg mb-6 mx-auto max-w-lg">
                                    <div className="flex justify-between mb-2">
                                        <span className="text-gray-600">Booking Reference:</span>
                                        <span className="font-semibold">{bookingReferences}</span>
                                    </div>
                                    <div className="flex justify-between mb-2">
                                        <span className="text-gray-600">Flight:</span>
                                        <span className="font-semibold">
                                            {flight.validatingAirlineCodes[0]} {segs[0].number}
                                        </span>
                                    </div>
                                    <div className="flex justify-between mb-2">
                                        <span className="text-gray-600">Route:</span>
                                        <span className="font-semibold">
                                            {dep.iataCode} → {arr.iataCode}
                                        </span>
                                    </div>
                                    <div className="flex justify-between mb-2">
                                        <span className="text-gray-600">Date:</span>
                                        <span className="font-semibold">
                                            {formatDateTime(dep.at).date}
                                        </span>
                                    </div>
                                    <div className="flex justify-between mb-2">
                                        <span className="text-gray-600">Passengers:</span>
                                        <span className="font-semibold">{travelers.length}</span>
                                    </div>
                                    <div className="flex justify-between mb-2">
                                        <span className="text-gray-600">Total Amount:</span>
                                        <span className="font-bold text-blue-700">
                                            {currencyIcons[flight.price.currency] ||
                                                flight.price.currency}{" "}
                                            {parseFloat(flight.pricing.display.amount).toFixed(2)}
                                        </span>
                                    </div>
                                </div>

                                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-6 text-center">
                                    <div className="flex items-center justify-center mb-2">
                                        <Mail size={18} className="text-blue-600 mr-2" />
                                        <span className="text-blue-700 font-medium">
                                            Check your email for detailed itinerary
                                        </span>
                                    </div>
                                </div>

                                <div className="flex justify-center">
                                    <button
                                        onClick={() => navigate("/dashboard")}
                                        className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
                                    >
                                        View My Bookings
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="py-6">
                                <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                                    <Plane size={32} className="text-blue-600" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 mb-2">
                                    Processing Your Booking
                                </h3>
                                <p className="text-gray-600 mb-6">
                                    Please wait while we confirm your booking with the airline...
                                </p>
                                <div className="w-full max-w-md mx-auto h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-600 rounded-full animate-progress"></div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Additional Information */}
                    <div className="bg-white p-4 sm:p-6 rounded-xl border shadow-sm">
                        <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
                            <Shield className="mr-2 text-blue-600" /> Important Information
                        </h3>

                        <div className="space-y-4 text-gray-600">
                            <p>
                                • Please arrive at the airport at least 2 hours before your scheduled
                                departure time for domestic flights and 3 hours for international flights.
                            </p>
                            <p>
                                • Remember to bring valid identification for all passengers (passport for
                                international flights, government-issued ID for domestic flights).
                            </p>
                            <p>
                                • Check airline baggage policies before you travel as additional fees may
                                apply for checked baggage.
                            </p>
                            <p>
                                • You can check in online 24 hours before your flight through the airline's
                                website or mobile app.
                            </p>
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
}