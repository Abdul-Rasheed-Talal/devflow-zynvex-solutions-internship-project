import type { TaskStatus, TaskPriority } from '../../types/task';
import { TASK_STATUSES, TASK_PRIORITIES } from '../../types/task';

interface BadgeProps {
  className?: string;
}

export function TaskStatusBadge({ status, className = '' }: BadgeProps & { status: TaskStatus }) {
  const label = TASK_STATUSES.find((s) => s.value === status)?.label || status;

  const colorClasses = {
    todo: 'bg-gray-100 text-gray-800',
    in_progress: 'bg-blue-100 text-blue-800',
    review: 'bg-yellow-100 text-yellow-800',
    done: 'bg-green-100 text-green-800',
  }[status] || 'bg-gray-100 text-gray-800';

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClasses} ${className}`}>
      {label}
    </span>
  );
}

export function TaskPriorityBadge({ priority, className = '' }: BadgeProps & { priority: TaskPriority }) {
  const label = TASK_PRIORITIES.find((p) => p.value === priority)?.label || priority;

  const colorClasses = {
    low: 'bg-gray-100 text-gray-800',
    medium: 'bg-blue-100 text-blue-800',
    high: 'bg-orange-100 text-orange-800',
    urgent: 'bg-red-100 text-red-800',
  }[priority] || 'bg-gray-100 text-gray-800';

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClasses} ${className}`}>
      {label}
    </span>
  );
}

export function TaskLabelBadge({ label, className = '' }: BadgeProps & { label: string }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200 ${className}`}>
      {label}
    </span>
  );
}
