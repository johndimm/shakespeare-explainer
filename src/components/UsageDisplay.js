import { useState, useEffect } from 'react';

export default function UsageDisplay({ user, onUpgrade }) {
  const [usage, setUsage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUsage();
    }
  }, [user]);

  const fetchUsage = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsage(data.usage);
      }
    } catch (error) {
      console.error('Error fetching usage:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpgrade = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/payments/create-checkout-session', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const { url } = await response.json();
        window.location.href = url;
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!usage) return null;

  const isPremium = user.subscription_status === 'premium';
  const usagePercentage = (usage.total_today / usage.daily_limit) * 100;

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold text-gray-900">
          {isPremium ? 'Premium Plan' : 'Free Plan'}
        </h3>
        {!isPremium && (
          <button
            onClick={handleUpgrade}
            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700"
          >
            Upgrade to Premium
          </button>
        )}
      </div>

      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Today's Usage</span>
            <span>{usage.total_today} / {usage.daily_limit}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                usagePercentage > 80 ? 'bg-red-500' : 
                usagePercentage > 60 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(usagePercentage, 100)}%` }}
            ></div>
          </div>
          {usage.is_first_day && (
            <p className="text-xs text-blue-600 mt-1">
              🎉 First day bonus: {usage.daily_limit} interactions!
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Explanations:</span>
            <span className="ml-2 font-medium">{usage.explanations}</span>
          </div>
          <div>
            <span className="text-gray-600">Chat Messages:</span>
            <span className="ml-2 font-medium">{usage.chat_messages}</span>
          </div>
          <div>
            <span className="text-gray-600">File Uploads:</span>
            <span className="ml-2 font-medium">{usage.file_uploads}</span>
          </div>
          <div>
            <span className="text-gray-600">Total All Time:</span>
            <span className="ml-2 font-medium">{usage.total_all_time}</span>
          </div>
        </div>

        {!isPremium && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <h4 className="font-medium text-blue-900 mb-1">Upgrade to Premium</h4>
            <p className="text-sm text-blue-700 mb-2">
              Get unlimited access to all features:
            </p>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• 100 explanations per day</li>
              <li>• 500 chat messages per day</li>
              <li>• 50 file uploads per day</li>
              <li>• Priority support</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
} 