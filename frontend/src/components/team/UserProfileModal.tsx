import React from 'react';
import { TeamMember } from '../../types/team';

interface UserProfileModalProps {
  user: TeamMember | null;
  onClose: () => void;
}

export default function UserProfileModal({ user, onClose }: UserProfileModalProps) {
  if (!user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" role="dialog" aria-modal="true">
      <div className="bg-white border border-gray-200 rounded-lg shadow-xl p-6 max-w-md w-full mx-4 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 focus:outline-none"
        >
          <span className="sr-only">Close</span>
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex flex-col items-center text-center mt-2">
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt={user.name} className="h-20 w-20 rounded-full object-cover border-2 border-white shadow-sm" />
          ) : (
            <div className="h-20 w-20 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-2xl font-bold shadow-sm">
              {user.name.charAt(0).toUpperCase()}
            </div>
          )}

          <h2 className="mt-4 text-xl font-semibold text-gray-900 flex items-center gap-2">
            {user.name}
            {user.accountType === 'company' && (
              <span className="text-blue-500" title="Verified Company Account">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </span>
            )}
          </h2>
          <p className="text-sm text-gray-500">{user.email}</p>

          {user.accountType === 'company' && (
            <span className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Company / Workspace
            </span>
          )}

          {user.bio && (
            <p className="mt-4 text-sm text-gray-600 px-4 py-2 bg-gray-50 rounded-md w-full border border-gray-100 text-left">
              {user.bio}
            </p>
          )}

          {user.skills && user.skills.length > 0 && (
            <div className="mt-4 w-full">
              <h3 className="text-xs font-medium text-gray-500 text-left uppercase tracking-wider mb-2">Skills / Roles</h3>
              <div className="flex flex-wrap gap-2">
                {user.skills.map(skill => (
                  <span key={skill} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
