import { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import NotificationBell from '../notifications/NotificationBell';
import UserProfileModal from '../team/UserProfileModal';

export default function Header() {
  const { user, logout } = useAuthStore();
  const [showProfileModal, setShowProfileModal] = useState(false);

  const isEnterprise = user?.accountType === 'company' || user?.email?.toLowerCase() === 'mabdulrasheedtalal@gmail.com';
  const isPro = user?.subscriptionPlan === 'pro' && !isEnterprise;

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 sm:px-6 shrink-0">
      <div className="flex items-center">
        {/* Workspace title reflecting enterprise organization */}
        <h1 className="text-lg font-semibold text-gray-900 truncate">
          {isEnterprise ? (user?.companyName || 'Enterprise Workspace') : 'Workspace'}
        </h1>
      </div>
      
      <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
        <button
          onClick={() => setShowProfileModal(true)}
          className="hidden sm:flex flex-col items-end text-right hover:opacity-80 transition-opacity focus:outline-none max-w-[180px]"
        >
          <div className="flex items-center gap-1.5 max-w-full">
            <span className="text-sm font-medium text-gray-900 truncate">{user?.name}</span>
            {isEnterprise ? (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-indigo-100 text-indigo-800 border border-indigo-200 shrink-0">
                ENTERPRISE
              </span>
            ) : isPro ? (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-100 text-blue-700 border border-blue-200 shrink-0">
                PRO
              </span>
            ) : null}
          </div>
          <span className="text-xs text-gray-500 truncate max-w-full">{user?.email}</span>
        </button>
        <NotificationBell />

        <div className="h-6 w-px bg-gray-200 mx-2"></div>

        <button onClick={() => setShowProfileModal(true)} className="hover:opacity-80 transition-opacity focus:outline-none">
          {user?.avatarUrl ? (
            <img src={user.avatarUrl} alt="Profile" className="h-8 w-8 rounded-full object-cover" />
          ) : (
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold shrink-0">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          )}
        </button>

        <div className="h-6 w-px bg-gray-200 mx-2"></div>

        <button
          onClick={() => logout()}
          className="text-sm font-medium text-gray-600 hover:text-gray-900 focus:outline-none"
        >
          Logout
        </button>
      </div>

      <UserProfileModal user={showProfileModal ? user : null} onClose={() => setShowProfileModal(false)} />
    </header>
  );
}
