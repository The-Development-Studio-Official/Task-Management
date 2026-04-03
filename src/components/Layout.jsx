import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '../contexts/AuthContext.jsx';
import { LayoutDashboard, CheckSquare, Users, MessageSquare, Activity, LogOut, Bell, Menu, X } from 'lucide-react';

export default function Layout({ children }) {
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/tasks', label: 'Tasks', icon: CheckSquare },
    { path: '/org-chart', label: 'Org Chart', icon: Users },
    { path: '/org-chat', label: 'Org Chat', icon: MessageSquare },
    { path: '/activity', label: 'Activity', icon: Activity },
    ...(user?.role === 'superadmin' ? [{ path: '/users', label: 'User Management', icon: Users }] : []),
  ];

  const handleNavClick = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[linear-gradient(180deg,#f8fbff_0%,#f8fafc_100%)]">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed md:relative z-40 md:z-0 h-full w-64 md:w-[260px] bg-slate-900 text-white flex flex-col transition-transform duration-300 transform ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        {/* Top Logo Area */}
        <div className="h-[72px] flex items-center justify-between px-4 border-b border-slate-800">
          <img 
            src="/logo.png" 
            alt="Company Logo" 
            className="h-10 md:h-12 object-contain"
          />
          <button 
            onClick={() => setSidebarOpen(false)}
            className="md:hidden text-gray-400 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 flex flex-col gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path;
            
            return (
              <Link 
                href={item.path} 
                key={item.path}
                onClick={handleNavClick}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors text-sm md:text-base ${
                  isActive 
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Profile bottom area */}
        <div className="mt-auto border-t border-slate-800 p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-medium text-white truncate">{user?.username?.split('@')[0]}</span>
              <span className="text-xs text-slate-400 capitalize">{user?.role}</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex min-w-0 flex-col overflow-hidden">
        
        {/* Top Navbar */}
        <header className="h-16 md:h-[72px] border-b border-slate-200/80 bg-white/90 px-4 md:px-8 flex items-center justify-between backdrop-blur-sm">
          <button 
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
            aria-expanded={sidebarOpen}
            className="md:hidden text-slate-400 hover:text-slate-700 p-2"
          >
            <Menu size={24} />
          </button>
          <div className="flex items-center gap-4">
            <button className="text-slate-400 hover:text-slate-700 p-2">
              <Bell size={20} />
            </button>
            <button 
              onClick={logout} 
              className="flex items-center gap-2 text-slate-500 hover:text-slate-800 text-sm font-medium p-2"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Sign Out</span>
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
