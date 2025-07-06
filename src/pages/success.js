import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function Success() {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Welcome to Premium - Shakespeare Explainer</title>
        <meta name="description" content="Welcome to your Premium subscription" />
      </Head>

      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="mb-6">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome to Premium!
              </h1>
              <p className="text-gray-600">
                Your subscription has been activated successfully.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
              <h2 className="font-semibold text-blue-900 mb-2">Your Premium Benefits:</h2>
              <ul className="text-sm text-blue-700 space-y-1 text-left">
                <li>• 100 explanations per day</li>
                <li>• 500 chat messages per day</li>
                <li>• 50 file uploads per day</li>
                <li>• Priority support</li>
              </ul>
            </div>

            <div className="space-y-3">
              <Link href="/">
                <button className="w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 transition-colors">
                  Start Exploring
                </button>
              </Link>
              
              <Link href="/pricing">
                <button className="w-full bg-gray-200 text-gray-700 py-2 px-6 rounded-md hover:bg-gray-300 transition-colors text-sm">
                  View Account Details
                </button>
              </Link>
            </div>

            <div className="mt-6 text-xs text-gray-500">
              <p>You can manage your subscription anytime from your account settings.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 