import type { Task } from '../../types/task';
import { TaskStatusBadge, TaskPriorityBadge } from './TaskBadges';

interface TaskCardProps {
  task: Task;
  onClick?: (task: Task) => void;
}

export default function TaskCard({ task, onClick }: TaskCardProps) {
  return (
    <div
      onClick={() => onClick && onClick(task)}
      className={`bg-white border border-gray-200 rounded p-4 shadow-sm hover:shadow transition-shadow ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="flex justify-between items-start mb-2 gap-4">
        <h3 className="text-sm font-medium text-gray-900 truncate" title={task.title}>
          {task.title}
        </h3>
        <div className="flex flex-col gap-1 items-end shrink-0">
          <TaskPriorityBadge priority={task.priority} />
        </div>
      </div>
      
      {task.description && (
        <p className="text-xs text-gray-500 line-clamp-2 mb-3">
          {task.description}
        </p>
      )}

      <div className="flex items-center justify-between mt-4">
        <TaskStatusBadge status={task.status} />
        
        {task.assignee ? (
          <div className="text-xs text-gray-600 truncate" title={task.assignee.name}>
            {task.assignee.name}
          </div>
        ) : (
          <div className="text-xs text-gray-400 italic">
            Unassigned
          </div>
        )}
      </div>
    </div>
  );
}
