import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useProjectHealthAI } from '../../hooks/useAIQueries';
import type { AIHealthData } from '../../services/aiService';

interface ProjectHealthAIProps {
  projectId: string;
}

export default function ProjectHealthAI({ projectId }: ProjectHealthAIProps) {
  const queryClient = useQueryClient();

  // Check if diagnostic has already been run in this session
  const cachedData = queryClient.getQueryData<{ success: boolean; data: AIHealthData }>(['ai', 'health', projectId]);
  const [hasTriggered, setHasTriggered] = useState<boolean>(!!cachedData);

  const { data, isLoading, isFetching, error, refetch } = useProjectHealthAI(projectId, hasTriggered);

  const handleRunDiagnostic = () => {
    setHasTriggered(true);
    refetch();
  };

  const isUpgradeRequired =
    (error as any)?.status === 402 ||
    (error as any)?.code === 'PREMIUM_REQUIRED' ||
    (error as any)?.data?.code === 'PREMIUM_REQUIRED';

  // Upgrade required overlay
  if (isUpgradeRequired) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 relative overflow-hidden">
        <div className="filter blur-sm opacity-50 select-none">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-5 h-5 rounded bg-blue-600 text-white flex items-center justify-center">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-gray-900">AI Health Diagnostic</h3>
          </div>
          <div className="space-y-3">
            <div className="h-3.5 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3.5 bg-gray-200 rounded w-1/2"></div>
            <div className="h-3.5 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>

        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-[2px] p-6 text-center">
          <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
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

  // 1. Idle state: User has not run diagnostic yet
  if (!hasTriggered && !data) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 transition-all hover:border-gray-300">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5 border border-blue-100">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-gray-900">AI Project Health Diagnostic</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-700 border border-gray-200 uppercase tracking-wider">
                  On Demand
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1 max-w-xl leading-relaxed">
                Run an on-demand diagnostic evaluating actual sprint velocity, deadline risks, review bottlenecks, and team workload balance.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRunDiagnostic}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded shadow-sm transition-colors shrink-0 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Run Health Diagnostic
          </button>
        </div>
      </div>
    );
  }

  // 2. Loading state: Analysis in progress
  if (isLoading || isFetching) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 flex flex-col items-center justify-center text-center min-h-[160px]">
        <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
          </svg>
        </div>
        <h4 className="text-sm font-semibold text-gray-900">Running AI Project Health Analysis</h4>
        <p className="text-xs text-gray-500 mt-1 max-w-sm">
          Computing ground-truth deliverables, overdue bottlenecks, velocity, and delivery trajectory...
        </p>
      </div>
    );
  }

  // 3. Error state
  if (error || !data) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-red-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-md bg-red-50 text-red-600 flex items-center justify-center shrink-0 border border-red-100">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900">Diagnostic Unavailable</h3>
              <p className="text-sm text-red-600 mt-1">
                {(error as any)?.message || 'Failed to generate AI insights at this time. Please retry.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleRunDiagnostic}
            className="px-3.5 py-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-medium rounded transition-colors shrink-0"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const health = data.data;
  const metrics = health.metrics;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Healthy':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'At Risk':
        return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      case 'Critical':
        return 'text-red-700 bg-red-50 border-red-200';
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  // 4. Completed state with rich realistic metrics
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 transition-all hover:shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded bg-blue-600 text-white flex items-center justify-center shrink-0">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900">AI Project Health Diagnostic</h3>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <span className={`px-2.5 py-1 rounded text-xs font-semibold border ${getStatusBadge(health.status)}`}>
            {health.status} ({health.healthScore}/100)
          </span>
          <button
            type="button"
            onClick={handleRunDiagnostic}
            disabled={isFetching}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-medium rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:opacity-60"
            title="Re-run diagnostic with latest project data"
          >
            <svg
              className={`w-3.5 h-3.5 text-gray-500 ${isFetching ? 'animate-spin' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            <span>{isFetching ? 'Analyzing...' : 'Re-analyze'}</span>
          </button>
        </div>
      </div>

      {/* Realistic Metric Grid (4 Columns) */}
      {metrics && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5 p-3.5 bg-gray-50 rounded-lg border border-gray-100">
          <div>
            <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider block">Completion Rate</span>
            <span className="text-lg font-bold text-gray-900 mt-0.5 block">{metrics.completionRate}%</span>
            <span className="text-xs text-gray-500">
              {metrics.completedTasks} of {metrics.totalTasks} tasks
            </span>
          </div>
          <div>
            <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider block">Overdue Risk</span>
            <span
              className={`text-lg font-bold mt-0.5 block ${metrics.overdueTasks > 0 ? 'text-red-600' : 'text-green-600'}`}
            >
              {metrics.overdueTasks} Overdue
            </span>
            <span className="text-xs text-gray-500">
              {metrics.urgentOverdue ? `${metrics.urgentOverdue} urgent/high priority` : 'No urgent slippage'}
            </span>
          </div>
          <div>
            <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider block">Review Queue</span>
            <span className="text-lg font-bold text-gray-900 mt-0.5 block">{metrics.reviewTasks}</span>
            <span className="text-xs text-gray-500">Awaiting code review</span>
          </div>
          <div>
            <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider block">Weekly Velocity</span>
            <span className="text-lg font-bold text-gray-900 mt-0.5 block">{metrics.velocity || 0}</span>
            <span className="text-xs text-gray-500">Tasks closed in last 7d</span>
          </div>
        </div>
      )}

      {/* Executive Summary */}
      <div className="mb-5">
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Executive Assessment</h4>
        <p className="text-sm text-gray-700 leading-relaxed">{health.summary}</p>
      </div>

      {/* Risk Factors Box (If Any) */}
      {health.riskFactors && health.riskFactors.length > 0 && (
        <div className="mb-5 p-3.5 rounded-md bg-amber-50/60 border border-amber-200/80">
          <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Identified Risk Factors ({health.riskFactors.length})
          </h4>
          <ul className="space-y-1.5">
            {health.riskFactors.map((risk, i) => (
              <li key={i} className="text-xs text-amber-900 flex items-start">
                <span className="text-amber-500 mr-2 font-bold">•</span>
                <span>{risk}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommendations */}
      {health.recommendations && health.recommendations.length > 0 && (
        <div className="mb-4">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2.5">
            Targeted Next Steps
          </h4>
          <ul className="space-y-2">
            {health.recommendations.map((rec, i) => (
              <li key={i} className="flex text-sm text-gray-600 items-start">
                <span className="text-blue-500 mr-2 mt-0.5">•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Timeline Forecast */}
      {health.timelineEstimate && (
        <div className="mt-4 pt-3.5 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-gray-500 gap-2">
          <span>Trajectory: {health.timelineEstimate}</span>
          <span className="text-gray-400">Powered by DevFlow AI Engine</span>
        </div>
      )}
    </div>
  );
}
