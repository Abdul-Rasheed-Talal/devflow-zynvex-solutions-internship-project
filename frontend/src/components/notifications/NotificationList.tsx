import { Link } from 'react-router-dom';
import { useNotifications, useMarkAsRead, useMarkAllAsRead } from '../../hooks/useNotificationQueries';
import { Notification } from '../../types/notification';

interface NotificationListProps {
  onClose: () => void;
}

export default function NotificationList({ onClose }: NotificationListProps) {
  const { data: response, isLoading, isError } = useNotifications(1);
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();

  const notifications = response?.data || [];
  const unreadCount = response?.meta?.unreadCount || 0;

  const handleNotificationClick = (notif: Notification) => {
    if (!notif.isRead) {
      markAsRead.mutate(notif._id);
    }
    onClose();
  };

  const renderMessage = (notif: Notification) => {
    const actorName = notif.actor?.name || 'Someone';
    const projectName = notif.project?.name || 'a project';
    const teamName = notif.team?.name || 'a team';
    const taskTitle = notif.task?.title || 'a task';

    switch (notif.type) {
      case 'mention':
        return (
          <span>
            <span className="font-semibold text-gray-900">{actorName}</span> mentioned you in a comment on{' '}
            <span className="font-medium text-gray-800">{taskTitle}</span>.
          </span>
        );
      case 'task_assigned':
        return (
          <span>
            <span className="font-semibold text-gray-900">{actorName}</span> assigned you to{' '}
            <span className="font-medium text-gray-800">{taskTitle}</span> in {projectName}.
          </span>
        );
      case 'task_updated':
        return (
          <span>
            <span className="font-semibold text-gray-900">{actorName}</span> updated your assigned task{' '}
            <span className="font-medium text-gray-800">{taskTitle}</span>.
          </span>
        );
      case 'team_added':
        return (
          <span>
            <span className="font-semibold text-gray-900">{actorName}</span> added you to the team{' '}
            <span className="font-medium text-gray-800">{teamName}</span>.
          </span>
        );
      case 'project_added':
        return (
          <span>
            <span className="font-semibold text-gray-900">{actorName}</span> added you as a collaborator to{' '}
            <span className="font-medium text-gray-800">{projectName}</span>.
          </span>
        );
      default:
        return <span>You have a new update from {actorName}.</span>;
    }
  };

  const getTargetUrl = (notif: Notification) => {
    if (notif.type === 'team_added') {
      return '/app/team';
    }
    if (notif.project?._id) {
      if (notif.type === 'project_added') {
        return `/app/projects/${notif.project._id}`;
      }
      const taskId = notif.type === 'mention' && notif.comment ? notif.comment.task : notif.referenceId;
      return taskId 
        ? `/app/projects/${notif.project._id}/tasks?taskId=${taskId}`
        : `/app/projects/${notif.project._id}`;
    }
    return '/app/dashboard';
  };

  return (
    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-xl border border-gray-100 z-50 overflow-hidden flex flex-col max-h-[80vh]">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/50">
        <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
        {unreadCount > 0 && (
          <button
            onClick={() => markAllAsRead.mutate()}
            disabled={markAllAsRead.isPending}
            className="text-xs font-medium text-blue-600 hover:text-blue-700 disabled:opacity-50"
          >
            Mark all read
          </button>
        )}
      </div>

      <div className="overflow-y-auto flex-1 p-2">
        {isLoading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        )}

        {isError && (
          <div className="text-center py-6 text-sm text-red-500">Failed to load notifications.</div>
        )}

        {!isLoading && !isError && notifications.length === 0 && (
          <div className="text-center py-10 px-4">
            <div className="mx-auto h-12 w-12 rounded-full bg-gray-50 flex items-center justify-center mb-3">
              <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-sm text-gray-500 font-medium">You're all caught up!</p>
          </div>
        )}

        {!isLoading && !isError && notifications.length > 0 && (
          <div className="space-y-1">
            {notifications.map((notif) => (
              <Link
                key={notif._id}
                to={getTargetUrl(notif)}
                onClick={() => handleNotificationClick(notif)}
                className={`block p-3 rounded-md transition-colors duration-150 ${
                  notif.isRead ? 'bg-white hover:bg-gray-50' : 'bg-blue-50/50 hover:bg-blue-50'
                }`}
              >
                <div className="flex gap-3">
                  <div className="flex-shrink-0 pt-1">
                    {!notif.isRead && <div className="w-2 h-2 rounded-full bg-blue-600"></div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${notif.isRead ? 'text-gray-600' : 'text-gray-900 font-medium'}`}>
                      {renderMessage(notif)}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(notif.createdAt).toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
