import React, { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import apiClient from '../../lib/apiClient';
import { ApiError } from '../../types/auth';

export default function GitHubCallback() {
  const navigate = useNavigate();
  const location = useLocation();
  const { updateUser } = useAuthStore();
  const hasAttempted = useRef(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const code = params.get('code');

    if (!code) {
      navigate('/login?error=Missing+GitHub+code');
      return;
    }

    if (hasAttempted.current) return;
    hasAttempted.current = true;

    const handleCallback = async () => {
      try {
        const res = await apiClient<{ success: boolean; data: any }>('/auth/github/callback', {
          method: 'POST',
          body: JSON.stringify({ code }),
        });

        if (res.success && res.data) {
          updateUser(res.data);
          // If the user already had a token (linking), they are in the app
          // If they didn't, they are logging in. We just go to /app/dashboard
          navigate('/app/dashboard');
        } else {
          navigate('/login?error=GitHub+authentication+failed');
        }
      } catch (err) {
        const error = err as ApiError;
        console.error('GitHub auth error:', error);
        navigate(`/login?error=${encodeURIComponent(error.message || 'GitHub authentication failed')}`);
      }
    };

    handleCallback();
  }, [location, navigate, updateUser]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Authenticating with GitHub...</h2>
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600"></div>
        <p className="mt-4 text-gray-500">Please wait while we complete the process.</p>
      </div>
    </div>
  );
}
