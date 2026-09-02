import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { userService } from '../services/userService';
import apiClient from '../lib/apiClient';
import { ApiError } from '../types/auth';

export default function SettingsPage() {
  const user = useAuthStore((state: any) => state.user);
  const updateUser = useAuthStore((state: any) => state.updateUser);

  const isEnterprise = user?.accountType === 'company' || user?.email?.toLowerCase() === 'mabdulrasheedtalal@gmail.com';
  const isPro = user?.subscriptionPlan === 'pro' && !isEnterprise;

  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [skills, setSkills] = useState(user?.skills?.join(', ') || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');

  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const hasGitHubAuth = !!import.meta.env.VITE_GITHUB_CLIENT_ID;

  // Check for stripe session_id in URL
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session_id');
    if (sessionId) {
      // Clear the URL to avoid refetching
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Verify session manually
      apiClient<{ success: boolean; data: any }>('/subscriptions/verify-session', {
        method: 'POST',
        body: JSON.stringify({ session_id: sessionId })
      })
      .then(data => {
        if (data.success) {
          updateUser(data.data); // Update global store immediately
          setMessage({ type: 'success', text: 'Subscription updated successfully! Welcome to the Pro plan.' });
        } else {
          setMessage({ type: 'error', text: 'Could not verify payment session.' });
        }
      })
      .catch(() => setMessage({ type: 'error', text: 'Network error during verification.' }));
    }
  }, [updateUser]);

  const handleGitHubLink = () => {
    const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
    if (clientId) {
      window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=repo user:email`;
    } else {
      setMessage({ type: 'error', text: 'GitHub Client ID is not configured in .env' });
      // Scroll to the error message
      window.scrollTo(0, 0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      const skillsArray = skills.split(',').map((s: string) => s.trim()).filter(Boolean);
      const res = await userService.updateProfile({
        name,
        bio,
        skills: skillsArray,
        avatarUrl,
      });
      updateUser(res.data);
      setMessage({ type: 'success', text: 'Profile updated successfully.' });
    } catch (err) {
      const apiError = err as ApiError;
      setMessage({ type: 'error', text: apiError.message || 'Failed to update profile.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Profile Settings
          </h2>
        </div>
      </div>

      <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
        <form onSubmit={handleSubmit} className="space-y-6 px-4 py-5 sm:p-6">
          {message && (
            <div
              className={`p-4 rounded-md ${
                message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
              }`}
            >
              {message.text}
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="name"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
              />
            </div>
          </div>

          <div>
            <label htmlFor="avatarUrl" className="block text-sm font-medium text-gray-700">
              Avatar URL
            </label>
            <div className="mt-1">
              <input
                type="url"
                name="avatarUrl"
                id="avatarUrl"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://example.com/avatar.jpg"
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
              />
            </div>
            {avatarUrl && (
              <div className="mt-2">
                <img src={avatarUrl} alt="Avatar Preview" className="h-16 w-16 rounded-full object-cover border" />
              </div>
            )}
          </div>

          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
              Bio
            </label>
            <div className="mt-1">
              <textarea
                id="bio"
                name="bio"
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border border-gray-300 rounded-md py-2 px-3"
                placeholder="Tell us a bit about yourself"
              />
            </div>
          </div>

          <div>
            <label htmlFor="skills" className="block text-sm font-medium text-gray-700">
              Skills (comma separated)
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="skills"
                id="skills"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="React, Node.js, TypeScript"
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
              />
            </div>
          </div>

          <div className="pt-4 flex items-center gap-4">
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      <div className="mt-8 bg-white border border-gray-200 rounded-lg shadow-sm p-6 max-w-2xl">
        <h2 className="text-lg font-medium text-gray-900 mb-1">Connected Accounts</h2>
        <p className="text-sm text-gray-500 mb-6">Link external services to enhance your experience.</p>

        <div className="flex items-center justify-between py-4 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <svg className="w-6 h-6 text-gray-900" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48A10.019 10.019 0 0022 12c0-5.523-4.477-10-10-10z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-gray-900">GitHub</p>
              <p className="text-xs text-gray-500">
                {user.githubUsername ? `Connected as ${user.githubUsername}` : 'Not connected'}
              </p>
            </div>
          </div>
          {user.githubUsername ? (
            <span className="text-sm font-medium text-green-600 flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              Connected
            </span>
          ) : hasGitHubAuth ? (
            <button
              type="button"
              onClick={handleGitHubLink}
              className="px-3 py-1.5 bg-gray-900 text-white text-sm font-medium rounded hover:bg-gray-800 transition-colors"
            >
              Connect GitHub
            </button>
          ) : (
            <span className="text-sm text-gray-400">OAuth Not Configured</span>
          )}
        </div>
      </div>

      {/* Subscription Settings */}
      <div className="bg-white shadow-sm border border-gray-200 overflow-hidden mt-6">
        <div className="px-6 py-5 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Subscription Plan</h3>
          <p className="mt-1 text-sm text-gray-500">
            Manage your DevFlow plan and billing.
          </p>
        </div>
        <div className="px-6 py-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-gray-900">
                Current Plan:{' '}
                {isEnterprise ? (
                  <span className="uppercase font-bold text-indigo-600">Enterprise</span>
                ) : isPro ? (
                  <span className="uppercase font-bold text-blue-600">Pro</span>
                ) : (
                  <span className="uppercase font-bold text-gray-600">Basic</span>
                )}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {isEnterprise
                  ? 'Your workspace has full Enterprise tier access with unlimited teams, unlimited collaborators, AI Project Health, and company broadcasts.'
                  : isPro
                  ? 'You have access to all premium features, including AI Analysis and advanced global metrics.'
                  : 'Upgrade to the Pro plan to unlock Unlimited Projects, AI Project Health, and GitHub Live Sync.'}
              </p>
            </div>
            {!isEnterprise && !isPro && (
              <Link
                to="/app/upgrade"
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors inline-flex items-center"
              >
                Upgrade to Pro ($15/mo)
              </Link>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
