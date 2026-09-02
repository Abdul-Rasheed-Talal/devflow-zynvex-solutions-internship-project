
import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

export default function Sidebar() {
  const user = useAuthStore((state: any) => state.user);
  const navItems = [
    { name: 'Dashboard', path: '/app/dashboard' },
    { name: 'Projects', path: '/app/projects' },
    { name: 'Team', path: '/app/team' },
    { name: 'Announcements', path: '/app/announcements' },
    { name: 'Settings', path: '/app/settings' },
  ];

  const isEnterprise = user?.accountType === 'company' || user?.email?.toLowerCase() === 'mabdulrasheedtalal@gmail.com';
  const isPro = user?.subscriptionPlan === 'pro' && !isEnterprise;

  return (
    <div className="w-64 bg-gray-900 text-white hidden md:flex flex-col shrink-0">
      <div className="h-16 flex items-center px-6 border-b border-gray-800">
        <span className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
          DevFlow
          {isEnterprise ? (
            <span className="px-1.5 py-0.5 rounded text-[10px] uppercase font-bold bg-indigo-600 text-white tracking-wider">
              ENTERPRISE
            </span>
          ) : isPro ? (
            <span className="px-1.5 py-0.5 rounded text-[10px] uppercase font-bold bg-blue-600 text-white tracking-wider">
              PRO
            </span>
          ) : null}
        </span>
      </div>
      
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            {item.name}
          </NavLink>
        ))}
      </nav>
      
      <div className="px-6 py-4 border-t border-gray-800 text-xs text-gray-500 flex items-center justify-between">
        <span>{isEnterprise ? 'Enterprise Tier' : isPro ? 'Pro Tier' : 'DevFlow'}</span>
        <span>v1.0</span>
      </div>
    </div>
  );
}
