import { useProjectAnalytics } from '../../hooks/useAnalyticsQueries';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ApiError } from '../../types/auth';

export default function ProjectAnalyticsChart({ projectId }: { projectId: string }) {
  const { data: analytics, isLoading, error } = useProjectAnalytics(projectId);

  if (isLoading) {
    return (
      <div className="bg-white border border-gray-200 rounded p-6">
        <div className="h-64 bg-gray-100 animate-pulse rounded" />
      </div>
    );
  }

  if (error) {
    const err = error as ApiError;
    return (
      <div className="bg-white border border-gray-200 rounded p-6 text-sm text-red-600">
        Failed to load analytics: {err.message}
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="bg-white border border-gray-200 rounded">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-sm font-medium text-gray-900">Project Analytics</h2>
      </div>
      
      <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-gray-50 p-4 rounded text-center">
          <p className="text-sm text-gray-500">Total Tasks</p>
          <p className="text-2xl font-bold text-gray-900">{analytics.totalTasks}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded text-center">
          <p className="text-sm text-gray-500">Completion</p>
          <p className="text-2xl font-bold text-green-600">{analytics.completionPercentage}%</p>
        </div>
        <div className="bg-gray-50 p-4 rounded text-center">
          <p className="text-sm text-gray-500">Overdue Tasks</p>
          <p className="text-2xl font-bold text-red-600">{analytics.overdueCount}</p>
        </div>
      </div>

      <div className="p-6 border-t border-gray-200">
        <h3 className="text-sm font-medium text-gray-900 mb-4">Team Workload (Pending Tasks)</h3>
        <div className="h-72">
          {analytics.workloadChartData && analytics.workloadChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.workloadChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip cursor={{ fill: '#f3f4f6' }} />
                <Bar dataKey="tasks" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-sm text-gray-500">
              No workload data available.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
