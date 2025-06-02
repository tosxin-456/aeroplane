import { useState, useEffect } from 'react';
import { FiDollarSign, FiCreditCard, FiCheckCircle, FiAlertCircle, FiFilter, FiCalendar, FiSearch, FiBarChart2, FiTrendingUp, FiActivity } from 'react-icons/fi';

const { API_BASE_URL } = require("../../config/apiConfig");

export default function PaymentPage() {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortOrder, setSortOrder] = useState('desc');

    useEffect(() => {
        const fetchPayments = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${API_BASE_URL}/payments`);

                if (!response.ok) {
                    throw new Error('Failed to fetch payments');
                }

                const result = await response.json();
                if (result.success && Array.isArray(result.data)) {
                    setPayments(result.data);
                } else {
                    throw new Error('Invalid data format received');
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchPayments();
    }, []);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatCurrency = (amount, currency) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency.toUpperCase()
        }).format(amount);
    };

    const getPaymentMethodIcon = (method) => {
        switch (method) {
            case 'card':
                return <FiCreditCard className="text-blue-500" />;
            default:
                return <FiDollarSign className="text-green-500" />;
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'successful':
                return (
                    <span className="flex items-center px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                        <FiCheckCircle className="mr-1" /> Successful
                    </span>
                );
            case 'failed':
                return (
                    <span className="flex items-center px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                        <FiAlertCircle className="mr-1" /> Failed
                    </span>
                );
            case 'pending':
                return (
                    <span className="flex items-center px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                        <FiAlertCircle className="mr-1" /> Pending
                    </span>
                );
            default:
                return (
                    <span className="flex items-center px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                        {status}
                    </span>
                );
        }
    };

    const filteredPayments = payments
        .filter(payment =>
            (statusFilter === 'all' || payment.status === statusFilter) &&
            (searchTerm === '' ||
                payment.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
                payment.payment_id.toString().includes(searchTerm))
        )
        .sort((a, b) => {
            const dateA = new Date(a.createdAt);
            const dateB = new Date(b.createdAt);
            return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
        });

    const parseMetadata = (metadataString) => {
        try {
            const metadata = JSON.parse(metadataString);
            return metadata;
        } catch (e) {
            return { error: "Could not parse metadata" };
        }
    };

    const totalPayments = payments.length;
    const successfulPayments = payments.filter(p => p.status === 'successful').length;
    const pendingPayments = payments.filter(p => p.status === 'pending').length;
    const failedPayments = payments.filter(p => p.status === 'failed').length;
    const totalVolume = payments.reduce((sum, payment) => sum + parseFloat(payment.amount), 0);
    const currency = payments.length > 0 ? payments[0].currency : 'usd';
    const successRate = totalPayments > 0 ? ((successfulPayments / totalPayments) * 100).toFixed(1) : 0;

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-t-blue-500 border-b-blue-500 rounded-full animate-spin"></div>
                    <p className="mt-4 text-gray-600">Loading payments...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                <div className="flex">
                    <FiAlertCircle className="w-5 h-5 text-red-500" />
                    <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">Error loading payments</h3>
                        <p className="mt-2 text-sm text-red-700">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Payment Management</h1>
                <p className="mt-2 text-gray-600">View and manage all payment transactions</p>
            </div>

            {/* Statistics Section - Now at the top */}
            <div className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
                    <div className="flex items-center">
                        <div className="bg-blue-100 p-3 rounded-full">
                            <FiBarChart2 className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Total Payments</p>
                            <p className="text-xl font-semibold text-gray-900">{totalPayments}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
                    <div className="flex items-center">
                        <div className="bg-green-100 p-3 rounded-full">
                            <FiCheckCircle className="h-6 w-6 text-green-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Successful Payments</p>
                            <div className="flex items-center">
                                <p className="text-xl font-semibold text-gray-900">{successfulPayments}</p>
                                <span className="ml-2 text-sm text-green-600">({successRate}%)</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
                    <div className="flex items-center">
                        <div className="bg-purple-100 p-3 rounded-full">
                            <FiTrendingUp className="h-6 w-6 text-purple-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Total Volume</p>
                            <p className="text-xl font-semibold text-gray-900">{formatCurrency(totalVolume, currency)}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6 border-l-4 border-amber-500">
                    <div className="flex items-center">
                        <div className="bg-amber-100 p-3 rounded-full">
                            <FiActivity className="h-6 w-6 text-amber-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Status Breakdown</p>
                            <div className="mt-1 text-sm">
                                <div className="flex items-center mb-1">
                                    <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                                    <span className="text-gray-700">Success: {successfulPayments}</span>
                                </div>
                                <div className="flex items-center mb-1">
                                    <div className="w-2 h-2 rounded-full bg-yellow-500 mr-2"></div>
                                    <span className="text-gray-700">Pending: {pendingPayments}</span>
                                </div>
                                <div className="flex items-center">
                                    <div className="w-2 h-2 rounded-full bg-red-500 mr-2"></div>
                                    <span className="text-gray-700">Failed: {failedPayments}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mb-6 bg-white rounded-lg shadow p-6">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="relative flex-grow">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <FiSearch className="text-gray-500" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search by reference or payment ID"
                            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <FiFilter className="text-gray-500" />
                            </div>
                            <select
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="all">All Statuses</option>
                                <option value="successful">Successful</option>
                                <option value="pending">Pending</option>
                                <option value="failed">Failed</option>
                            </select>
                        </div>

                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <FiCalendar className="text-gray-500" />
                            </div>
                            <select
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                value={sortOrder}
                                onChange={(e) => setSortOrder(e.target.value)}
                            >
                                <option value="desc">Newest First</option>
                                <option value="asc">Oldest First</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {filteredPayments.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-6 text-center">
                    <p className="text-gray-600">No payments found matching your filters.</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white rounded-lg shadow">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredPayments.map((payment) => {
                                const metadata = parseMetadata(payment.metadata);

                                return (
                                    <tr key={payment.payment_id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{payment.payment_id}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {formatCurrency(payment.amount, payment.currency)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <div className="flex items-center">
                                                {getPaymentMethodIcon(payment.paymentMethod)}
                                                <span className="ml-2 capitalize">{payment.paymentMethod}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(payment.status)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <span className="font-mono">{payment.reference}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {formatDate(payment.createdAt)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <button
                                                className="text-blue-600 hover:text-blue-800"
                                                onClick={() => alert(`Payment Details:\n${JSON.stringify(metadata, null, 2)}`)}
                                            >
                                                View Details
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}