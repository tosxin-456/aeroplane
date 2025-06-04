import React from 'react';
import { Plane, Cloud, MapPin, Luggage, Globe } from 'lucide-react';

const TravelLoader = () => {
    return (
        <div className="fixed inset-0 w-full h-full bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 overflow-hidden">
            {/* Background clouds scattered across entire screen */}
            <div className="absolute inset-0">
                <Cloud className="absolute top-16 left-12 w-16 h-16 text-white opacity-60 animate-pulse"
                    style={{ animationDelay: '0s', animationDuration: '3s' }} />
                <Cloud className="absolute top-32 right-20 w-12 h-12 text-white opacity-40 animate-pulse"
                    style={{ animationDelay: '1s', animationDuration: '4s' }} />
                <Cloud className="absolute top-64 left-1/4 w-14 h-14 text-white opacity-50 animate-pulse"
                    style={{ animationDelay: '2s', animationDuration: '3.5s' }} />
                <Cloud className="absolute bottom-32 right-16 w-18 h-18 text-white opacity-30 animate-pulse"
                    style={{ animationDelay: '0.5s', animationDuration: '4.5s' }} />
                <Cloud className="absolute bottom-48 left-16 w-10 h-10 text-white opacity-45 animate-pulse"
                    style={{ animationDelay: '1.5s', animationDuration: '3.8s' }} />
                <Cloud className="absolute top-48 right-1/3 w-8 h-8 text-white opacity-35 animate-pulse"
                    style={{ animationDelay: '2.5s', animationDuration: '4.2s' }} />
            </div>

            {/* Large circular plane animation */}
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-96 h-96 animate-spin" style={{ animationDuration: '12s' }}>
                    <div className="relative w-full h-full">
                        <Plane className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 w-12 h-12 text-white rotate-90 drop-shadow-lg" />
                    </div>
                </div>
            </div>

            {/* Central loading content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-3xl p-12 border border-white border-opacity-30 shadow-2xl">
                    <div className="flex items-center justify-center mb-6">
                        <Globe className="w-16 h-16 text-white animate-spin drop-shadow-lg" style={{ animationDuration: '4s' }} />
                    </div>

                    <div className="text-center">
                        <h2 className="text-4xl font-bold text-white mb-4 drop-shadow-lg">Finding Your Journey</h2>
                        <p className="text-xl text-white text-opacity-90 mb-8">Searching for the best deals...</p>

                        {/* Animated progress dots */}
                        <div className="flex justify-center space-x-2 mb-8">
                            <div className="w-3 h-3 bg-white rounded-full animate-bounce shadow-lg" style={{ animationDelay: '0s' }}></div>
                            <div className="w-3 h-3 bg-white rounded-full animate-bounce shadow-lg" style={{ animationDelay: '0.2s' }}></div>
                            <div className="w-3 h-3 bg-white rounded-full animate-bounce shadow-lg" style={{ animationDelay: '0.4s' }}></div>
                        </div>

                        {/* Travel icons */}
                        <div className="flex justify-center space-x-8">
                            <div className="animate-pulse" style={{ animationDelay: '0s' }}>
                                <MapPin className="w-8 h-8 text-white opacity-70 drop-shadow-lg" />
                            </div>
                            <div className="animate-pulse" style={{ animationDelay: '0.5s' }}>
                                <Luggage className="w-8 h-8 text-white opacity-70 drop-shadow-lg" />
                            </div>
                            <div className="animate-pulse" style={{ animationDelay: '1s' }}>
                                <Plane className="w-8 h-8 text-white opacity-70 drop-shadow-lg" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Floating travel elements around the screen */}
            <div className="absolute top-12 right-24 animate-bounce" style={{ animationDelay: '1s', animationDuration: '2s' }}>
                <MapPin className="w-8 h-8 text-white opacity-60 drop-shadow-lg" />
            </div>
            <div className="absolute bottom-16 left-20 animate-bounce" style={{ animationDelay: '2s', animationDuration: '2.5s' }}>
                <Luggage className="w-8 h-8 text-white opacity-60 drop-shadow-lg" />
            </div>
            <div className="absolute top-24 left-32 animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '3s' }}>
                <Globe className="w-6 h-6 text-white opacity-50 drop-shadow-lg" />
            </div>
            <div className="absolute bottom-24 right-32 animate-bounce" style={{ animationDelay: '1.5s', animationDuration: '2.8s' }}>
                <Plane className="w-7 h-7 text-white opacity-55 drop-shadow-lg rotate-45" />
            </div>
            <div className="absolute top-1/3 left-8 animate-bounce" style={{ animationDelay: '2.2s', animationDuration: '2.3s' }}>
                <MapPin className="w-5 h-5 text-white opacity-40 drop-shadow-lg" />
            </div>
            <div className="absolute bottom-1/3 right-12 animate-bounce" style={{ animationDelay: '0.8s', animationDuration: '2.7s' }}>
                <Luggage className="w-6 h-6 text-white opacity-45 drop-shadow-lg" />
            </div>
        </div>
    );
};

export default TravelLoader;