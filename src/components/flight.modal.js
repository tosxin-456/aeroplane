import React, { useState } from 'react';
import { X, ExternalLink, Plane, CheckCircle } from 'lucide-react';

const FlightCheckinModal = ({ checkinUrl, onClose }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const closeModal = () => {
        if (onClose) {
            onClose();
        }
    };

    const openCheckinLink = () => {
        if (checkinUrl) {
            window.open(checkinUrl, '_blank');
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 transform transition-all">
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-2 rounded-full">
                            <Plane className="w-6 h-6 text-blue-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-800">
                            Check-in Link Ready
                        </h3>
                    </div>
                    <button
                        onClick={closeModal}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Modal Body */}
                <div className="p-6">
                    <div className="mb-6">
                        <p className="text-gray-600 mb-4">
                            Your airline check-in link is ready. Click below to proceed to the airline's check-in page.
                        </p>

                        {checkinUrl && (
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                                <p className="text-sm text-gray-500 mb-1">Check-in URL:</p>
                                <p className="text-sm font-mono text-gray-800 break-all">
                                    {checkinUrl}
                                </p>
                            </div>
                        )}

                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                                <p className="text-sm text-red-600">{error}</p>
                            </div>
                        )}
                    </div>

                    {/* Modal Actions */}
                    <div className="flex gap-3">
                        <button
                            onClick={closeModal}
                            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-lg transition duration-200"
                        >
                            Close
                        </button>
                        <button
                            onClick={openCheckinLink}
                            disabled={!checkinUrl || isLoading}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    Loading...
                                </>
                            ) : (
                                <>
                                    <ExternalLink className="w-4 h-4" />
                                    Open Check-in
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FlightCheckinModal;