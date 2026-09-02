import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useProjects } from '../hooks/useProjectQueries';
import { useGlobalAnalytics } from '../hooks/useAnalyticsQueries';
import { useTeamWorkspaces } from '../hooks/useTeamWorkspaceQueries';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { isLoading: projectsLoading } = useProjects();
  const { data: analytics, isLoading: analyticsLoading } = useGlobalAnalytics();
  const { data: teamsData } = useTeamWorkspaces();

  const [taskFilter, setTaskFilter] = useState<'assigned' | 'all'>('assigned');

  const activeProjectsCount = analytics?.activeProjectsCount || 0;
  const pendingTasksCount = analytics?.pendingTasksCount || 0;
  const overdueTasksCount = analytics?.overdueTasksCount || 0;

  const COLORS = ['#64748b', '#2563eb', '#d97706', '#16a34a'];

  const isLoading = projectsLoading || analyticsLoading;

  const myAssignedTasks = analytics?.myUpcomingTasks || [];
  const allOpenTasks = analytics?.allPendingTasks || [];
  const activeTasksList = taskFilter === 'assigned' ? myAssignedTasks : allOpenTasks;

  const formatDueDate = (dateStr?: string) => {
    if (!dateStr) return { text: 'No due date', isOverdue: false, isUrgent: false };
    const due = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { text: `${Math.abs(diffDays)}d overdue`, isOverdue: true, isUrgent: true };
    if (diffDays === 0) return { text: 'Due today', isOverdue: false, isUrgent: true };
    if (diffDays === 1) return { text: 'Due tomorrow', isOverdue: false, isUrgent: true };
    return { text: `Due in ${diffDays}d`, isOverdue: false, isUrgent: false };
  };

  const formatTimeAgo = (dateStr: string) => {
    const d = new Date(dateStr);
    const diffSec = Math.floor((Date.now() - d.getTime()) / 1000);
    if (diffSec < 60) return 'Just now';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    return d.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Header & Primary Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-gray-200">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Overview</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Welcome back, {user?.name || 'User'}. Here is a summary of active work across your workspace.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Link
            to="/app/projects/new"
            className="px-3 py-1.5 bg-gray-900 hover:bg-gray-800 text-white text-xs font-medium rounded transition-colors shadow-sm inline-flex items-center gap-1"
          >
            <span>+</span> New Project
          </Link>
          <Link
            to="/app/projects"
            className="px-3 py-1.5 bg-white hover:bg-gray-50 text-gray-700 text-xs font-medium rounded border border-gray-300 transition-colors"
          >
            All Projects
          </Link>
        </div>
      </div>

      {/* Unified Metrics Container */}
      <div className="bg-white border border-gray-200 rounded-md grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-gray-200 shadow-sm">
        {/* Active Projects */}
        <div className="p-5">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Active Projects</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-semibold text-gray-900 tracking-tight">
              {isLoading ? '-' : activeProjectsCount}
            </span>
            <span className="text-xs text-gray-400">in workspace</span>
          </div>
          <Link to="/app/projects" className="mt-3 inline-flex items-center text-xs font-medium text-blue-600 hover:text-blue-800">
            View all projects &rarr;
          </Link>
        </div>

        {/* Pending Tasks */}
        <div className="p-5">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Pending Tasks</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-semibold text-gray-900 tracking-tight">
              {isLoading ? '-' : pendingTasksCount}
            </span>
            {overdueTasksCount > 0 ? (
              <span className="text-xs font-medium text-red-600">({overdueTasksCount} overdue)</span>
            ) : (
              <span className="text-xs text-gray-400">on track</span>
            )}
          </div>
          <span className="mt-3 block text-xs text-gray-400">
            Across all accessible boards
          </span>
        </div>

        {/* Global Teams */}
        <div className="p-5">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Team Workspaces</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-semibold text-gray-900 tracking-tight">
              {teamsData?.length || 0}
            </span>
            <span className="text-xs text-gray-400">active teams</span>
          </div>
          <Link to="/app/team" className="mt-3 inline-flex items-center text-xs font-medium text-blue-600 hover:text-blue-800">
            Manage teams &rarr;
          </Link>
        </div>
      </div>

      {/* Main Content Grid: Deliverables & Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Deliverables & Tasks (2 cols wide) */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-md shadow-sm overflow-hidden flex flex-col">
          {/* Card Header with standard segmented control */}
          <div className="px-5 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-gray-900">Upcoming Deliverables</h2>
              <p className="text-xs text-gray-500 mt-0.5">Tasks scheduled across your projects.</p>
            </div>

            {/* Filter buttons */}
            <div className="inline-flex bg-gray-100 p-0.5 rounded border border-gray-200 text-xs self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setTaskFilter('assigned')}
                className={`px-3 py-1 rounded transition-colors ${
                  taskFilter === 'assigned'
                    ? 'bg-white text-gray-900 font-medium shadow-xs'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Assigned to me ({myAssignedTasks.length})
              </button>
              <button
                type="button"
                onClick={() => setTaskFilter('all')}
                className={`px-3 py-1 rounded transition-colors ${
                  taskFilter === 'all'
                    ? 'bg-white text-gray-900 font-medium shadow-xs'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                All project tasks ({allOpenTasks.length})
              </button>
            </div>
          </div>

          {/* Task List */}
          <div className="p-5 flex-1 flex flex-col justify-center">
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between p-3 border border-gray-100 rounded animate-pulse">
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-gray-200 rounded w-1/3" />
                      <div className="h-3 bg-gray-100 rounded w-1/4" />
                    </div>
                    <div className="h-5 w-16 bg-gray-100 rounded" />
                  </div>
                ))}
              </div>
            ) : activeTasksList.length > 0 ? (
              <ul className="divide-y divide-gray-100 -my-2">
                {activeTasksList.map((task) => {
                  const dueInfo = formatDueDate(task.dueDate);
                  return (
                    <li key={task._id} className="py-3 flex items-center justify-between gap-4 hover:bg-gray-50/60 px-2 rounded transition-colors">
                      <div className="min-w-0 flex-1">
                        <Link
                          to={`/app/projects/${task.project._id}/tasks`}
                          className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors truncate block"
                        >
                          {task.title}
                        </Link>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-500 font-medium">
                            {task.project.name}
                          </span>
                          {task.status && (
                            <span className="px-1.5 py-0.2 rounded text-[10px] uppercase font-medium bg-gray-100 text-gray-600 border border-gray-200">
                              {task.status.replace('_', ' ')}
                            </span>
                          )}
                          {task.priority && (
                            <span className={`px-1.5 py-0.2 rounded text-[10px] uppercase font-medium border ${
                              task.priority === 'urgent' ? 'bg-red-50 text-red-700 border-red-200' :
                              task.priority === 'high' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                              'bg-gray-50 text-gray-600 border-gray-200'
                            }`}>
                              {task.priority}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className={`text-xs px-2 py-0.5 rounded border ${
                          dueInfo.isOverdue ? 'bg-red-50 text-red-700 border-red-200 font-medium' :
                          dueInfo.isUrgent ? 'bg-amber-50 text-amber-700 border-amber-200' :
                          'text-gray-500 border-gray-200'
                        }`}>
                          {dueInfo.text}
                        </span>
                        <Link
                          to={`/app/projects/${task.project._id}/tasks`}
                          className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Board &rarr;
                        </Link>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="text-center py-10 px-4">
                <h3 className="text-sm font-medium text-gray-900">
                  {taskFilter === 'assigned' ? 'No tasks assigned to you' : 'No open tasks'}
                </h3>
                <p className="mt-1 text-xs text-gray-500 max-w-sm mx-auto">
                  {taskFilter === 'assigned'
                    ? 'Tasks assigned to you on any project Kanban board will appear here.'
                    : 'All tasks across your accessible projects are completed.'}
                </p>
                <div className="mt-4 flex justify-center gap-2.5">
                  {taskFilter === 'assigned' && allOpenTasks.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setTaskFilter('all')}
                      className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded transition-colors"
                    >
                      View all tasks ({allOpenTasks.length})
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => navigate('/app/projects')}
                    className="px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-medium rounded transition-colors"
                  >
                    Open Kanban
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Status Distribution & Live Activity */}
        <div className="space-y-6">
          {/* Status Donut */}
          <div className="bg-white p-5 border border-gray-200 rounded-md shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900 mb-1">Status Distribution</h3>
            <p className="text-xs text-gray-500 mb-4">Breakdown across all projects.</p>
            
            <div className="h-44 relative">
              {isLoading ? (
                <div className="h-full w-full bg-gray-100 rounded animate-pulse" />
              ) : analytics?.statusChartData && analytics.statusChartData.some((d) => d.value > 0) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics.statusChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {analytics.statusChartData.map((_, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-gray-400">
                  No task data recorded.
                </div>
              )}
            </div>

            {/* Legend */}
            <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-gray-100">
              {analytics?.statusChartData?.map((item, idx) => (
                <div key={item.name} className="flex items-center justify-between text-xs py-1 px-1.5 rounded bg-gray-50">
                  <span className="flex items-center gap-1.5 text-gray-600">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                    {item.name}
                  </span>
                  <span className="font-semibold text-gray-900">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity Feed */}
          <div className="bg-white p-5 border border-gray-200 rounded-md shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900 mb-1">Recent Activity</h3>
            <p className="text-xs text-gray-500 mb-3">Latest updates in your workspace.</p>

            {analytics?.recentActivities && analytics.recentActivities.length > 0 ? (
              <ul className="divide-y divide-gray-100 -my-2">
                {analytics.recentActivities.map((act) => (
                  <li key={act._id} className="py-2.5 flex items-start gap-2.5 text-xs">
                    <div className="h-6 w-6 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center font-medium text-[10px] shrink-0 mt-0.5 border border-gray-200">
                      {act.actor?.name ? act.actor.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-gray-900 font-medium truncate">
                        <span className="font-semibold">{act.actor?.name || 'User'}</span> {act.action.replace('_', ' ')}
                      </p>
                      <p className="text-gray-400 text-[11px] mt-0.5">
                        {act.project?.name || 'Project'} • {formatTimeAgo(act.createdAt)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="py-6 text-center text-xs text-gray-400">
                No recent activity recorded.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


