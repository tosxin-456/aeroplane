import React, { useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { CreditCard, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import { FaDollarSign, FaEuroSign, FaPoundSign, FaRupeeSign, FaYenSign } from 'react-icons/fa';
import { FaNairaSign } from 'react-icons/fa6';

const stripePromise = loadStripe('pk_test_51PYUVCKCg1SdKkQ4yuojVCgQuhdi438gUUspKRJEkRHsyElotNz7Wc4X10a5olQbVZfcWuoxQVZOnLmopXFzYdzg00FNxUOoqT');

const currencyIcons = {
    usd: <FaDollarSign />,
    eur: <FaEuroSign />,
    gbp: <FaPoundSign />,
    ngn: <FaNairaSign />,
    jpy: <FaYenSign />,
    inr: <FaRupeeSign />,
};

const PaymentForm = ({ amount, currency, onPaymentSuccess, loading: externalLoading, error: externalError }) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const stripe = useStripe();
    const elements = useElements();

    const [cardholderName, setCardholderName] = useState('');
    const [email, setEmail] = useState('');

    // Handle external loading and error states
    useEffect(() => {
        if (externalError) {
            setErrorMessage(externalError);
            setPaymentStatus('error');
            setIsProcessing(false);
        }
    }, [externalError]);

    useEffect(() => {
        if (externalLoading !== undefined) {
            setIsProcessing(externalLoading);
        }
    }, [externalLoading]);

    const handleSubmit = async () => {
        if (!stripe || !elements) return;

        setIsProcessing(true);
        setErrorMessage('');
        setPaymentStatus(null);

        const cardElement = elements.getElement(CardElement);

        try {
            const { error, paymentMethod } = await stripe.createPaymentMethod({
                type: 'card',
                card: cardElement,
                billing_details: {
                    name: cardholderName,
                    email: email,
                },
            });

            if (error) {
                setErrorMessage(error.message);
                setPaymentStatus('error');
                setIsProcessing(false);
                return;
            }

            // Simulate successful payment confirmation on frontend
            setTimeout(() => {
                setPaymentStatus('success');
                setIsProcessing(false);

                // Call the onPaymentSuccess callback with payment details
                if (onPaymentSuccess) {
                    onPaymentSuccess({
                        paymentMethodId: paymentMethod.id,
                        amount: amount,
                        currency: currency,
                        customerEmail: email,
                        customerName: cardholderName,
                        timestamp: new Date().toISOString(),
                        status: 'succeeded'
                    });
                }
            }, 1500); // Add a small delay to simulate processing

        } catch (err) {
            const errorMsg = err.message || 'An unexpected error occurred. Please try again.';
            setErrorMessage(errorMsg);
            setPaymentStatus('error');
            setIsProcessing(false);
        }
    };

    const handleRetry = () => {
        setPaymentStatus(null);
        setErrorMessage('');
        setIsProcessing(false);
    };

    const cardElementOptions = {
        style: {
            base: {
                fontSize: '16px',
                color: '#1f2937',
                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                fontSmoothing: 'antialiased',
                '::placeholder': {
                    color: '#9ca3af',
                },
                iconColor: '#6b7280',
            },
            invalid: {
                color: '#ef4444',
                iconColor: '#ef4444',
            },
        },
        hidePostalCode: true,
    };

    if (paymentStatus === 'success') {
        return (
            <div className="text-center p-6">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Payment Successful!</h3>
                <p className="text-gray-600 mb-6">Your payment has been processed successfully.</p>
                <div className="space-y-3">
                    <p className="text-sm text-gray-500">
                        You will be redirected shortly, or you can continue below.
                    </p>
                    <button
                        onClick={handleRetry}
                        className="bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors"
                    >
                        Make Another Payment
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center space-x-3 pb-4 border-b border-gray-200">
                <div className="bg-blue-100 rounded-full p-2">
                    <CreditCard className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">Payment Details</h3>
                    <p className="text-sm text-gray-600 flex items-center">
                        Total: <span className="flex items-center ml-1">
                            {currencyIcons[currency.toLowerCase()] || currency.toUpperCase()}
                            <span className="ml-1">{amount}</span>
                        </span>
                    </p>
                </div>
            </div>

            {/* Error Message */}
            {(paymentStatus === 'error' || errorMessage) && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
                    <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                        <h4 className="text-sm font-medium text-red-800">Payment Error</h4>
                        <p className="text-sm text-red-700 mt-1">{errorMessage}</p>
                    </div>
                </div>
            )}

            {/* Personal Information */}
            <div className="space-y-4">
                <h4 className="text-base font-medium text-gray-900">Billing Information</h4>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                    </label>
                    <input
                        type="email"
                        placeholder="john@example.com"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isProcessing}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cardholder Name
                    </label>
                    <input
                        type="text"
                        placeholder="John Doe"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        required
                        value={cardholderName}
                        onChange={(e) => setCardholderName(e.target.value)}
                        disabled={isProcessing}
                    />
                </div>
            </div>

            {/* Card Information */}
            <div className="space-y-4">
                <h4 className="text-base font-medium text-gray-900">Card Information</h4>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Card Details
                    </label>
                    <div className="border border-gray-300 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-colors">
                        <CardElement options={cardElementOptions} />
                    </div>
                </div>
            </div>

            {/* Security Notice */}
            <div className="bg-gray-50 rounded-lg p-3 flex items-start">
                <Lock className="h-4 w-4 text-gray-500 mt-0.5 mr-2 flex-shrink-0" />
                <p className="text-xs text-gray-600">
                    Your payment information is encrypted and secure.
                </p>
            </div>

            {/* Submit Button */}
            <button
                disabled={!stripe || isProcessing || !email.trim() || !cardholderName.trim()}
                onClick={handleSubmit}
                className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-all duration-200 ${!stripe || isProcessing || !email.trim() || !cardholderName.trim()
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
            >
                {isProcessing ? (
                    <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Processing...
                    </div>
                ) : (
                    <span className="flex items-center justify-center">
                        Pay {currencyIcons[currency.toLowerCase()] || currency.toUpperCase()}
                        <span className="ml-1">{amount}</span>
                    </span>
                )}
            </button>

            {/* Retry Button (shown when there's an error) */}
            {paymentStatus === 'error' && (
                <button
                    onClick={handleRetry}
                    className="w-full py-2 px-4 rounded-lg font-medium text-blue-600 border border-blue-600 hover:bg-blue-50 transition-colors"
                >
                    Try Again
                </button>
            )}

            {/* Terms */}
            <p className="text-xs text-gray-500 text-center">
                By completing this payment, you agree to our Terms of Service and Privacy Policy.
            </p>
        </div>
    );
};

const PaymentPage = ({ amount, currency, onPaymentSuccess, loading, error }) => {
    return (
        <Elements stripe={stripePromise}>
            <PaymentForm
                amount={amount}
                currency={currency}
                onPaymentSuccess={onPaymentSuccess}
                loading={loading}
                error={error}
            />
        </Elements>
    );
};

export default PaymentPage;