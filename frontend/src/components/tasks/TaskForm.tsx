import { useState } from 'react';
import type { Task, CreateTaskInput, UpdateTaskInput } from '../../types/task';
import { TASK_STATUSES, TASK_PRIORITIES } from '../../types/task';
import type { ProjectMember, ProjectRole, Project } from '../../types/project';
import CommentList from '../comments/CommentList';
import { useAuthStore } from '../../stores/authStore';

interface TaskFormProps {
  task?: Task;
  project: Project;
  projectMembers: ProjectMember[];
  onSubmit: (data: CreateTaskInput | UpdateTaskInput) => void;
  isSubmitting: boolean;
  error?: string | null;
  onCancel?: () => void;
  readOnly?: boolean;
}

export default function TaskForm({
  task,
  project,
  projectMembers,
  onSubmit,
  isSubmitting,
  error,
  onCancel,
  readOnly = false,
}: TaskFormProps) {
  const { user } = useAuthStore();
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [status, setStatus] = useState(task?.status || 'todo');
  const [priority, setPriority] = useState(task?.priority || 'medium');
  const getAssigneeId = (assignee: any) => {
    if (!assignee) return '';
    if (typeof assignee === 'string') return assignee;
    return assignee._id || assignee.id || '';
  };

  const [assignee, setAssignee] = useState(getAssigneeId(task?.assignee));
  const [labelsInput, setLabelsInput] = useState(task?.labels?.join(', ') || '');
  const [dueDate, setDueDate] = useState(task?.dueDate ? task.dueDate.substring(0, 10) : '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Process labels: split by comma, trim, remove empty strings, and enforce uniqueness
    const parsedLabels = Array.from(new Set(
      labelsInput
        .split(',')
        .map(l => l.trim())
        .filter(l => l.length > 0)
    ));

    const data: CreateTaskInput | UpdateTaskInput = {
      title: title.trim(),
      description: description.trim() || undefined,
      status,
      priority,
      assignee: assignee || null,
      labels: parsedLabels,
      dueDate: dueDate || null,
    };
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm" role="alert">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Task Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="title"
          required
          maxLength={200}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={readOnly}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2 disabled:bg-gray-50 disabled:text-gray-500"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={readOnly}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2 disabled:bg-gray-50 disabled:text-gray-500"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">
            Status
          </label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            disabled={readOnly}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2 bg-white disabled:bg-gray-50 disabled:text-gray-500"
          >
            {TASK_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
            Priority
          </label>
          <select
            id="priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as any)}
            disabled={readOnly}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2 bg-white disabled:bg-gray-50 disabled:text-gray-500"
          >
            {TASK_PRIORITIES.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="assignee" className="block text-sm font-medium text-gray-700">
          Assignee
        </label>
        <select
          id="assignee"
          value={assignee}
          onChange={(e) => setAssignee(e.target.value)}
          disabled={readOnly}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2 bg-white disabled:bg-gray-50 disabled:text-gray-500"
        >
          <option value="">Unassigned</option>
          {/* Project Owner (always an admin, never a viewer) */}
          {project && (
            <option value={(project.owner as any)._id || project.owner}>
              {(project.owner as any).name || 'Project Owner'} ({(project.owner as any).email || 'owner'})
            </option>
          )}
          {projectMembers
            .filter((member) => member.role !== 'viewer')
            .filter((member) => {
              // Ensure we don't duplicate the owner if they happen to be in members list
              const userId = (member.user as any)?._id || member.user?.id || (member as any)?._id || (member as any)?.id;
              const ownerId = (project.owner as any)?._id || project.owner;
              return userId && userId.toString() !== ownerId.toString();
            })
            .map((member) => {
              const userId = (member.user as any)?._id || member.user?.id || (member as any)?._id || (member as any)?.id;
              const userName = member.user?.name || (member as any)?.name || 'Team Member';
              const userEmail = member.user?.email || (member as any)?.email || '';
              return (
                <option key={userId} value={userId}>
                  {userName} {userEmail ? `(${userEmail})` : ''}
                </option>
              );
            })}
        </select>
        <p className="mt-1 text-xs text-gray-500">
          Only active project members and admins can be assigned to tasks. Viewers cannot be assigned.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="labels" className="block text-sm font-medium text-gray-700">
            Labels
          </label>
          <input
            type="text"
            id="labels"
            placeholder="bug, feature, ui..."
            value={labelsInput}
            onChange={(e) => setLabelsInput(e.target.value)}
            disabled={readOnly}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2 disabled:bg-gray-50 disabled:text-gray-500"
          />
          <p className="mt-1 text-xs text-gray-500">Comma-separated</p>
        </div>

        <div>
          <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">
            Due Date
          </label>
          <input
            type="date"
            id="dueDate"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            disabled={readOnly}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2 disabled:bg-gray-50 disabled:text-gray-500"
          />
        </div>
      </div>

      <div className="pt-4 flex justify-end gap-3 border-t border-gray-200 mt-6">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {readOnly ? 'Close' : 'Cancel'}
          </button>
        )}
        {!readOnly && (
          <button
            type="submit"
            disabled={isSubmitting || !title.trim()}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Saving...' : task ? 'Update Task' : 'Create Task'}
          </button>
        )}
      </div>

      {task && (
        <div className="mt-8 pt-8 border-t border-gray-200">
          <CommentList
            taskId={task._id}
            userRole={
              // We infer role from the projectMembers list (if populated) and auth user
              // Note: the user role could also be passed down as a prop for perfect accuracy,
              // but we can compute it if we have the project owner and members.
              // We'll map the current user against projectMembers to find their role.
              // If the task's creator is the owner, or if we have access to the full project context...
              // In this case, `projectMembers` has everyone except the owner if the owner isn't listed as a member.
              // We will rely on getting it from the list.
              // A safer approach: finding the user in `projectMembers`.
              (() => {
                if (!user) return null;
                const member = projectMembers.find(m => {
                  const mId = m.user ? m.user.id : (m as any).id;
                  return mId === user.id;
                });
                // If they are not a member but can see the task, they must be the owner (if project is private).
                // But without project object, we can't definitively check owner.
                // For this component, passing down the exact role is better.
                // Wait, if they can see the task, and readOnly is true, they might be viewer.
                // Let's pass userRole as a prop to TaskForm. If not provided, we extract from projectMembers (assuming member or viewer).
                if (member) return member.role;
                // Fallback: If not readOnly, they likely have edit permissions, assume owner/admin if not in members.
                return readOnly ? 'viewer' : 'owner';
              })() as ProjectRole | null
            }
          />
        </div>
      )}
    </form>
  );
}
