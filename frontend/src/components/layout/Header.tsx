import React from 'react';
import { useAuthStore } from '../../stores/authStore';

export default function Header() {
  const { user, logout } = useAuthStore();

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center">
        {/* Placeholder for future page title or breadcrumbs */}
        <h1 className="text-lg font-medium text-gray-900">Workspace</h1>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex flex-col items-end">
          <span className="text-sm font-medium text-gray-900">{user?.name}</span>
          <span className="text-xs text-gray-500">{user?.email}</span>
        </div>
        
        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold shrink-0">
          {user?.name?.charAt(0).toUpperCase()}
        </div>

        <div className="h-6 w-px bg-gray-200 mx-2"></div>

        <button
          onClick={() => logout()}
          className="text-sm font-medium text-gray-600 hover:text-gray-900 focus:outline-none"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
