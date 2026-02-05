import { Code2 } from 'lucide-react';

export default function NavBar() {
  return (
    <nav className="relative z-10 border-b border-gray-200 dark:border-gray-800/50 backdrop-blur-sm bg-white/50 dark:bg-black/50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Code2 className="w-6 h-6 text-purple-600 dark:text-purple-500" />
            <span className="text-xl font-semibold text-slate-900 dark:text-white">
              RepoHarbor
            </span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com"
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              GitHub
            </a>
            <button className="text-sm px-4 py-2 rounded-lg bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-900 dark:text-white transition-colors">
              Sign In
            </button>
            {/* todo: add toggler */}
            {/* <AnimatedThemeToggler /> */}
          </div>
        </div>
      </div>
    </nav>
  );
}