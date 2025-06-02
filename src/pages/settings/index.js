import { useState, useEffect } from 'react';
import { Save, User, Lock, Eye, EyeOff, UserPlus } from 'lucide-react';
import { API_BASE_URL } from '../../config/apiConfig';

export default function BasicSettingsPage() {
    const [profile, setProfile] = useState({
        name: '',
        email: '',
        role: ''
    });

    const [passwords, setPasswords] = useState({
        current: '',
        new: '',
        confirm: ''
    });

    const [newAdmin, setNewAdmin] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'admin',
        profile_image: null
    });


    const [activeTab, setActiveTab] = useState('profile');
    const [toast, setToast] = useState(null);
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false,
        adminPassword: false
    });
    const [isSuperAdmin, setIsSuperAdmin] = useState(false);

    // Load user data from localStorage on component mount
    useEffect(() => {
        const email = localStorage.getItem('email') || 'user@skytravel.com';
        const name = localStorage.getItem('fullName') || 'Guest User';
        const role = localStorage.getItem('adminRole') || 'admin';

        setProfile({
            name,
            email,
            role
        });

        setIsSuperAdmin(role === 'super_admin');
    }, []);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleProfileChange = (key, value) => {
        setProfile({
            ...profile,
            [key]: value
        });
    };

    const handlePasswordChange = (key, value) => {
        setPasswords({
            ...passwords,
            [key]: value
        });
    };

    const handleNewAdminChange = (key, value) => {
        setNewAdmin({
            ...newAdmin,
            [key]: value
        });
    };

    const handleImageUpload = (e) => {
        if (e.target.files && e.target.files[0]) {
            setNewAdmin({
                ...newAdmin,
                profile_image: e.target.files[0]
            });
        }
    };

    const togglePasswordVisibility = (field) => {
        setShowPasswords({
            ...showPasswords,
            [field]: !showPasswords[field]
        });
    };

    const handleProfileSubmit = (e) => {
        e.preventDefault();
        // Save to localStorage
        localStorage.setItem('email', profile.email);
        localStorage.setItem('fullName', profile.name);
        // In a real app, this would also update the profile on a backend
        showToast("Profile updated successfully!");
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        const email = localStorage.getItem('email') || 'user@skytravel.com';

        if (passwords.new !== passwords.confirm) {
            showToast("New passwords don't match!", "error");
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/admin/${email}/password`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ current: passwords.current, updated: passwords.new })
            });

            const data = await response.json();

            if (response.ok) {
                showToast("Password changed successfully!");
                setPasswords({ current: '', new: '', confirm: '' });
            } else {
                showToast(data.message || "Failed to update password.", "error");
            }
        } catch (error) {
            console.error("Password update error:", error);
            showToast("An error occurred. Please try again.", "error");
        }
    };

    const handleNewAdminSubmit = async (e) => {
        e.preventDefault();

        if (newAdmin.password !== newAdmin.confirmPassword) {
            showToast("Passwords don't match!", "error");
            return;
        }

        try {
            // Create FormData for file uploa   // console.log(newAdmin)

            const response = await fetch(`${API_BASE_URL}/admin/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json' // ✅ important!
                },
                body: JSON.stringify({
                    firstName: newAdmin.firstName,
                    lastName: newAdmin.lastName,
                    email: newAdmin.email,
                    password: newAdmin.password,
                    role: newAdmin.role,
                    profile_image:newAdmin.password
                })
            });


            const data = await response.json();

            if (response.ok) {
                showToast("New admin created successfully!");
                // Reset form
                setNewAdmin({
                    firstName: '',
                    lastName: '',
                    email: '',
                    password: '',
                    confirmPassword: '',
                    role: 'admin',
                    profile_image: null
                });
            } else {
                showToast(data.message || "Failed to create admin.", "error");
            }
        } catch (error) {
            console.error("Admin creation error:", error);
            showToast("An error occurred. Please try again.", "error");
        }
    };

    // Get initials for the avatar
    const getInitials = () => {
        if (!profile.name) return 'GU';

        const nameParts = profile.name.split(' ');
        if (nameParts.length === 1) {
            return profile.name.substring(0, 2).toUpperCase();
        }

        return (nameParts[0].charAt(0) + nameParts[1].charAt(0)).toUpperCase();
    };

    // Generate a consistent background color based on the name
    const getAvatarBgColor = () => {
        const colors = [
            'bg-blue-500', 'bg-green-500', 'bg-purple-500',
            'bg-pink-500', 'bg-yellow-500', 'bg-red-500',
            'bg-indigo-500', 'bg-teal-500'
        ];

        const nameHash = profile.name.split('').reduce(
            (acc, char) => acc + char.charCodeAt(0), 0
        );

        return colors[nameHash % colors.length];
    };

    return (
        <div className="p-6 max-w-lg mx-auto bg-white rounded-lg shadow relative">
            {/* Toast Notification */}
            {toast && (
                <div
                    className={`absolute top-4 right-4 p-3 rounded-md shadow-md flex items-center space-x-2 text-sm font-medium transition-opacity duration-300 ${toast.type === 'error'
                            ? 'bg-red-100 text-red-800 border border-red-200'
                            : 'bg-green-100 text-green-800 border border-green-200'
                        }`}
                >
                    <span>{toast.message}</span>
                </div>
            )}

            <div className="flex flex-col items-center mb-6">
                <div className={`w-16 h-16 rounded-full ${getAvatarBgColor()} flex items-center justify-center text-white text-xl font-semibold mb-2`}>
                    {getInitials()}
                </div>
                <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
                {profile.role && (
                    <span className="mt-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                        {profile.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                    </span>
                )}
            </div>

            <div className="mb-6 border-b">
                <div className="flex space-x-4">
                    <button
                        className={`pb-2 px-1 ${activeTab === 'profile' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
                        onClick={() => setActiveTab('profile')}
                    >
                        <div className="flex items-center">
                            <User className="h-4 w-4 mr-2" />
                            Profile
                        </div>
                    </button>
                    <button
                        className={`pb-2 px-1 ${activeTab === 'password' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
                        onClick={() => setActiveTab('password')}
                    >
                        <div className="flex items-center">
                            <Lock className="h-4 w-4 mr-2" />
                            Password
                        </div>
                    </button>
                    {isSuperAdmin && (
                        <button
                            className={`pb-2 px-1 ${activeTab === 'register' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
                            onClick={() => setActiveTab('register')}
                        >
                            <div className="flex items-center">
                                <UserPlus className="h-4 w-4 mr-2" />
                                Add Admin
                            </div>
                        </button>
                    )}
                </div>
            </div>

            {activeTab === 'profile' && (
                <form onSubmit={handleProfileSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-gray-700 mb-1">Full Name</label>
                            <input
                                type="text"
                                value={profile.name}
                                onChange={(e) => handleProfileChange('name', e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none transition-all"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-gray-700 mb-1">Email Address</label>
                            <input
                                type="email"
                                value={profile.email}
                                onChange={(e) => handleProfileChange('email', e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none transition-all"
                                required
                            />
                        </div>

                        <div className="mt-6">
                            <button
                                type="submit"
                                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md flex items-center transition-colors"
                            >
                                <Save className="h-4 w-4 mr-2" />
                                Update Profile
                            </button>
                        </div>
                    </div>
                </form>
            )}

            {activeTab === 'password' && (
                <form onSubmit={handlePasswordSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-gray-700 mb-1">Current Password</label>
                            <div className="relative">
                                <input
                                    type={showPasswords.current ? "text" : "password"}
                                    value={passwords.current}
                                    onChange={(e) => handlePasswordChange('current', e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded-md pr-10 focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none transition-all"
                                    required
                                />
                                <button
                                    type="button"
                                    className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
                                    onClick={() => togglePasswordVisibility('current')}
                                >
                                    {showPasswords.current ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-gray-700 mb-1">New Password</label>
                            <div className="relative">
                                <input
                                    type={showPasswords.new ? "text" : "password"}
                                    value={passwords.new}
                                    onChange={(e) => handlePasswordChange('new', e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded-md pr-10 focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none transition-all"
                                    required
                                />
                                <button
                                    type="button"
                                    className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
                                    onClick={() => togglePasswordVisibility('new')}
                                >
                                    {showPasswords.new ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-gray-700 mb-1">Confirm New Password</label>
                            <div className="relative">
                                <input
                                    type={showPasswords.confirm ? "text" : "password"}
                                    value={passwords.confirm}
                                    onChange={(e) => handlePasswordChange('confirm', e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded-md pr-10 focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none transition-all"
                                    required
                                />
                                <button
                                    type="button"
                                    className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
                                    onClick={() => togglePasswordVisibility('confirm')}
                                >
                                    {showPasswords.confirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>

                        <div className="mt-6">
                            <button
                                type="submit"
                                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md flex items-center transition-colors"
                            >
                                <Save className="h-4 w-4 mr-2" />
                                Change Password
                            </button>
                        </div>
                    </div>
                </form>
            )}

            {activeTab === 'register' && isSuperAdmin && (
                <form onSubmit={handleNewAdminSubmit}>
                    <div className="space-y-4">
                        <div className="flex space-x-3">
                            <div className="flex-1">
                                <label className="block text-gray-700 mb-1">First Name</label>
                                <input
                                    type="text"
                                    value={newAdmin.firstName}
                                    onChange={(e) => handleNewAdminChange('firstName', e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none transition-all"
                                    required
                                />
                            </div>
                            <div className="flex-1">
                                <label className="block text-gray-700 mb-1">Last Name</label>
                                <input
                                    type="text"
                                    value={newAdmin.lastName}
                                    onChange={(e) => handleNewAdminChange('lastName', e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none transition-all"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-gray-700 mb-1">Email Address</label>
                            <input
                                type="email"
                                value={newAdmin.email}
                                onChange={(e) => handleNewAdminChange('email', e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none transition-all"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-gray-700 mb-1">Admin Type</label>
                            <select
                                value={newAdmin.role}
                                onChange={(e) => handleNewAdminChange('role', e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none transition-all"
                            >
                                <option value="admin">Regular Admin</option>
                                <option value="super_admin">Super Admin</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-gray-700 mb-1">Password</label>
                            <div className="relative">
                                <input
                                    type={showPasswords.adminPassword ? "text" : "password"}
                                    value={newAdmin.password}
                                    onChange={(e) => handleNewAdminChange('password', e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded-md pr-10 focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none transition-all"
                                    required
                                />
                                <button
                                    type="button"
                                    className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
                                    onClick={() => togglePasswordVisibility('adminPassword')}
                                >
                                    {showPasswords.adminPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-gray-700 mb-1">Confirm Password</label>
                            <input
                                type="password"
                                value={newAdmin.confirmPassword}
                                onChange={(e) => handleNewAdminChange('confirmPassword', e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none transition-all"
                                required
                            />
                        </div>

                        {/* <div>
                            <label className="block text-gray-700 mb-1">Profile Image (Optional)</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none transition-all"
                            />
                        </div> */}

                        <div className="mt-6">
                            <button
                                type="submit"
                                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md flex items-center transition-colors"
                            >
                                <UserPlus className="h-4 w-4 mr-2" />
                                Create Admin
                            </button>
                        </div>
                    </div>
                </form>
            )}
        </div>
    );
}