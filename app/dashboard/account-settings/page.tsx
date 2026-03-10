 'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Menu } from 'lucide-react'
import { UserProfile } from '../../components/UserProfile'
import { motion } from 'framer-motion';
import { Sidebar } from '../../components/Sidebar';
import { Eye, EyeOff, Download, Trash2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext'

export default function AccountSettingsPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const auth = useAuth()
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; type?: "error" | "success" } | null>(null);
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
      setFeedback({ message: 'Passwords do not match', type: 'error' })
      return
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setFeedback({ message: 'Profile updated successfully', type: 'success' })
    }, 800);
  };

  const handleExportData = async () => {
    setIsDownloading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_ROOT}api/users/me/export`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${auth.token}`,
        },
      });

      if (!res.ok) {
        throw new Error('Failed to download data');
      }

      // Get the filename from the response header if available
      const contentDisposition = res.headers.get('content-disposition');
      let filename = 'pay2peer-export.json';
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+?)"?$/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      // Download the JSON
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setFeedback({ message: 'Personal data exported successfully', type: 'success' });
    } catch (err) {
      console.error('Export error:', err);
      setFeedback({ message: `Export failed: ${(err as any)?.message || 'Unknown error'}`, type: 'error' });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_ROOT}api/users/me`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${auth.token}`,
        },
      });

      if (!res.ok) {
        throw new Error('Failed to delete account');
      }

      setFeedback({ message: 'Account deleted successfully. Redirecting...', type: 'success' });
      
      // Clear auth and redirect
      setTimeout(() => {
        auth.logout?.();
        router.push('/');
      }, 1500);
    } catch (err) {
      console.error('Delete error:', err);
      setFeedback({ message: `Delete failed: ${(err as any)?.message || 'Unknown error'}`, type: 'error' });
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar open={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      
      <main className={`flex-1 overflow-auto transition-all duration-300 ${sidebarOpen ? "md:ml-64" : "md:ml-20"} ml-0`}>
        {!sidebarOpen && (
          <button className="md:hidden fixed top-6 left-4 z-50 p-2 bg-white rounded-lg shadow-md" onClick={() => setSidebarOpen(true)}>
            <Menu size={20} />
          </button>
        )}
        <div className="p-8 pt-16 md:pt-8">
          <div className="w-full max-w-4xl mx-auto">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Account settings</h1>
                <p className="text-gray-600">Update your profile and password</p>
              </div>
              <div className="w-64">
                <UserProfile />
              </div>
            </div>

              {/* Main content */}
              <div className="relative flex items-start justify-center min-h-[calc(100vh-120px)] p-8">
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
              {feedback && (
                <div className={`p-4 rounded-lg ${feedback.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
                  {feedback.message}
                </div>
              )}
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

            {/* LOPD/GDPR Options */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Privacy & Data</h3>
              
              {/* Export Data Button */}
              <button
                onClick={handleExportData}
                disabled={isDownloading}
                className="w-full mb-4 py-3 px-4 bg-green-50 hover:bg-green-100 border border-green-300 text-green-700 font-semibold rounded-lg transition-colors disabled:opacity-75 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                {isDownloading ? 'Downloading...' : 'Download My Data'}
              </button>
              <p className="text-sm text-gray-500 mb-6">
                Export all your personal data (profile, transactions, wallets) in JSON format. GDPR Article 20.
              </p>

              {/* Delete Account Button */}
              <button
                onClick={() => setShowDeleteModal(true)}
                className="w-full py-3 px-4 bg-red-50 hover:bg-red-100 border border-red-300 text-red-700 font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 className="w-5 h-5" />
                Delete My Account
              </button>
              <p className="text-sm text-gray-500 mt-2">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
            </div>
          </motion.div>
            </div>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg shadow-lg max-w-md w-full p-8"
            >
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>

              <h3 className="text-xl font-bold text-gray-900 text-center mb-2">Delete Account?</h3>
              <p className="text-gray-600 text-center mb-6">
                This will permanently delete your account and all associated data. Your transactions will be anonymized
                but preserved for blockchain integrity. This action cannot be undone.
              </p>

              <div className="space-y-3">
                <button
                  onClick={handleDeleteAccount}
                  disabled={isLoading}
                  className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-75 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Deleting...' : 'Yes, Delete My Account'}
                </button>

                <button
                  onClick={() => setShowDeleteModal(false)}
                  disabled={isLoading}
                  className="w-full py-3 bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold rounded-lg transition-colors disabled:opacity-75"
                >
                  Cancel
                </button>
              </div>

              <p className="text-xs text-gray-500 text-center mt-6">
                GDPR Article 17 — Right to be forgotten
              </p>
            </motion.div>
          </div>
        )}      </main>
    </div>
  );
}