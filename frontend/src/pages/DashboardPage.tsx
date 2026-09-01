import { Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useProjects } from '../hooks/useProjectQueries';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { data: projects, isLoading } = useProjects();

  const activeProjectsCount = projects?.filter(
    (p) => p.status !== 'completed' && p.status !== 'archived'
  ).length || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Welcome back, {user?.name?.split(' ')[0] || 'User'}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Here's an overview of your workspace.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 border border-gray-200 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-900">Active Projects</h3>
            <p className="mt-2 text-3xl font-semibold text-blue-600">
              {isLoading ? '-' : activeProjectsCount}
            </p>
          </div>
          <Link to="/app/projects" className="mt-4 text-xs text-blue-600 hover:underline">
            View all projects &rarr;
          </Link>
        </div>

        <div className="bg-white p-6 border border-gray-200 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-900">Pending Tasks</h3>
            <p className="mt-2 text-sm text-gray-500">
              Tasks are managed at the project level.
            </p>
          </div>
          <Link to="/app/projects" className="mt-4 text-xs text-blue-600 hover:underline">
            Select a project &rarr;
          </Link>
        </div>

        {user?.accountType === 'company' && (
          <div className="bg-white p-6 border border-gray-200 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Team Members</h3>
              <p className="mt-2 text-sm text-gray-500">
                Teams are configured per project.
              </p>
            </div>
            <Link to="/app/projects" className="mt-4 text-xs text-blue-600 hover:underline">
              Manage project members &rarr;
            </Link>
          </div>
        )}
      </div>

    </div>
  );
}

