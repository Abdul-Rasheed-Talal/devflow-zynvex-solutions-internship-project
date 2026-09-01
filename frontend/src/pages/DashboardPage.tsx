import { Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useProjects } from '../hooks/useProjectQueries';
import { useGlobalAnalytics } from '../hooks/useAnalyticsQueries';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { isLoading: projectsLoading } = useProjects();
  const { data: analytics, isLoading: analyticsLoading } = useGlobalAnalytics();

  const activeProjectsCount = analytics?.activeProjectsCount || 0;
  const pendingTasksCount = analytics?.pendingTasksCount || 0;
  const overdueTasksCount = analytics?.overdueTasksCount || 0;

  const COLORS = ['#94a3b8', '#3b82f6', '#eab308', '#22c55e'];

  const isLoading = projectsLoading || analyticsLoading;

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
            <p className="mt-2 text-3xl font-semibold text-blue-600">
              {isLoading ? '-' : pendingTasksCount}
            </p>
          </div>
          <div className="mt-4 text-xs text-red-600">
            {isLoading ? '-' : overdueTasksCount} Overdue
          </div>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Status Chart */}
        <div className="bg-white p-6 border border-gray-200 shadow-sm rounded-lg">
          <h3 className="text-sm font-medium text-gray-900 mb-4">Task Status Distribution</h3>
          <div className="h-64">
            {isLoading ? (
              <div className="h-full w-full bg-gray-100 rounded animate-pulse" />
            ) : analytics?.statusChartData && analytics.statusChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.statusChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {analytics.statusChartData.map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-gray-500">
                No tasks available.
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Tasks */}
        <div className="bg-white p-6 border border-gray-200 shadow-sm rounded-lg">
          <h3 className="text-sm font-medium text-gray-900 mb-4">My Upcoming Tasks</h3>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />)}
            </div>
          ) : analytics?.myUpcomingTasks && analytics.myUpcomingTasks.length > 0 ? (
            <ul className="divide-y divide-gray-100">
              {analytics.myUpcomingTasks.map((task) => (
                <li key={task._id} className="py-3 flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{task.title}</p>
                    <p className="text-xs text-gray-500">{task.project.name}</p>
                  </div>
                  <div className="text-xs text-gray-500">
                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="h-48 flex items-center justify-center text-sm text-gray-500">
              No upcoming tasks.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

