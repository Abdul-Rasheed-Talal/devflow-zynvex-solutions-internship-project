import { Link } from 'react-router-dom';
import { useProjects } from '../../hooks/useProjectQueries';
import { StatusBadge, PriorityBadge } from '../../components/projects/ProjectBadges';
import type { ApiError } from '../../types/auth';

function formatDate(dateStr?: string): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function ProjectsPage() {
  const { data: projects, isLoading, error } = useProjects();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-7 w-32 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-48 bg-gray-100 rounded mt-2 animate-pulse" />
          </div>
          <div className="h-9 w-32 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white border border-gray-200 p-5 rounded animate-pulse">
              <div className="h-5 w-48 bg-gray-200 rounded" />
              <div className="h-4 w-72 bg-gray-100 rounded mt-2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    const apiError = error as ApiError;
    const status = apiError.status;
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-gray-900">Projects</h1>
        <div className="bg-white border border-gray-200 p-8 text-center rounded">
          <p className="text-sm text-red-600">
            {status === 401
              ? 'Your session has expired. Please log in again.'
              : 'Failed to load projects. Please try again.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Projects</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your projects and track progress.
          </p>
        </div>
        <Link
          to="/app/projects/new"
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Create project
        </Link>
      </div>

      {/* Empty state */}
      {(!projects || projects.length === 0) && (
        <div className="bg-white border border-gray-200 p-12 text-center rounded">
          <h3 className="text-sm font-medium text-gray-900">No projects yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            Create your first project to get started.
          </p>
          <Link
            to="/app/projects/new"
            className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Create project
          </Link>
        </div>
      )}

      {/* Project list */}
      {projects && projects.length > 0 && (
        <div className="space-y-3">
          {projects.map((project) => (
            <Link
              key={project._id}
              to={`/app/projects/${project._id}`}
              className="block bg-white border border-gray-200 rounded p-5 hover:border-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-medium text-gray-900 truncate">
                    {project.name}
                  </h3>
                  {project.description && (
                    <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                      {project.description}
                    </p>
                  )}
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-gray-400">
                    {project.dueDate && (
                      <span>Due {formatDate(project.dueDate)}</span>
                    )}
                    {project.startDate && (
                      <span>Started {formatDate(project.startDate)}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <StatusBadge status={project.status} />
                  <PriorityBadge priority={project.priority} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
