import React, { useState } from 'react';
import { useAnnouncements, useCreateAnnouncement, useDeleteAnnouncement } from '../../hooks/useAnnouncementQueries';
import { useAuthStore } from '../../stores/authStore';

export default function AnnouncementsPage() {
  const { data: announcements, isLoading } = useAnnouncements();
  const createMutation = useCreateAnnouncement();
  const deleteMutation = useDeleteAnnouncement();
  const { user } = useAuthStore();

  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    createMutation.mutate({ message }, {
      onSuccess: () => {
        setMessage('');
        setError(null);
      },
      onError: (err: any) => {
        setError(err.message || 'Failed to create announcement');
      }
    });
  };

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Loading announcements...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Announcements</h1>
        <p className="mt-1 text-sm text-gray-500">
          Company-wide broadcasts and updates.
        </p>
      </div>

      {/* Any authenticated user can post announcements */}
      {user && (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <h2 className="text-sm font-medium text-gray-900 mb-4">Post a new announcement</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-700 text-sm p-3 rounded">{error}</div>
            )}
            <textarea
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                if (error) setError(null);
              }}
              rows={3}
              placeholder="What do you want to share with the team?"
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-3 border"
              required
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={createMutation.isPending || !message.trim()}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {createMutation.isPending ? 'Posting...' : 'Post Announcement'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {announcements?.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-12 text-center text-gray-500">
            No active announcements.
          </div>
        ) : (
          announcements?.map((announcement) => (
            <div key={announcement._id} className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 relative">
              {user?.id === announcement.author._id && (
                <button
                  onClick={() => deleteMutation.mutate(announcement._id)}
                  className="absolute top-4 right-4 text-xs text-gray-400 hover:text-red-600"
                  title="Remove announcement"
                >
                  Remove
                </button>
              )}
              <div className="flex items-center gap-3 mb-4">
                {announcement.author.avatarUrl ? (
                   <img src={announcement.author.avatarUrl} alt="" className="h-10 w-10 rounded-full" />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                    {announcement.author.name.charAt(0)}
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-gray-900 flex items-center gap-1">
                    {announcement.author.name}
                    {announcement.author.accountType === 'company' && (
                      <span className="text-blue-500">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(announcement.createdAt).toLocaleDateString()} at {new Date(announcement.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>
              <div className="text-gray-700 text-sm whitespace-pre-wrap">
                {announcement.message}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
