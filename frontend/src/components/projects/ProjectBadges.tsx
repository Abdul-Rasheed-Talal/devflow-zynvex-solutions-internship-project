import type { ProjectStatus, ProjectPriority } from '../../types/project';

const STATUS_STYLES: Record<ProjectStatus, string> = {
  planning: 'bg-gray-100 text-gray-700',
  active: 'bg-blue-50 text-blue-700',
  on_hold: 'bg-yellow-50 text-yellow-700',
  completed: 'bg-green-50 text-green-700',
  archived: 'bg-gray-100 text-gray-500',
};

const STATUS_LABELS: Record<ProjectStatus, string> = {
  planning: 'Planning',
  active: 'Active',
  on_hold: 'On Hold',
  completed: 'Completed',
  archived: 'Archived',
};

const PRIORITY_STYLES: Record<ProjectPriority, string> = {
  low: 'bg-gray-100 text-gray-600',
  medium: 'bg-blue-50 text-blue-600',
  high: 'bg-orange-50 text-orange-600',
  urgent: 'bg-red-50 text-red-700',
};

const PRIORITY_LABELS: Record<ProjectPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
};

export function StatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded ${STATUS_STYLES[status] || 'bg-gray-100 text-gray-600'}`}
    >
      {STATUS_LABELS[status] || status}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: ProjectPriority }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded ${PRIORITY_STYLES[priority] || 'bg-gray-100 text-gray-600'}`}
    >
      {PRIORITY_LABELS[priority] || priority}
    </span>
  );
}
