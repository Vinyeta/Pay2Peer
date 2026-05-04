 'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Menu } from 'lucide-react'
import { motion } from 'framer-motion';
import { Sidebar } from '../../components/Sidebar';
import { Eye, EyeOff, Download, Trash2, AlertCircle, ShieldCheck, ShieldOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext'
import Image from 'next/image'

export default function AccountSettingsPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  useEffect(() => { setSidebarOpen(window.innerWidth >= 768) }, [])
  const auth = useAuth()
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; type?: "error" | "success" } | null>(null);

  // 2FA state
  const [twoFaEnabled, setTwoFaEnabled] = useState<boolean>(auth.user?.twoFactorEnabled ?? false);
  const [twoFaQr, setTwoFaQr] = useState<string | null>(null);
  const [twoFaCode, setTwoFaCode] = useState("");
  const [twoFaFeedback, setTwoFaFeedback] = useState<{ message: string; type?: "error" | "success" } | null>(null);
  const [twoFaLoading, setTwoFaLoading] = useState(false);
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

  const handle2FaSetup = async () => {
    setTwoFaLoading(true);
    setTwoFaFeedback(null);
    try {
      const res = await auth.authFetch(`${process.env.NEXT_PUBLIC_API_ROOT}api/auth/2fa/setup`, { method: 'POST' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Setup failed');
      setTwoFaQr(json.qrDataUrl);
    } catch (err) {
      setTwoFaFeedback({ message: (err as any).message, type: 'error' });
    } finally {
      setTwoFaLoading(false);
    }
  };

  const handle2FaVerify = async () => {
    setTwoFaLoading(true);
    setTwoFaFeedback(null);
    try {
      const res = await auth.authFetch(`${process.env.NEXT_PUBLIC_API_ROOT}api/auth/2fa/verify`, {
        method: 'POST',
        body: JSON.stringify({ code: twoFaCode }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Verification failed');
      setTwoFaEnabled(true);
      setTwoFaQr(null);
      setTwoFaCode('');
      setTwoFaFeedback({ message: '2FA enabled successfully', type: 'success' });
    } catch (err) {
      setTwoFaFeedback({ message: (err as any).message, type: 'error' });
    } finally {
      setTwoFaLoading(false);
    }
  };

  const handle2FaDisable = async () => {
    setTwoFaLoading(true);
    setTwoFaFeedback(null);
    try {
      const res = await auth.authFetch(`${process.env.NEXT_PUBLIC_API_ROOT}api/auth/2fa/disable`, {
        method: 'POST',
        body: JSON.stringify({ code: twoFaCode }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Disable failed');
      setTwoFaEnabled(false);
      setTwoFaCode('');
      setTwoFaFeedback({ message: '2FA disabled successfully', type: 'success' });
    } catch (err) {
      setTwoFaFeedback({ message: (err as any).message, type: 'error' });
    } finally {
      setTwoFaLoading(false);
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
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Account settings</h1>
              <p className="text-gray-600">Update your profile and password</p>
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

            {/* 2FA Section */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Two-Factor Authentication</h3>
              <p className="text-sm text-gray-500 mb-6">
                {twoFaEnabled ? 'Your account is protected with 2FA.' : 'Add an extra layer of security to your account.'}
              </p>

              {twoFaFeedback && (
                <div className={`mb-4 p-3 rounded-lg text-sm ${twoFaFeedback.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
                  {twoFaFeedback.message}
                </div>
              )}

              {!twoFaEnabled && !twoFaQr && (
                <button
                  onClick={handle2FaSetup}
                  disabled={twoFaLoading}
                  className="w-full py-3 px-4 bg-blue-50 hover:bg-blue-100 border border-blue-300 text-blue-700 font-semibold rounded-lg transition-colors disabled:opacity-75 flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-5 h-5" />
                  {twoFaLoading ? 'Loading...' : 'Enable 2FA'}
                </button>
              )}

              {!twoFaEnabled && twoFaQr && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.), then enter the 6-digit code to activate 2FA.</p>
                  <div className="flex justify-center">
                    <Image src={twoFaQr} alt="2FA QR Code" width={200} height={200} className="rounded-lg border border-gray-200" unoptimized />
                  </div>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={twoFaCode}
                    onChange={(e) => setTwoFaCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="000000"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg text-center text-2xl tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handle2FaVerify}
                    disabled={twoFaLoading || twoFaCode.length !== 6}
                    className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-75"
                  >
                    {twoFaLoading ? 'Verifying...' : 'Activate 2FA'}
                  </button>
                  <button type="button" onClick={() => { setTwoFaQr(null); setTwoFaCode('') }} className="w-full text-sm text-gray-400 hover:text-gray-600">
                    Cancel
                  </button>
                </div>
              )}

              {twoFaEnabled && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-green-700 bg-green-50 rounded-lg px-4 py-3 border border-green-200">
                    <ShieldCheck className="w-5 h-5 shrink-0" />
                    <span className="text-sm font-medium">2FA is active on your account</span>
                  </div>
                  <p className="text-sm text-gray-500">To disable 2FA, enter your current authenticator code:</p>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={twoFaCode}
                    onChange={(e) => setTwoFaCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="000000"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg text-center text-2xl tracking-widest focus:outline-none focus:ring-2 focus:ring-red-400"
                  />
                  <button
                    onClick={handle2FaDisable}
                    disabled={twoFaLoading || twoFaCode.length !== 6}
                    className="w-full py-3 px-4 bg-red-50 hover:bg-red-100 border border-red-300 text-red-700 font-semibold rounded-lg transition-colors disabled:opacity-75 flex items-center justify-center gap-2"
                  >
                    <ShieldOff className="w-5 h-5" />
                    {twoFaLoading ? 'Disabling...' : 'Disable 2FA'}
                  </button>
                </div>
              )}
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