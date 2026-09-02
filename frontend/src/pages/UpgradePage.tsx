import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import apiClient from '../lib/apiClient';

export default function UpgradePage() {
  const navigate = useNavigate();
  const user = useAuthStore((state: any) => state.user);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCheckout = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await apiClient<{ url: string }>('/subscriptions/checkout', {
        method: 'POST',
      });
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      setError(err.message || 'Failed to initiate checkout.');
      setIsLoading(false);
    }
  };

  const isEnterprise = user?.accountType === 'company' || user?.email?.toLowerCase() === 'mabdulrasheedtalal@gmail.com';

  if (isEnterprise || user?.subscriptionPlan === 'pro') {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {isEnterprise ? 'You are on the Enterprise Plan' : 'You are currently on the Pro plan'}
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          {isEnterprise
            ? 'Your workspace has active organization-level access to all enterprise features, unlimited teams, broadcasts, and AI tooling.'
            : 'Your workspace has active access to all premium features and AI tooling.'}
        </p>
        <button onClick={() => navigate('/app/settings')} className="text-sm text-blue-600 hover:underline font-medium">
          Return to Settings
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
          Upgrade to DevFlow Pro
        </h1>
        <p className="mt-4 text-xl text-gray-500">
          Unlock the full potential of your team with advanced AI and deep integrations.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
        <div className="p-8 sm:p-10 bg-blue-600 text-white text-center">
          <h3 className="text-2xl font-semibold mb-2">Pro Plan</h3>
          <div className="flex justify-center items-baseline text-5xl font-extrabold">
            $15<span className="text-xl font-medium text-blue-200 ml-1">/month</span>
          </div>
        </div>
        <div className="px-8 py-10 sm:p-10 sm:pb-12 bg-white">
          <h4 className="text-lg font-medium text-gray-900 tracking-wide uppercase mb-8">What's included in Pro</h4>
          <ul className="space-y-6">
            <li className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="ml-3 text-base text-gray-700">
                <strong className="text-gray-900 font-semibold">Unlimited Projects</strong> – No artificial limits. Manage as many projects as your team needs.
              </p>
            </li>
            <li className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="ml-3 text-base text-gray-700">
                <strong className="text-gray-900 font-semibold">AI Project Health Tracker</strong> – Get automated risk analysis, health scores, and actionable recommendations using Gemini AI.
              </p>
            </li>
            <li className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="ml-3 text-base text-gray-700">
                <strong className="text-gray-900 font-semibold">GitHub Live Sync</strong> – Instantly connect repositories to pull issues, PRs, and branch status directly into your workflow.
              </p>
            </li>
            <li className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="ml-3 text-base text-gray-700">
                <strong className="text-gray-900 font-semibold">Advanced Analytics</strong> – Global metrics and velocity charts to track your team's overall performance.
              </p>
            </li>
          </ul>

          {error && (
            <div className="mt-8 bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
              {error}
            </div>
          )}

          <div className="mt-10">
            <button
              onClick={handleCheckout}
              disabled={isLoading}
              className="w-full flex justify-center items-center px-8 py-4 border border-transparent text-lg font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 shadow-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isLoading ? 'Preparing Secure Checkout...' : 'Proceed to Payment ($15/mo)'}
            </button>
            <div className="mt-4 text-center">
              <button onClick={() => navigate(-1)} className="text-sm text-gray-500 hover:text-gray-700">
                Cancel and return
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
