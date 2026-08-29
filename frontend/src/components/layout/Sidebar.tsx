import React from 'react';
import { NavLink } from 'react-router-dom';

export default function Sidebar() {
  const navItems = [
    { name: 'Dashboard', path: '/app/dashboard' },
    { name: 'Projects', path: '/app/projects' },
  ];

  return (
    <div className="w-64 bg-gray-900 text-white hidden md:flex flex-col shrink-0">
      <div className="h-16 flex items-center px-6 border-b border-gray-800">
        <span className="text-xl font-bold tracking-tight">DevFlow</span>
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
      
      <div className="p-4 border-t border-gray-800 text-xs text-gray-500">
        DevFlow v1.0
      </div>
    </div>
  );
}
