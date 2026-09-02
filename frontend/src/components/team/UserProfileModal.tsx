import { TeamMember } from '../../types/team';

interface UserProfileModalProps {
  user: TeamMember | null;
  onClose: () => void;
}

export default function UserProfileModal({ user, onClose }: UserProfileModalProps) {
  if (!user) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="bg-white border border-gray-200 rounded-lg shadow-xl p-5 sm:p-6 w-full max-w-md my-auto relative max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header / Close button */}
        <div className="flex items-start justify-between pb-4 border-b border-gray-100 pr-8">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="h-12 w-12 sm:h-14 sm:w-14 rounded-full object-cover shrink-0 border border-gray-200"
              />
            ) : (
              <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-lg sm:text-xl font-bold shrink-0">
                {user.name ? user.name.charAt(0).toUpperCase() : '?'}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-1.5 truncate">
                <span className="truncate">{user.name}</span>
                {user.accountType === 'company' && (
                  <span className="text-blue-600 shrink-0" title={`Verified Company Account (${user.companyName || 'Corporate'})`}>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </span>
                )}
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 truncate mt-0.5">
                {user.email ? user.email : <span className="italic text-gray-400">Email hidden (Private)</span>}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-300"
            aria-label="Close"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto flex-1 pt-4 space-y-4">
          {user.bio && (
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">About</h3>
              <p className="text-xs sm:text-sm text-gray-700 bg-gray-50 p-3 rounded-md border border-gray-200 whitespace-pre-wrap leading-relaxed">
                {user.bio}
              </p>
            </div>
          )}

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-gray-50 p-3 rounded-md border border-gray-200">
            <div>
              <dt className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">Account Type</dt>
              <dd className="mt-0.5 text-xs sm:text-sm text-gray-900 font-medium capitalize flex items-center gap-1.5 flex-wrap">
                <span>{user.accountType || 'Personal'}</span>
                {user.companyName && (
                  <span className="text-[11px] text-blue-700 bg-blue-100/70 px-1.5 py-0.5 rounded border border-blue-200 truncate max-w-full">
                    {user.companyName}
                  </span>
                )}
              </dd>
            </div>

            {user.projectRole && (
              <div>
                <dt className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">Project Role</dt>
                <dd className="mt-0.5 text-xs sm:text-sm text-gray-900 font-medium capitalize">
                  {user.projectRole}
                </dd>
              </div>
            )}
          </div>

          {/* Skills / Roles */}
          {user.skills && user.skills.length > 0 && (
            <div>
              <h3 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Skills & Expertise</h3>
              <div className="flex flex-wrap gap-1.5">
                {user.skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-5 pt-3 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs sm:text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
