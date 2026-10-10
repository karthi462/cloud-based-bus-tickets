import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Bus, Shield, LogOut, User as UserIcon, CreditCard, Sparkles } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getDashboardLink = () => {
    if (!user) return '/';
    if (user.role === 'ADMIN') return '/admin';
    if (user.role === 'CONDUCTOR') return '/conductor';
    return '/passenger';
  };

  return (
    <nav className="bg-navy-900 border-b border-slate-800 sticky top-0 z-40 backdrop-blur-md bg-opacity-90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to={getDashboardLink()} className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
              <Bus className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-cyan-400 bg-clip-text text-transparent">
                CloudBus
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 font-mono">
                AWS Cloud v1.0
              </span>
            </div>
          </Link>

          {/* User Status / Navigation */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                {/* Role Pill */}
                <div className="hidden md:flex flex-col text-right">
                  <span className="text-xs text-slate-400 font-medium">{user.fullName || user.email}</span>
                  <div className="flex items-center justify-end space-x-1.5 mt-0.5">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        user.role === 'ADMIN'
                          ? 'bg-purple-950 text-purple-400 border border-purple-800'
                          : user.role === 'CONDUCTOR'
                          ? 'bg-amber-950 text-amber-400 border border-amber-800'
                          : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      }`}
                    >
                      {user.role}
                    </span>
                    {user.passengerId && (
                      <span className="text-[10px] text-cyan-400 font-mono bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-800/40">
                        {user.passengerId}
                      </span>
                    )}
                    {user.employeeId && (
                      <span className="text-[10px] text-amber-400 font-mono bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-800/40">
                        {user.employeeId}
                      </span>
                    )}
                  </div>
                </div>

                {/* Dashboard Shortcut */}
                <Link
                  to={getDashboardLink()}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
                >
                  Dashboard
                </Link>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 border border-transparent hover:border-rose-900 transition"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/passenger/login"
                  className="px-3 py-1.5 text-xs font-medium rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition"
                >
                  Passenger Login
                </Link>
                <Link
                  to="/conductor/login"
                  className="px-3 py-1.5 text-xs font-medium rounded-lg text-amber-400 hover:bg-amber-950/40 border border-amber-800/60 transition"
                >
                  Conductor Portal
                </Link>
                <Link
                  to="/admin/login"
                  className="px-3 py-1.5 text-xs font-medium rounded-lg text-purple-400 hover:bg-purple-950/40 border border-purple-800/60 transition"
                >
                  Admin Portal
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
