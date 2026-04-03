import React from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '../contexts/AuthContext.jsx';
import { LayoutDashboard, CheckSquare, Users, MessageSquare, Activity, LogOut, Bell } from 'lucide-react';

export default function Layout({ children }) {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/tasks', label: 'Tasks', icon: CheckSquare },
    { path: '/org-chart', label: 'Org Chart', icon: Users },
    { path: '/org-chat', label: 'Org Chat', icon: MessageSquare },
    { path: '/activity', label: 'Activity', icon: Activity },
    ...(user?.role === 'superadmin' ? [{ path: '/users', label: 'User Management', icon: Users }] : []),
  ];

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden">
      {/* Sidebar */}
      <aside className="w-[260px] bg-[#111827] flex flex-col text-white">
        {/* Top Logo Area */}
        <div className="h-[72px] flex items-center justify-center px-4 border-b border-gray-800">
          <img 
            src="/logo.png" 
            alt="Company Logo" 
            className="h-12 object-contain"
          />
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-4 flex flex-col gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path;
            
            return (
              <Link href={item.path} key={item.path}>
                <a className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-indigo-600 text-white' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}>
                  <Icon size={18} />
                  <span className="font-medium text-[15px]">{item.label}</span>
                </a>
              </Link>
            );
          })}
        </nav>

        {/* Profile bottom area */}
        <div className="p-4 mt-auto border-t border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-white font-bold text-sm">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-white">{user?.username?.split('@')[0]}</span>
              <span className="text-xs text-gray-400 capitalize">{user?.role}</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Top Navbar */}
        <header className="h-[72px] bg-white border-b border-gray-100 flex items-center justify-end px-8">
          <div className="flex items-center gap-4">
            <button className="text-gray-400 hover:text-gray-600">
              <Bell size={20} />
            </button>
            <button onClick={logout} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm font-medium">
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        </header>

        {/* Main Scrolling Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
