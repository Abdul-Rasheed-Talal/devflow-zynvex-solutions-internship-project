import { useAuthStore } from '../stores/authStore';

export default function DashboardPage() {
  const { user } = useAuthStore();

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
        {/* Placeholder cards for future data */}
        <div className="bg-white p-6 border border-gray-200 shadow-sm">
          <h3 className="text-sm font-medium text-gray-900">Active Projects</h3>
          <p className="mt-2 text-3xl font-semibold text-blue-600">0</p>
          <p className="mt-1 text-xs text-gray-500">Feature coming in Module 2</p>
        </div>

        <div className="bg-white p-6 border border-gray-200 shadow-sm">
          <h3 className="text-sm font-medium text-gray-900">Pending Tasks</h3>
          <p className="mt-2 text-3xl font-semibold text-blue-600">0</p>
          <p className="mt-1 text-xs text-gray-500">Feature coming in Module 2</p>
        </div>

        <div className="bg-white p-6 border border-gray-200 shadow-sm">
          <h3 className="text-sm font-medium text-gray-900">Team Members</h3>
          <p className="mt-2 text-3xl font-semibold text-blue-600">1</p>
          <p className="mt-1 text-xs text-gray-500">Feature coming in Module 2</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200">
          <h3 className="text-sm font-medium text-gray-900">Recent Activity</h3>
        </div>
        <div className="p-6 text-center text-sm text-gray-500">
          No recent activity to display.
        </div>
      </div>
    </div>
  );
}
