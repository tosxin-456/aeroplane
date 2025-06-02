import { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { FaTelegramPlane } from 'react-icons/fa';
import { API_BASE_URL } from '../../config/apiConfig';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await fetch(`${API_BASE_URL}/admin/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }

            // Save token to localStorage for future authenticated requests
            localStorage.setItem('token', data.token);
            localStorage.setItem('adminId', data.admin.admin_id);
            localStorage.setItem('adminRole', data.admin.role);
            localStorage.setItem('email', data.admin.email);
            localStorage.setItem('fullName', data.fullName);


            // Navigate to dashboard on successful login
            navigate('/dashboard');

        } catch (error) {
            console.error('Login error:', error);
            setError(error.message || 'Failed to login. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
                {/* Header */}
                <div className="bg-blue-600 p-6 text-center">
                    <h1 className="text-white text-2xl font-bold">Admin Dashboard</h1>
                    <p className="text-blue-100 mt-2">Travel Management System</p>
                </div>

                {/* Form */}
                <div className="p-6 md:p-8">
                    <h2 className="text-xl font-semibold text-gray-800 mb-6">Sign In</h2>

                    {error && (
                        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        {/* Email Field */}
                        <div className="mb-4">
                            <label htmlFor="email" className="block text-gray-700 text-sm font-medium mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail size={18} className="text-gray-500" />
                                </div>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    placeholder="you@example.com"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="mb-6">
                            <label htmlFor="password" className="block text-gray-700 text-sm font-medium mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock size={18} className="text-gray-500" />
                                </div>
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <EyeOff size={18} className="text-gray-500" />
                                    ) : (
                                        <Eye size={18} className="text-gray-500" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Remember Me and Forgot Password */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center">
                                <input
                                    id="remember_me"
                                    type="checkbox"
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label htmlFor="remember_me" className="ml-2 block text-sm text-gray-700">
                                    Remember me
                                </label>
                            </div>
                            <div className="text-sm">
                                <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                                    Forgot password?
                                </a>
                            </div>
                        </div>

                        {/* Submit Button with Icon and Loading State */}
                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-75"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 size={20} className="mr-2 animate-spin" />
                                        Signing In...
                                    </>
                                ) : (
                                    <>
                                        <FaTelegramPlane size={20} className="mr-2" />
                                        Sign In
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}