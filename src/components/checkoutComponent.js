const { useStripe, useElements, CardElement } = require("@stripe/react-stripe-js");
const { useState } = require("react");

export default function CheckoutForm({ amount, currency, onPaymentSuccess, loading, buttonText = "Pay Now" } ) {
    const stripe = useStripe();
    const elements = useElements();
    const [errorMessage, setErrorMessage] = useState(null);
    const [processing, setProcessing] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setProcessing(true);
        setErrorMessage(null);

        const cardElement = elements.getElement(CardElement);

        const { error, paymentMethod } = await stripe.createPaymentMethod({
            type: 'card',
            card: cardElement,
        });

        if (error) {
            setErrorMessage(error.message);
            setProcessing(false);
        } else {
            onPaymentSuccess(paymentMethod.id);
            setProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Card Details
                </label>
                <div className="p-3 border border-gray-300 rounded-md">
                    <CardElement options={{
                        style: {
                            base: {
                                fontSize: '16px',
                                color: '#32325d',
                                fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
                                '::placeholder': {
                                    color: '#aab7c4',
                                },
                            },
                            invalid: {
                                color: '#fa755a',
                                iconColor: '#fa755a',
                            },
                        },
                    }} />
                </div>
            </div>

            {errorMessage && (
                <div className="mt-2 p-2 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                    {errorMessage}
                </div>
            )}

            <div className="mt-4">
                <button
                    type="submit"
                    disabled={loading || processing}
                    className={`bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-sm flex items-center justify-center w-full mt-4 ${(loading || processing) ? "bg-blue-400 cursor-not-allowed" : "hover:bg-blue-700"
                        }`}
                >
                    {(loading || processing) ? (
                        <>
                            <svg
                                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                ></circle>
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                            </svg>
                            Processing...
                        </>
                    ) : (
                        buttonText
                    )}
                </button>

            </div>
        </form>
    );
};