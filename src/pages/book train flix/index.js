import React, { useState } from 'react';
import {
  Train,
  Calendar,
  MapPin,
  User,
  ArrowLeft,
  Check,
  AlertCircle,
  Shield,
  Mail,
  Clock,
  Users,
  Wifi,
  Coffee
} from 'lucide-react';

const TrainBookingPage = () => {
  const [activeStep, setActiveStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [bookingReference, setBookingReference] = useState('');
  const [travelers, setTravelers] = useState([
    {
      id: 1,
      title: 'Mr',
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      email: '',
      phone: '',
      idType: 'passport',
      idNumber: ''
    }
  ]);

  // Sample bus data - using mock data since location.state might not be available
  const busData = {
    provider: "Express Rail",
    legs: 2,
    available: { seats: 45 },
    price: {
      total: 89.99,
      total_with_platform_fee: 94.99
    },
    departure: {
      date: "2025-06-15T08:30:00Z",
      city: "New York",
      station: "Penn Station"
    },
    arrival: {
      date: "2025-06-15T14:45:00Z",
      city: "Boston",
      station: "South Station"
    },
    duration: {
      hours: 6,
      minutes: 15
    },
    amenities: ["WiFi", "Power Outlets", "Food Service", "Climate Control"],
    messages: ["Please arrive 30 minutes before departure", "Valid ID required for all passengers"]
  };
  

  const formatDateTime = (dateString) => {
    if (!dateString) return { time: '--:--', date: 'N/A', day: 'N/A' };

    const date = new Date(dateString);
    return {
      time: date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }),
      date: date.toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }),
      day: date.toLocaleDateString('en-US', { weekday: 'long' })
    };
  };

  const formatDuration = (duration) => {
    if (!duration || typeof duration !== 'object') return '0h 0m';
    const hours = duration.hours || 0;
    const minutes = duration.minutes || 0;
    return `${hours}h ${minutes}m`;
  };

  const addTraveler = () => {
    const newTraveler = {
      id: travelers.length + 1,
      title: 'Mr',
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      email: '',
      phone: '',
      idType: 'passport',
      idNumber: ''
    };
    setTravelers([...travelers, newTraveler]);
  };

  const removeTraveler = (id) => {
    if (travelers.length > 1) {
      setTravelers(travelers.filter(t => t.id !== id));
    }
  };

  const handleInputChange = (id, field, value) => {
    setTravelers(travelers.map(t =>
      t.id === id ? { ...t, [field]: value } : t
    ));
  };

  const proceedToNextStep = () => {
    setActiveStep(activeStep + 1);
  };

  const goToPreviousStep = () => {
    setActiveStep(activeStep - 1);
  };

  const handlePaymentSuccess = () => {
    setLoading(true);
    setError('');

    // Simulate booking process
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setBookingReference(`TRN${Math.random().toString(36).substr(2, 9).toUpperCase()}`);
    }, 3000);
  };

  const validateStep2 = () => {
    const isValid = travelers.every(traveler =>
      traveler.firstName &&
      traveler.lastName &&
      traveler.dateOfBirth &&
      traveler.email &&
      traveler.phone &&
      traveler.idNumber
    );

    if (!isValid) {
      setError('Please fill in all required fields for all travelers.');
      return false;
    }

    setError('');
    return true;
  };

  const proceedToPayment = () => {
    if (validateStep2()) {
      setActiveStep(3);
      handlePaymentSuccess();
    }
  };

  const TravelLoader = () => (
    <div className="flex justify-center items-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <span className="ml-3 text-gray-600">Processing your booking...</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 bg-gray-50 rounded-xl sm:rounded-2xl shadow-sm">
        {/* Header Section */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center">
            <Train className="mr-2 sm:mr-3 text-blue-600" /> Book Your Train Journey
          </h2>
          <div className="mt-4 flex items-center">
            <div className={`flex items-center ${activeStep >= 1 ? "text-blue-600" : "text-gray-400"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${activeStep >= 1 ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"
                }`}>
                1
              </div>
              <span className="hidden sm:inline font-medium">Journey Details</span>
            </div>
            <div className="mx-2 sm:mx-4 border-t-2 border-gray-200 w-8 sm:w-16"></div>
            <div className={`flex items-center ${activeStep >= 2 ? "text-blue-600" : "text-gray-400"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${activeStep >= 2 ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"
                }`}>
                2
              </div>
              <span className="hidden sm:inline font-medium">Travelers</span>
            </div>
            <div className="mx-2 sm:mx-4 border-t-2 border-gray-200 w-8 sm:w-16"></div>
            <div className={`flex items-center ${activeStep >= 3 ? "text-blue-600" : "text-gray-400"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${activeStep >= 3 ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"
                }`}>
                3
              </div>
              <span className="hidden sm:inline font-medium">Confirmation</span>
            </div>
          </div>
        </div>

        {loading && <TravelLoader />}

        {/* Step 1: Journey Details */}
        {activeStep === 1 && (
          <section className="mb-6">
            <div className="bg-white p-4 sm:p-6 rounded-xl border shadow-sm mb-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">
                Journey Summary
              </h3>

              {/* Train Journey Card */}
              <div className="border rounded-lg p-4 mb-4 bg-blue-50 border-blue-100">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <Train size={18} className="text-blue-600" />
                    </div>
                    <div>
                      <div className="font-semibold">{busData?.provider || 'N/A'}</div>
                      <div className="text-sm text-gray-500">
                        {busData?.legs || 0} transfers • {busData?.available?.seats || 0} seats available
                      </div>
                    </div>
                  </div>

                  <div className="mt-2 sm:mt-0 flex items-center text-blue-700 font-bold text-xl">
                    <span className="mr-1 text-blue-600">$</span>
                    {busData?.price?.total?.toFixed(2) || '0.00'}
                  </div>
                </div>

                <div className="flex justify-between items-center mb-3">
                  <div className="text-center">
                    <div className="text-lg font-bold">
                      {formatDateTime(busData?.departure?.date).time}
                    </div>
                    <div className="text-sm font-medium">{busData?.departure?.city || 'N/A'}</div>
                    <div className="text-xs text-gray-500">{busData?.departure?.station || 'N/A'}</div>
                  </div>

                  <div className="flex flex-col items-center flex-grow px-4">
                    <div className="text-xs text-gray-500">
                      {formatDuration(busData?.duration)}
                    </div>
                    <div className="relative w-full my-2">
                      <div className="border-t-2 border-gray-300 absolute w-full top-1/2"></div>
                      <Train
                        size={16}
                        className="text-blue-600 absolute top-1/2 left-1/2 transform -translate-y-1/2 -translate-x-1/2"
                      />
                    </div>
                    <div className="text-xs font-medium rounded-full px-2 py-0.5 bg-amber-50 text-amber-700">
                      {busData?.legs || 0} transfers
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="text-lg font-bold">
                      {formatDateTime(busData?.arrival?.date).time}
                    </div>
                    <div className="text-sm font-medium">{busData?.arrival?.city || 'N/A'}</div>
                    <div className="text-xs text-gray-500">{busData?.arrival?.station || 'N/A'}</div>
                  </div>
                </div>

                <div className="flex justify-between text-sm text-gray-500">
                  <div>{formatDateTime(busData?.departure?.date).date}</div>
                  <div>{formatDateTime(busData?.arrival?.date).date}</div>
                </div>
              </div>

              {/* Journey Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div className="flex items-center bg-gray-50 p-3 rounded-lg">
                  <Calendar size={18} className="mr-3 text-blue-500" />
                  <div>
                    <div className="text-sm text-gray-500">Departure Date</div>
                    <div className="font-medium">
                      {formatDateTime(busData?.departure?.date).date}
                    </div>
                  </div>
                </div>

                <div className="flex items-center bg-gray-50 p-3 rounded-lg">
                  <Clock size={18} className="mr-3 text-blue-500" />
                  <div>
                    <div className="text-sm text-gray-500">Journey Time</div>
                    <div className="font-medium">
                      {formatDuration(busData?.duration)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center bg-gray-50 p-3 rounded-lg">
                  <MapPin size={18} className="mr-3 text-blue-500" />
                  <div>
                    <div className="text-sm text-gray-500">Route</div>
                    <div className="font-medium">
                      {busData?.departure?.city || 'N/A'} → {busData?.arrival?.city || 'N/A'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center bg-gray-50 p-3 rounded-lg">
                  <Users size={18} className="mr-3 text-blue-500" />
                  <div>
                    <div className="text-sm text-gray-500">Available Seats</div>
                    <div className="font-medium">{busData?.available?.seats || 0}</div>
                  </div>
                </div>
              </div>

              {/* Amenities */}
              <div className="mb-4">
                <h4 className="font-medium text-gray-800 mb-2">Amenities</h4>
                <div className="flex flex-wrap gap-2">
                  {busData?.amenities && Array.isArray(busData.amenities) ? busData.amenities.map((amenity, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm flex items-center"
                    >
                      {amenity === 'WiFi' && <Wifi size={14} className="mr-1" />}
                      {amenity === 'Power Outlets' && <Coffee size={14} className="mr-1" />}
                      {String(amenity)}
                    </span>
                  )) : (
                    <span className="text-gray-500 text-sm">No amenities listed</span>
                  )}
                </div>
              </div>

              {/* Important Messages */}
              {busData?.messages && Array.isArray(busData.messages) && busData.messages.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                  <div className="flex items-start">
                    <AlertCircle size={16} className="text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
                    <div className="text-sm text-yellow-800">
                      {busData.messages.map((message, index) => (
                        <p key={index}>{String(message)}</p>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Fare Details */}
            <div className="bg-white p-4 sm:p-6 rounded-xl border shadow-sm">
              <h4 className="font-medium text-gray-800 mb-3">Fare Breakdown</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Base Fare</span>
                  <span>${busData?.price?.total?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Platform Fee</span>
                  <span>${((busData?.price?.total_with_platform_fee || 0) - (busData?.price?.total || 0)).toFixed(2)}</span>
                </div>
                <hr className="my-2" />
                <div className="flex items-center justify-between text-lg font-medium">
                  <span>Total</span>
                  <div className="flex items-center">
                    <span className="text-blue-700 font-semibold">
                      ${busData?.price?.total_with_platform_fee?.toFixed(2) || '0.00'}
                    </span>
                  </div>
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
                        First Name *
                      </label>
                      <input
                        type="text"
                        value={traveler.firstName}
                        onChange={(e) =>
                          handleInputChange(traveler.id, "firstName", e.target.value)
                        }
                        className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        value={traveler.lastName}
                        onChange={(e) =>
                          handleInputChange(traveler.id, "lastName", e.target.value)
                        }
                        className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date of Birth *
                      </label>
                      <input
                        type="date"
                        value={traveler.dateOfBirth}
                        onChange={(e) =>
                          handleInputChange(traveler.id, "dateOfBirth", e.target.value)
                        }
                        className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email *
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
                        Phone Number *
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
                      <Shield className="mr-2 text-blue-600" size={18} /> Identification Details
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          ID Type
                        </label>
                        <select
                          value={traveler.idType}
                          onChange={(e) =>
                            handleInputChange(traveler.id, "idType", e.target.value)
                          }
                          className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="passport">Passport</option>
                          <option value="driver_license">Driver's License</option>
                          <option value="national_id">National ID</option>
                          <option value="student_id">Student ID</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          ID Number *
                        </label>
                        <input
                          type="text"
                          value={traveler.idNumber}
                          onChange={(e) =>
                            handleInputChange(traveler.id, "idNumber", e.target.value)
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

            <div className="flex flex-col-reverse sm:flex-row justify-between mt-6">
              <button
                onClick={goToPreviousStep}
                className="mt-3 sm:mt-0 text-blue-600 px-6 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors flex items-center justify-center"
              >
                <ArrowLeft size={16} className="mr-2" /> Back to Journey Details
              </button>

              <button
                onClick={proceedToPayment}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
              >
                Proceed to Payment
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
                    Your train booking has been successfully processed. An email confirmation
                    has been sent to your email address.
                  </p>

                  <div className="bg-gray-50 p-4 rounded-lg mb-6 mx-auto max-w-lg">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Booking Reference:</span>
                      <span className="font-semibold">{bookingReference}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Provider:</span>
                      <span className="font-semibold">{busData?.provider || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Route:</span>
                      <span className="font-semibold">
                        {busData?.departure?.city || 'N/A'} → {busData?.arrival?.city || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Departure:</span>
                      <span className="font-semibold">
                        {formatDateTime(busData?.departure?.date).date}
                      </span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Passengers:</span>
                      <span className="font-semibold">{travelers.length}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Total Amount:</span>
                      <span className="font-bold text-blue-700">
                        ${busData?.price?.total_with_platform_fee?.toFixed(2) || '0.00'}
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
                      onClick={() => window.location.reload()}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
                    >
                      Book Another Journey
                    </button>
                  </div>
                </div>
              ) : (
                <div className="py-6">
                  <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                    <Train size={32} className="text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    Processing Your Booking
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Please wait while we confirm your booking with the transportation provider...
                  </p>
                  <div className="w-full max-w-md mx-auto h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full animate-pulse"></div>
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
                  • Please arrive at the departure station at least 30 minutes before your scheduled departure time.
                </p>
                <p>
                  • Remember to bring valid identification for all passengers as mentioned in the booking requirements.
                </p>
                <p>
                  • Keep your booking confirmation and ID readily available for inspection during the journey.
                </p>
                <p>
                  • Check the latest schedule updates• Check the latest schedule updates and platform changes before departure.
                </p>
                <p>
                  • In case of cancellation or changes, please contact customer service at least 24 hours in advance.
                </p>
                <p>
                  • Baggage restrictions may apply. Please check with your transportation provider for specific guidelines.
                </p>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default TrainBookingPage;