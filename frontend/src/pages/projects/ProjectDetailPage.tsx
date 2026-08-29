import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useProject, useUpdateProject, useDeleteProject } from '../../hooks/useProjectQueries';
import { StatusBadge, PriorityBadge } from '../../components/projects/ProjectBadges';
import ProjectForm from '../../components/projects/ProjectForm';
import { useAuthStore } from '../../stores/authStore';
import type { UpdateProjectInput } from '../../types/project';
import type { ApiError } from '../../types/auth';

function formatDate(dateStr?: string): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const { data: project, isLoading, error } = useProject(projectId!);
  const updateMutation = useUpdateProject(projectId!);
  const deleteMutation = useDeleteProject();

  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const isOwner = project && user ? project.owner === user.id : false;

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
        <div className="bg-white border border-gray-200 rounded p-6 space-y-4">
          <div className="h-7 w-64 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-96 bg-gray-100 rounded animate-pulse" />
          <div className="h-4 w-48 bg-gray-100 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    const apiErr = error as ApiError;
    const status = apiErr.status;

    if (status === 404) {
      return (
        <div className="space-y-6">
          <Link to="/app/projects" className="text-sm text-blue-600 hover:text-blue-800">
            &larr; Back to projects
          </Link>
          <div className="bg-white border border-gray-200 rounded p-8 text-center">
            <h2 className="text-lg font-medium text-gray-900">Project not found</h2>
            <p className="mt-1 text-sm text-gray-500">
              This project may have been deleted or does not exist.
            </p>
            <Link
              to="/app/projects"
              className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              View all projects
            </Link>
          </div>
        </div>
      );
    }

    if (status === 403) {
      return (
        <div className="space-y-6">
          <Link to="/app/projects" className="text-sm text-blue-600 hover:text-blue-800">
            &larr; Back to projects
          </Link>
          <div className="bg-white border border-gray-200 rounded p-8 text-center">
            <h2 className="text-lg font-medium text-gray-900">Access denied</h2>
            <p className="mt-1 text-sm text-gray-500">
              You do not have permission to view this project.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <Link to="/app/projects" className="text-sm text-blue-600 hover:text-blue-800">
          &larr; Back to projects
        </Link>
        <div className="bg-white border border-gray-200 rounded p-8 text-center">
          <p className="text-sm text-red-600">
            {status === 401
              ? 'Your session has expired. Please log in again.'
              : 'Failed to load project. Please try again.'}
          </p>
        </div>
      </div>
    );
  }

  if (!project) return null;

  // Edit mode
  if (isEditing) {
    function handleUpdate(data: UpdateProjectInput) {
      setApiError(null);
      updateMutation.mutate(data, {
        onSuccess: () => {
          setIsEditing(false);
          setApiError(null);
        },
        onError: (err) => {
          const updateErr = err as ApiError;
          setApiError(updateErr.message || 'Failed to update project.');
        },
      });
    }

    return (
      <div className="space-y-6">
        <Link to="/app/projects" className="text-sm text-blue-600 hover:text-blue-800">
          &larr; Back to projects
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Edit project</h1>
          <p className="mt-1 text-sm text-gray-500">
            Update project details.
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded p-6 max-w-2xl">
          <ProjectForm
            project={project}
            onSubmit={handleUpdate}
            isSubmitting={updateMutation.isPending}
            error={apiError}
          />
        </div>
      </div>
    );
  }

  // Delete handler
  function handleDelete() {
    deleteMutation.mutate(projectId!, {
      onSuccess: () => {
        navigate('/app/projects');
      },
      onError: (err) => {
        const deleteErr = err as ApiError;
        setApiError(deleteErr.message || 'Failed to delete project.');
        setShowDeleteConfirm(false);
      },
    });
  }

  // Detail view
  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Link to="/app/projects" className="text-sm text-blue-600 hover:text-blue-800">
        &larr; Back to projects
      </Link>

      {/* API error banner */}
      {apiError && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded" role="alert">
          {apiError}
        </div>
      )}

      {/* Project header */}
      <div className="bg-white border border-gray-200 rounded p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-semibold text-gray-900">{project.name}</h1>
            {project.description && (
              <p className="mt-2 text-sm text-gray-600 whitespace-pre-wrap">{project.description}</p>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <StatusBadge status={project.status} />
            <PriorityBadge priority={project.priority} />
          </div>
        </div>

        {/* Metadata */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div>
            <dt className="text-gray-500">Start date</dt>
            <dd className="mt-0.5 font-medium text-gray-900">{formatDate(project.startDate)}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Due date</dt>
            <dd className="mt-0.5 font-medium text-gray-900">{formatDate(project.dueDate)}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Created</dt>
            <dd className="mt-0.5 font-medium text-gray-900">{formatDateTime(project.createdAt)}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Last updated</dt>
            <dd className="mt-0.5 font-medium text-gray-900">{formatDateTime(project.updatedAt)}</dd>
          </div>
        </div>

        {/* Actions — only shown if the user is the project owner */}
        {isOwner && (
          <div className="mt-6 pt-4 border-t border-gray-200 flex items-center gap-3">
            <button
              onClick={() => setIsEditing(true)}
              className="px-3 py-1.5 bg-white text-gray-700 text-sm font-medium rounded border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Edit project
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-3 py-1.5 bg-white text-red-600 text-sm font-medium rounded border border-gray-300 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Delete project
            </button>
          </div>
        )}
      </div>

      {/* Delete confirmation dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" role="dialog" aria-modal="true" aria-labelledby="delete-dialog-title">
          <div className="bg-white border border-gray-200 rounded shadow-lg p-6 max-w-sm w-full mx-4">
            <h2 id="delete-dialog-title" className="text-lg font-medium text-gray-900">Delete project</h2>
            <p className="mt-2 text-sm text-gray-600">
              Are you sure you want to delete <strong>{project.name}</strong>? This action cannot be undone.
            </p>
            <div className="mt-4 flex items-center gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleteMutation.isPending}
                className="px-3 py-1.5 bg-white text-gray-700 text-sm font-medium rounded border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="px-3 py-1.5 bg-red-600 text-white text-sm font-medium rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
