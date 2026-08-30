import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask } from '../../hooks/useTaskQueries';
import { useProject, useProjectMembers } from '../../hooks/useProjectQueries';
import TaskCard from '../../components/tasks/TaskCard';
import TaskForm from '../../components/tasks/TaskForm';
import type { Task, CreateTaskInput, UpdateTaskInput } from '../../types/task';
import type { ApiError } from '../../types/auth';

export default function ProjectTasksPage() {
  const { projectId } = useParams<{ projectId: string }>();

  const { data: project, isLoading: isProjectLoading, error: projectError } = useProject(projectId!);
  const { data: membersResponse } = useProjectMembers(projectId!);
  const { data: tasks, isLoading: isTasksLoading, error: tasksError } = useTasks(projectId!);

  const createMutation = useCreateTask(projectId!);
  const updateMutation = useUpdateTask(projectId!);
  const deleteMutation = useDeleteTask(projectId!);

  const [isCreating, setIsCreating] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const projectMembers = membersResponse?.data || [];

  const handleCreate = (data: CreateTaskInput | UpdateTaskInput) => {
    setApiError(null);
    createMutation.mutate(data as CreateTaskInput, {
      onSuccess: () => {
        setIsCreating(false);
      },
      onError: (err) => {
        const createErr = err as ApiError;
        setApiError(createErr.message || 'Failed to create task.');
      },
    });
  };

  const handleUpdate = (data: CreateTaskInput | UpdateTaskInput) => {
    if (!editingTask) return;
    setApiError(null);
    updateMutation.mutate(
      { taskId: editingTask._id, input: data as UpdateTaskInput },
      {
        onSuccess: () => {
          setEditingTask(null);
        },
        onError: (err) => {
          const updateErr = err as ApiError;
          setApiError(updateErr.message || 'Failed to update task.');
        },
      }
    );
  };

  const handleDeleteClick = (task: Task) => {
    setTaskToDelete(task);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (!taskToDelete) return;
    setApiError(null);
    deleteMutation.mutate(taskToDelete._id, {
      onSuccess: () => {
        setShowDeleteConfirm(false);
        setTaskToDelete(null);
        if (editingTask?._id === taskToDelete._id) {
          setEditingTask(null);
        }
      },
      onError: (err) => {
        const delErr = err as ApiError;
        setApiError(delErr.message || 'Failed to delete task.');
        setShowDeleteConfirm(false);
      },
    });
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setTaskToDelete(null);
  };

  // Loading state
  if (isProjectLoading || isTasksLoading) {
    return (
      <div className="space-y-6">
        <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
        <div className="bg-white border border-gray-200 rounded p-6 space-y-4">
          <div className="h-7 w-64 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-96 bg-gray-100 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  // Error state
  if (projectError || tasksError) {
    const apiErr = (projectError || tasksError) as ApiError;
    const status = apiErr.status;

    return (
      <div className="space-y-6">
        <Link to={`/app/projects/${projectId}`} className="text-sm text-blue-600 hover:text-blue-800">
          &larr; Back to project
        </Link>
        <div className="bg-white border border-gray-200 rounded p-8 text-center">
          <h2 className="text-lg font-medium text-gray-900">
            {status === 404 ? 'Project or tasks not found' : status === 403 ? 'Access denied' : 'Error'}
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            {status === 404
              ? 'This project may have been deleted or does not exist.'
              : status === 403
              ? "You don't have access to this project's tasks."
              : 'Failed to load tasks. Please try again.'}
          </p>
        </div>
      </div>
    );
  }

  if (!project) return null;

  return (
    <div className="space-y-6 relative">
      <div className="flex items-center justify-between">
        <div>
          <Link to={`/app/projects/${projectId}`} className="text-sm text-blue-600 hover:text-blue-800">
            &larr; Back to {project.name}
          </Link>
          <h1 className="text-2xl font-semibold text-gray-900 mt-2">Tasks</h1>
        </div>
        {!isCreating && !editingTask && (
          <button
            onClick={() => setIsCreating(true)}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Create Task
          </button>
        )}
      </div>

      {apiError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm" role="alert">
          {apiError}
        </div>
      )}

      {isCreating ? (
        <div className="bg-white border border-gray-200 rounded p-6 max-w-2xl">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Create New Task</h2>
          <TaskForm
            projectMembers={projectMembers}
            onSubmit={handleCreate}
            isSubmitting={createMutation.isPending}
            onCancel={() => setIsCreating(false)}
          />
        </div>
      ) : editingTask ? (
        <div className="bg-white border border-gray-200 rounded p-6 max-w-2xl">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-lg font-medium text-gray-900">Edit Task</h2>
            <button
              onClick={() => handleDeleteClick(editingTask)}
              className="text-red-600 hover:text-red-800 text-sm font-medium"
            >
              Delete
            </button>
          </div>
          <TaskForm
            task={editingTask}
            projectMembers={projectMembers}
            onSubmit={handleUpdate}
            isSubmitting={updateMutation.isPending}
            onCancel={() => setEditingTask(null)}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tasks && tasks.length > 0 ? (
            tasks.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                onClick={setEditingTask}
              />
            ))
          ) : (
            <div className="col-span-full bg-white border border-gray-200 rounded p-8 text-center">
              <h3 className="text-sm font-medium text-gray-900">No tasks</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating a new task.</p>
              <button
                onClick={() => setIsCreating(true)}
                className="mt-4 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700"
              >
                Create Task
              </button>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" role="dialog" aria-modal="true">
          <div className="bg-white border border-gray-200 rounded shadow-lg p-6 max-w-sm w-full mx-4">
            <h2 className="text-lg font-medium text-gray-900">Delete Task</h2>
            <p className="mt-2 text-sm text-gray-600">
              Are you sure you want to delete <strong>{taskToDelete?.title}</strong>? This action cannot be undone.
            </p>
            <div className="mt-4 flex items-center justify-end gap-3">
              <button
                onClick={cancelDelete}
                disabled={deleteMutation.isPending}
                className="px-3 py-1.5 bg-white text-gray-700 text-sm font-medium rounded border border-gray-300 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleteMutation.isPending}
                className="px-3 py-1.5 bg-red-600 text-white text-sm font-medium rounded hover:bg-red-700 disabled:opacity-50"
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
