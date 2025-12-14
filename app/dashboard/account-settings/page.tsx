'use client';

import { useState } from 'react';
import { UserProfile } from '../../components/UserProfile'
import { motion } from 'framer-motion';
import { Sidebar } from '../../components/Sidebar';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext'

export default function AccountSettingsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const auth = useAuth()
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: auth.user?.email ?? '',
    password: '',
    verifyPassword: '',
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
    // basic validation: passwords must match
    if (formData.password !== formData.verifyPassword) {
      alert('Passwords do not match')
      return
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      alert('Saved')
    }, 800);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar open={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      
      <main className="flex-1" style={{ marginLeft: sidebarOpen ? '256px' : '80px' }}>
        {/* Top user profile */}
        <div className="flex justify-end items-center p-6 bg-white border-b border-gray-200">
          <div className="w-64">
            <UserProfile />
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

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email input */}
              <div>
                <input
                  type="email"
                  name="email"
                  placeholder={auth.user?.email ?? 'Email'}
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                />
              </div>

              {/* Password input with toggle */}
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="New password"
                  value={formData.password}
                  onChange={handleChange}
                  required
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

              {/* Verify password */}
              <div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="verifyPassword"
                  placeholder="Verify password"
                  value={formData.verifyPassword}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                />
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
