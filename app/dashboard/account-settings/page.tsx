'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sidebar } from '../../components/Sidebar';
import { Eye, EyeOff } from 'lucide-react';

export default function AccountSettingsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: 'Maria',
    lastName: 'Jay',
    email: 'maria@gmail.com',
    password: '••••••••',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar open={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      
      <main className="flex-1" style={{ marginLeft: sidebarOpen ? '256px' : '80px' }}>
        {/* Top user profile */}
        <div className="flex justify-end items-center p-6 bg-white border-b border-gray-200">
          <div className="flex items-center gap-3">
            <img
              src="/diverse-user-avatars.png"
              alt="User"
              className="w-10 h-10 rounded-full"
            />
            <span className="text-gray-700 font-medium">Maria Jay</span>
          </div>
        </div>

        {/* Main content */}
        <div className="relative flex items-center justify-center min-h-[calc(100vh-100px)] p-8">
          {/* Form card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative z-10 w-full max-w-md bg-white rounded-lg shadow-sm p-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
              Edit profile
            </h2>

            {/* Profile picture section */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                <img
                  src="/diverse-user-avatars.png"
                  alt="Profile"
                  className="w-24 h-24 rounded-lg object-cover"
                />
                <div className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-1 border-2 border-white">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* First and Last Name inputs */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <input
                    type="text"
                    name="firstName"
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    name="lastName"
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                  />
                </div>
              </div>

              {/* Email input */}
              <div>
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                />
              </div>

              {/* Password input with toggle */}
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>

              {/* Save button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-8 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-75 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Saving...' : 'Save'}
              </button>
            </form>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
