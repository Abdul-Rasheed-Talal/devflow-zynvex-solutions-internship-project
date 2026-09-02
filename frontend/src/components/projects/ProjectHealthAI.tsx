import { useProjectHealthAI } from '../../hooks/useAIQueries';
import { useAuthStore } from '../../stores/authStore';
import { Link } from 'react-router-dom';

interface ProjectHealthAIProps {
  projectId: string;
}

export default function ProjectHealthAI({ projectId }: ProjectHealthAIProps) {
  const { data, isLoading, error } = useProjectHealthAI(projectId);

  const isUpgradeRequired = (error as any)?.status === 402 || (error as any)?.code === 'PREMIUM_REQUIRED';

  if (isUpgradeRequired) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 relative overflow-hidden">
        {/* Blurred Background effect */}
        <div className="filter blur-sm opacity-50 select-none">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-5 h-5 rounded bg-blue-600 text-white flex items-center justify-center">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <h3 className="text-sm font-semibold text-gray-900">AI Health Tracker</h3>
          </div>
          <div className="space-y-3">
            <div className="h-3.5 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3.5 bg-gray-200 rounded w-1/2"></div>
            <div className="h-3.5 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
        
        {/* Overlay CTA */}
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-[2px] p-6 text-center">
          <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <h4 className="text-sm font-bold text-gray-900">AI Health Insights</h4>
          <p className="text-xs text-gray-600 mt-1 mb-3 max-w-sm">
            AI Project Health analysis requires an Enterprise or Pro project workspace.
          </p>
          <Link
            to="/app/upgrade"
            className="px-3.5 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded hover:bg-blue-700 transition-colors"
          >
            Upgrade to Pro
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex flex-col items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-sm text-gray-500">Gemini is analyzing project health...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-5 h-5 rounded bg-blue-600 text-white flex items-center justify-center">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <h3 className="text-base font-medium text-gray-900">AI Health Tracker</h3>
        </div>
        <p className="text-sm text-red-600">Failed to generate AI insights at this time.</p>
      </div>
    );
  }

  const health = data.data;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Healthy': return 'text-green-600 bg-green-50 border-green-200';
      case 'At Risk': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'Critical': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 transition-all hover:shadow-md">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-blue-600 text-white flex items-center justify-center">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <h3 className="text-base font-semibold text-gray-900">AI Health Tracker</h3>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(health.status)}`}>
          {health.status} ({health.healthScore}/100)
        </span>
      </div>

      <p className="text-sm text-gray-700 mb-6 leading-relaxed">
        {health.summary}
      </p>

      {health.recommendations && health.recommendations.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">AI Recommendations</h4>
          <ul className="space-y-2">
            {health.recommendations.map((rec, i) => (
              <li key={i} className="flex text-sm text-gray-600 items-start">
                <span className="text-blue-500 mr-2 mt-0.5">•</span>
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
