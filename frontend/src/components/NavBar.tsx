import { Code2, Pin, Trash2, LogOut, User } from 'lucide-react';
import { useAuth } from '../features/auth/auth.hooks';
import { useParams, useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { AnimatedThemeToggler } from './ui/animated-theme-toggler';
import { api } from '../api/client';

export default function Navbar() {
  const { data: user } = useAuth();
  const { repoId } = useParams();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
      navigate('/');
      window.location.reload();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleGithubLogin = () => {
    // todo: window.location.href = `${import.meta.env.VITE_API_URL}/auth/github`;
    window.location.href = `http://localhost:3000/api/auth/github`;
  };

  return (
    <nav className="h-16 border-b border-gray-280 dark:border-gray-800 bg-[#f5f7fb] dark:bg-black flex items-center justify-between px-6">
      <div className="flex items-center gap-3">
        <Code2 className="w-6 h-6 text-purple-600 dark:text-purple-500" />
        <span className="text-xl font-semibold text-slate-900 dark:text-white">
          RepoHarbor
        </span>
      </div>

      {user && repoId && (
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Active Repository
          </span>
          <button className="p-2 hover:bg-slate-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
            <Pin className="w-4 h-4 text-slate-600 dark:text-slate-400" />
          </button>
          <button className="p-2 hover:bg-slate-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
            <Trash2 className="w-4 h-4 text-slate-600 dark:text-slate-400" />
          </button>
        </div>
      )}

      <div className="flex items-center gap-3">
        {!user ? (
          <div className="flex items-center gap-3">
            <button
              onClick={handleGithubLogin}
              className="px-4 py-2 bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-lg font-semibold transition-all text-sm"
            >
              Get Started
            </button>
            <AnimatedThemeToggler />
          </div>
        ) : (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-10 h-10 rounded-full bg-linear-to-r from-purple-600 to-blue-600 flex items-center justify-center text-white font-semibold hover:opacity-90 transition-opacity"
            >
              {user.username?.[0]?.toUpperCase() || <User className="w-5 h-5" />}
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-lg py-2">
                <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-800">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    {user.username}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {user.email}
                  </p>
                </div>
                <div className="px-4 py-3 flex items-center justify-between">
                  <span className="text-sm text-slate-700 dark:text-slate-300">Theme</span>
                  <AnimatedThemeToggler />
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-gray-800 flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}