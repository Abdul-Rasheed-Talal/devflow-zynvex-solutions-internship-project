import { useProjectActivity } from '../../hooks/useActivityQueries';
import type { ApiError } from '../../types/auth';

interface ActivityFeedProps {
  projectId: string;
}

export default function ActivityFeed({ projectId }: ActivityFeedProps) {
  const { data: activities, isLoading, error } = useProjectActivity(projectId);

  if (isLoading) {
    return (
      <div className="space-y-4 mt-6 border-t border-gray-200 pt-6">
        <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
        <div className="space-y-3 pl-4 border-l-2 border-gray-100">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col gap-2 relative">
              <div className="absolute -left-[21px] top-1 h-2 w-2 rounded-full bg-gray-200" />
              <div className="h-4 w-64 bg-gray-200 rounded animate-pulse" />
              <div className="h-3 w-24 bg-gray-100 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    const apiErr = error as ApiError;
    // Don't show the whole feed box if it's 403, just hide it gracefully or show a tiny note
    if (apiErr.status === 403) {
      return null;
    }
    return (
      <div className="mt-6 border-t border-gray-200 pt-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Project Activity</h2>
        <div className="bg-red-50 border border-red-200 p-4 rounded text-sm text-red-700">
          Failed to load project activity.
        </div>
      </div>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <div className="mt-6 border-t border-gray-200 pt-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Project Activity</h2>
        <div className="bg-gray-50 border border-gray-200 border-dashed rounded p-6 text-center text-sm text-gray-500">
          No activity yet.
        </div>
      </div>
    );
  }

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString(undefined, {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const getActionText = (action: string) => {
    const normalized = action.replace(/_/g, ' ');
    // basic capitalization
    return normalized.charAt(0).toUpperCase() + normalized.slice(1);
  };

  return (
    <div className="mt-6 border-t border-gray-200 pt-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Project Activity</h2>
      <div className="relative pl-4 border-l-2 border-gray-200 space-y-6">
        {activities.map((activity) => (
          <div key={activity._id} className="relative">
            <div className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full bg-blue-500 ring-4 ring-white" />
            <div className="text-sm">
              <span className="font-medium text-gray-900">{activity.actor.name}</span>{' '}
              <span className="text-gray-600">{getActionText(activity.action).toLowerCase()}</span>
              {activity.task && (
                <>
                  {' '}on task <span className="font-medium text-gray-700">"{activity.task.title}"</span>
                </>
              )}
            </div>
            <div className="mt-1 text-xs text-gray-500">
              {formatDateTime(activity.createdAt)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
