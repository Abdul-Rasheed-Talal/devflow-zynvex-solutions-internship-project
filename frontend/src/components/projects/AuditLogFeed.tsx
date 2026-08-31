import { useState } from 'react';
import { useProjectAuditLogs } from '../../hooks/useAuditQueries';
import type { ApiError } from '../../types/auth';

interface AuditLogFeedProps {
  projectId: string;
}

export default function AuditLogFeed({ projectId }: AuditLogFeedProps) {
  const [page, setPage] = useState(1);
  const { data: response, isLoading, error } = useProjectAuditLogs(projectId, page);

  if (isLoading) {
    return (
      <div className="mt-8 border-t border-gray-200 pt-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          Security Audit Logs
        </h2>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    const apiErr = error as ApiError;
    if (apiErr.status === 403) {
      // Intentionally hidden for members/viewers
      return null;
    }
    return (
      <div className="mt-8 border-t border-gray-200 pt-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          Security Audit Logs
        </h2>
        <div className="bg-red-50 border border-red-200 p-4 rounded text-sm text-red-700">
          Failed to load audit logs.
        </div>
      </div>
    );
  }

  const logs = response?.data || [];
  const pagination = response?.pagination;

  if (logs.length === 0) {
    return (
      <div className="mt-8 border-t border-gray-200 pt-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          Security Audit Logs
        </h2>
        <div className="bg-gray-50 border border-gray-200 border-dashed rounded p-6 text-center text-sm text-gray-500">
          No security audit events recorded.
        </div>
      </div>
    );
  }

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString(undefined, {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
  };

  const getActionDetails = (action: string, targetUser?: any) => {
    switch (action) {
      case 'project_deleted':
        return <span className="text-red-600 font-medium">Deleted the project</span>;
      case 'member_added':
        return <span>Added member <span className="font-medium text-gray-900">{targetUser?.name || 'Unknown'}</span></span>;
      case 'member_removed':
        return <span>Removed member <span className="font-medium text-gray-900">{targetUser?.name || 'Unknown'}</span></span>;
      case 'role_changed':
        return <span>Changed role of <span className="font-medium text-gray-900">{targetUser?.name || 'Unknown'}</span></span>;
      default:
        return <span>Performed action: <span className="font-medium text-gray-900">{action}</span></span>;
    }
  };

  return (
    <div className="mt-8 border-t border-gray-200 pt-8">
      <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
        Security Audit Logs
      </h2>
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Timestamp
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actor
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {logs.map((log) => (
              <tr key={log._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                  {formatDateTime(log.createdAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {log.actor.name}
                  <div className="text-xs text-gray-500 font-normal">{log.actor.email}</div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {getActionDetails(log.action, log.targetUser)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Page <span className="font-medium">{pagination.page}</span> of <span className="font-medium">{pagination.totalPages}</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
              disabled={page === pagination.totalPages}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
