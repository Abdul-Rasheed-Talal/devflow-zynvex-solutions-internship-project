
import type { Task, TaskStatus } from '../../types/task';
import { TASK_STATUSES } from '../../types/task';
import KanbanColumn from './KanbanColumn';
import { useUpdateTask } from '../../hooks/useTaskQueries';
import { ApiError } from '../../types/auth';

interface KanbanBoardProps {
  projectId: string;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onError: (msg: string) => void;
}

export default function KanbanBoard({ projectId, tasks, onTaskClick, onError }: KanbanBoardProps) {
  const updateMutation = useUpdateTask(projectId);

  const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
    // Find the current task
    const task = tasks.find(t => t._id === taskId);
    if (!task || task.status === newStatus) return; // Ignore if same status

    // The mutation's onMutate handles optimistic UI update automatically
    updateMutation.mutate(
      { taskId, input: { status: newStatus } },
      {
        onError: (err) => {
          const updateErr = err as ApiError;
          onError(updateErr.message || 'Unable to update task status. Your change was reverted.');
        }
      }
    );
  };

  // Group tasks by status
  const tasksByStatus: Record<TaskStatus, Task[]> = {
    todo: [],
    in_progress: [],
    review: [],
    done: [],
  };

  tasks.forEach(task => {
    if (tasksByStatus[task.status]) {
      tasksByStatus[task.status].push(task);
    }
  });

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 pt-1 snap-x items-stretch h-full">
      {TASK_STATUSES.map(statusObj => (
        <div key={statusObj.value} className="snap-start flex-1 min-w-[280px] sm:min-w-[320px]">
          <KanbanColumn
            status={statusObj.value}
            tasks={tasksByStatus[statusObj.value]}
            onTaskClick={onTaskClick}
            onStatusChange={handleStatusChange}
            onDrop={handleStatusChange}
          />
        </div>
      ))}
    </div>
  );
}
