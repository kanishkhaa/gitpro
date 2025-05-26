import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Home,
  Code2,
  CheckCircle,
  BarChart3,
  FileText,
  Scan,
  Clock,
  Users,
  UserCircle,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Zap,
  Star,
} from 'lucide-react';

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  // Mock user data (replace with GitHub auth data from Step 1)
  const user = {
    name: 'Alex Johnson',
    avatar: 'https://github.com/octocat.png',
    role: 'Senior Developer'
  };

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  const navItems = [
    { name: 'Home', path: '/home', icon: Home, gradient: 'from-emerald-400 to-teal-500' },
    { name: 'Smart Code Reviewer', path: '/ai-code-review', icon: Code2, gradient: 'from-blue-400 to-indigo-500' },
    { name: 'Commit Intent Analyzer', path: '/commit-validator', icon: CheckCircle, gradient: 'from-green-400 to-emerald-500' },
    { name: 'Productivity Insights', path: '/insights-dashboard', icon: BarChart3, gradient: 'from-purple-400 to-pink-500' },
    { name: 'AI Documentation Generator', path: '/auto-docstrings', icon: FileText, gradient: 'from-orange-400 to-red-500' },
    { name: 'AI Security Scanner', path: '/vulnerability-scan', icon: Scan, gradient: 'from-red-400 to-rose-500' },
    { name: 'Visual Git History', path: '/commit-history', icon: Clock, gradient: 'from-cyan-400 to-blue-500' },
    { name: 'Smart Onboarding Assistant', path: '/codebase-explorer', icon: Users, gradient: 'from-violet-400 to-purple-500' },
  ];

  return (
    <div
      className={`fixed h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white transition-all duration-500 ease-out ${
        isCollapsed ? 'w-16' : 'w-72'
      } flex flex-col border-r border-slate-700/30 shadow-2xl backdrop-blur-lg z-50 relative overflow-hidden`}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-4 w-32 h-32 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-40 right-4 w-24 h-24 bg-gradient-to-r from-pink-500 to-rose-600 rounded-full blur-2xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-16 h-16 bg-gradient-to-r from-cyan-500 to-teal-600 rounded-full blur-xl animate-pulse delay-500"></div>
      </div>

      {/* Header with enhanced design */}
      <div className={`relative flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} p-4 border-b border-slate-700/30 bg-gradient-to-r from-slate-800/60 to-slate-900/60 backdrop-blur-sm`}>
        {!isCollapsed && (
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-300">
                <Code2 className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                <Sparkles className="w-1.5 h-1.5 text-white" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                DevAI Pro
              </span>
            </div>
          </div>
        )}
        
        {isCollapsed && (
          <div className="relative">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
              <Code2 className="w-4 h-4 text-white" />
            </div>
          </div>
        )}
        
        <button
          onClick={toggleSidebar}
          className={`p-2 rounded-lg hover:bg-slate-700/40 transition-all duration-300 group border border-slate-600/30 hover:border-slate-500/50 backdrop-blur-sm ${
            isCollapsed ? 'absolute -right-3 top-1/2 transform -translate-y-1/2 bg-slate-800/80' : ''
          }`}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-white group-hover:scale-110 transition-all duration-200" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-slate-400 group-hover:text-white group-hover:scale-110 transition-all duration-200" />
          )}
        </button>
      </div>

      {/* Enhanced User Profile */}
      {user && (
        <div className={`p-4 border-b border-slate-700/30 bg-gradient-to-r from-slate-800/40 to-slate-900/40 backdrop-blur-sm`}>
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : ''}`}>
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
              <img
                src={user.avatar}
                alt="User Avatar"
                className={`relative ${isCollapsed ? 'w-8 h-8' : 'w-10 h-10'} rounded-full border-2 border-white/20 shadow-xl`}
              />
              <div className={`absolute -bottom-0.5 -right-0.5 ${isCollapsed ? 'w-3 h-3' : 'w-4 h-4'} bg-gradient-to-r from-green-400 to-emerald-500 rounded-full border-2 border-slate-900 flex items-center justify-center`}>
                <Zap className={`${isCollapsed ? 'w-1.5 h-1.5' : 'w-2 h-2'} text-white`} />
              </div>
            </div>
            {!isCollapsed && (
              <div className="ml-3 flex-1">
                <div className="text-sm font-semibold text-white flex items-center space-x-2">
                  <span>{user.name}</span>
                </div>
                <div className="text-xs text-slate-400 mt-0.5">{user.role}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Enhanced Navigation with custom scrollbar */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto custom-scrollbar">
        <style jsx>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(30, 41, 59, 0.3);
            border-radius: 2px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: linear-gradient(to bottom, #3b82f6, #8b5cf6);
            border-radius: 2px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(to bottom, #2563eb, #7c3aed);
          }
        `}</style>
        
        {navItems.map((item, index) => (
          <NavLink
            to={item.path}
            key={item.name}
            className={({ isActive }) =>
              `flex items-center px-3 py-3 rounded-xl transition-all duration-300 group relative transform hover:scale-[1.02] ${
                isActive
                  ? 'bg-gradient-to-r from-slate-800/80 to-slate-700/80 text-white border border-slate-600/50 shadow-xl backdrop-blur-sm'
                  : 'hover:bg-slate-800/60 text-slate-300 hover:text-white hover:backdrop-blur-sm'
              } ${isCollapsed ? 'justify-center' : ''}`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`relative ${isCollapsed ? 'p-2' : 'p-2.5'} rounded-lg ${
                  isActive 
                    ? `bg-gradient-to-br ${item.gradient} shadow-lg` 
                    : 'bg-slate-700/60 group-hover:bg-slate-600/60'
                } transition-all duration-300 group-hover:scale-110 ${isCollapsed ? 'flex-shrink-0' : ''}`}>
                  <item.icon className={`${isCollapsed ? 'w-4 h-4' : 'w-4 h-4'}`} />
                  {isActive && (
                    <div className="absolute inset-0 bg-white/20 rounded-lg animate-pulse"></div>
                  )}
                </div>
                
                {!isCollapsed && (
                  <div className="flex-1 ml-3">
                    <span className="font-medium text-sm block">
                      {item.name}
                    </span>
                    {isActive && (
                      <div className="flex items-center mt-1 space-x-1">
                        <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse"></div>
                        <div className="w-1 h-1 bg-purple-400 rounded-full animate-pulse delay-100"></div>
                        <div className="w-1 h-1 bg-cyan-400 rounded-full animate-pulse delay-200"></div>
                      </div>
                    )}
                  </div>
                )}
                
                {isActive && !isCollapsed && (
                  <div className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-pulse"></div>
                  </div>
                )}
                
                {/* Enhanced tooltip for collapsed state */}
                {isCollapsed && (
                  <div className="absolute left-full ml-3 px-3 py-2 bg-gradient-to-r from-slate-800 to-slate-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-2xl border border-slate-600/50 whitespace-nowrap z-50 backdrop-blur-lg">
                    <div className="font-medium">{item.name}</div>
                    <div className="absolute top-1/2 -left-1.5 transform -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-slate-800"></div>
                  </div>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Enhanced Footer */}
      <div className="p-4 border-t border-slate-700/30 bg-gradient-to-r from-slate-800/40 to-slate-900/40 backdrop-blur-sm">
        {!isCollapsed ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-green-400 font-medium">Online</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>AI Status: Active</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-2">
            <div className="w-2 h-2 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-pulse"></div>
            <Sparkles className="w-3 h-3 text-yellow-400 animate-pulse" />
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;