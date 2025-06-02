const processBookingAndTicketing = async () => {
    try {
        setLoading(true);
        setError(null);

        // Basic validation for card details
        if (!paymentDetails.cardholderName || !paymentDetails.cardNumber ||
            !paymentDetails.expiryMonth || !paymentDetails.expiryYear ||
            !paymentDetails.cvc || !paymentDetails.cardType) {
            throw new Error("Please fill in all payment details");
        }

        const amount = parseFloat(flight?.price?.grandTotal);
        const currency = flight?.price?.currency?.toLowerCase();

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
        // console.log(flightOffer)

        // Format payment details for Amadeus API
        const formattedPaymentDetails = {
            cardNumber: paymentDetails.cardNumber.replace(/\s+/g, ''), // Remove spaces
            expiryDate: `${paymentDetails.expiryYear}-${paymentDetails.expiryMonth}`, // Format as YYYY-MM
            cardType: paymentDetails.cardType,
            cardholderName: paymentDetails.cardholderName,
            cvc: paymentDetails.cvc,
            amount,
            currency
        };

        // Call the new endpoint for booking and ticketing
        const response = await fetch(`${API_BASE_URL}/flights/book`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                flightOffer: flight,
                travelersInfo: formattedTravelers,
                paymentDetails: formattedPaymentDetails,
                // userId: currentUser?.id // If you track logged-in users
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Failed to book and ticket flight");
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