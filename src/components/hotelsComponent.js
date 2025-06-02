import { useState } from "react";
import { Star } from "lucide-react";
import { API_BASE_URL } from "../config/apiConfig";

export default function HotelCard({ hotel, checkInDate, checkOutDate, adults }) {
    const [expanded, setExpanded] = useState(false);
    const [loading, setLoading] = useState(false);

    // Extract the hotel data
    const hotelName = hotel.hotel?.name || "Hotel Name";
    const offer = hotel.offers?.[0];
    const bedType = offer?.room?.typeEstimated?.bedType || "Not specified";
    const beds = offer?.room?.typeEstimated?.beds || "Not specified";
    const description = offer?.room?.description?.text || "No description available";
    const price = offer?.price?.total || "N/A";
    const currency = offer?.price?.currency || "USD";
    const isRefundable = offer?.policies?.refundable?.cancellationRefund !== "NON_REFUNDABLE";
    const rating = hotel.hotel?.rating || 4;
    const hotelId = hotel.hotel?.hotelId;

    const bedInfo = `${beds} ${bedType}`;
    const shortDescription = description.split('\n')[0];

    const handleSelectHotel = async () => {
        try {
            setLoading(true);

            const response = await fetch(`${API_BASE_URL}/hotels/rooms`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    hotelId,
                    checkInDate,
                    checkOutDate,
                    adults,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch hotel rooms');
            }

            console.log('Available Rooms:', data.rooms);
            alert(`Fetched ${data.rooms.length} rooms. Check console.`);

        } catch (error) {
            console.error('Error fetching hotel rooms:', error.message);
            alert('Failed to fetch hotel rooms.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="border rounded-lg overflow-hidden shadow-md bg-white hover:shadow-lg transition-shadow duration-300">
            <div className="p-5">
                {/* Hotel Name */}
                <h3 className="font-bold text-xl text-gray-800 mb-2">{hotelName}</h3>

                {/* Star Rating */}
                <div className="flex items-center mb-3">
                    {[...Array(rating)].map((_, i) => (
                        <Star key={i} size={16} className="text-yellow-500 fill-current" />
                    ))}
                    <span className="ml-1 text-sm text-gray-600">{rating}/5</span>
                </div>

                {/* Bed Information */}
                <div className="mb-3 flex items-center">
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                        {bedInfo}
                    </span>
                </div>

                {/* Description with toggle */}
                <div className="mb-4">
                    <p className="text-gray-700 text-sm">
                        {expanded ? description : shortDescription}
                        {description !== shortDescription && (
                            <button
                                className="ml-1 text-blue-600 hover:text-blue-800 font-medium text-sm"
                                onClick={() => setExpanded(!expanded)}
                            >
                                {expanded ? "Show less" : "Show more"}
                            </button>
                        )}
                    </p>
                </div>

                {/* Price and Refund Policy */}
                <div className="flex justify-between items-center mt-4">
                    <div>
                        <p className="font-bold text-lg text-green-600">
                            {currency} {price}
                        </p>
                        <span className={`text-xs ${isRefundable ? "text-green-600" : "text-red-600"} font-medium`}>
                            {isRefundable ? "Refundable" : "Non-Refundable"}
                        </span>
                    </div>

                    <button
                        onClick={handleSelectHotel}
                        className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md text-sm font-medium transition duration-300"
                        disabled={loading}
                    >
                        {loading ? 'Loading...' : 'Select'}
                    </button>
                </div>
            </div>
        </div>
    );
}
