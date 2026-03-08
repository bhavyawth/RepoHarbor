import {
  ChevronDown,
  FolderTree,
  Info,
  Loader2,
  Pin,
  XCircle,
  Sparkles,
  Trash2,
  RotateCcw,
} from 'lucide-react';
import Logo from './Logo';
import { useAuth } from '../features/auth/auth.hooks';
import { useLocation, useNavigate } from 'react-router-dom';
import { AnimatedThemeToggler } from './ui/animated-theme-toggler';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Button } from './ui/button';
import { SidebarTrigger } from './ui/sidebar';
import { useChatStore } from '../store/chat.store';
import {
  useDeleteRepo,
  useGetRepos,
  useIngestRepo,
  usePinRepo,
  useRepoStructure,
  useSummarizeRepo,
} from '../features/repo/repos.hooks';
import { useClearChat } from '../features/chat/chat.hooks';
import { useEffect, useMemo, useState } from 'react';
import { RepoStructurePanel } from './RepoStructurePanel';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import MarkdownRenderer from './chat/MarkdownRenderer';
import { getErrorMessage } from '../lib/getErrorMessage';
import { useIsMobile } from '../lib/hooks/use-mobile';

export default function Navbar() {
  const { data: user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const { activeChatId: activeChat, setActiveChatId, setRepoInfoOpen, setRepoInfoTarget } = useChatStore();
  const { data: repos } = useGetRepos();
  const ingestRepoMutation = useIngestRepo();
  const pinRepoMutation = usePinRepo();
  const deleteRepoMutation = useDeleteRepo();
  const [showSummaryPanel, setShowSummaryPanel] = useState(false);
  const [showStructurePanel, setShowStructurePanel] = useState(false);

  const activeRepo = repos?.find((repo) => repo._id === activeChat) ?? null;
  const indexStatus = activeRepo?.indexStatus ?? 'idle';
  const isChatReady =
    indexStatus === 'done' || (indexStatus === 'cancelled' && !!activeRepo?.lastIndexedAt);
  const clearChatMutation = useClearChat(activeRepo?._id ?? '');
  const {
    mutateAsync: summarizeRepo,
    data: repoSummary,
    isPending: repoSummaryLoading,
    isError: repoSummaryError,
    error: repoSummaryErrorValue,
    reset: resetSummary,
  } = useSummarizeRepo();
  const {
    data: repoStructure,
    isLoading: repoStructureLoading,
    isError: repoStructureError,
    error: repoStructureErrorValue,
  } = useRepoStructure(showStructurePanel ? activeRepo?._id : undefined);
  const baseUrl = import.meta.env.VITE_API_URL;
  
  const handleGithubLogin = () => {
    window.location.href = `${baseUrl}/auth/github`;
  };

  const handleFeatureScroll = () => {
    if (location.pathname !== '/') {
      navigate('/#features');
      return;
    }
    const element = document.getElementById('features');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleTopScroll = () => {
    if (location.pathname !== '/') {
      navigate('/#topdiv');
      return;
    }
    const element = document.getElementById('topdiv');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleRepoInfo = () => {
    if (!activeRepo) return;
    setRepoInfoTarget(activeRepo);
    setRepoInfoOpen(true);
  };

  const handlePinRepo = () => {
    if (!activeRepo) return;
    pinRepoMutation.mutate(activeRepo._id);
  };

  const handleDeleteRepo = () => {
    if (!activeRepo) return;
    deleteRepoMutation.mutate(activeRepo._id);
    setActiveChatId(null);
    navigate('/chat/new');
  };

  const handleClearChat = () => {
    if (!activeRepo) return;
    clearChatMutation.mutate();
  };

  const handleRepoSummary = async () => {
    if (!activeRepo || repoSummaryLoading) return;
    setShowStructurePanel(false);
    setShowSummaryPanel(true);
    await summarizeRepo(activeRepo._id);
  };

  const handleRepoStructure = () => {
    if (!activeRepo) return;
    setShowSummaryPanel(false);
    setShowStructurePanel(true);
  };

  const handleIngestRepo = async () => {
    if (!activeRepo || ingestRepoMutation.isPending) return;
    try {
      await ingestRepoMutation.mutateAsync(activeRepo._id);
    } catch {}
  };

  const isIndexing = indexStatus === 'running';
  const isNewChatPage = location.pathname === '/chat/new';
  const username = user?.username ?? 'there';
  const mobileGreetings = useMemo(
    () => [`Hi, ${username}`, `Welcome back, ${username}`, `Ready to start, ${username}?`],
    [username]
  );
  const [greetingIndex, setGreetingIndex] = useState(0);

  useEffect(() => {
    setShowSummaryPanel(false);
    setShowStructurePanel(false);
    resetSummary();
  }, [activeRepo?._id, resetSummary]);

  useEffect(() => {
    if (!isNewChatPage || mobileGreetings.length < 2) return;
    const timer = window.setInterval(() => {
      setGreetingIndex((current) => (current + 1) % mobileGreetings.length);
    }, 3600);
    return () => window.clearInterval(timer);
  }, [isNewChatPage, mobileGreetings.length]);

  if (!user) {
    return (
      <nav className="pointer-events-none fixed inset-x-0 top-5 z-40 px-4 sm:px-8 lg:px-12">
        <div className="pointer-events-auto mx-auto flex w-full max-w-5xl items-center justify-between rounded-full border border-slate-300/80 bg-white/75 px-6 py-2.5 shadow-sm backdrop-blur-md dark:border-slate-700/80 dark:bg-slate-900/70">
          <div className="flex items-center gap-2 cursor-pointer" onClick={handleTopScroll}>
            <Logo className="h-10 w-10" />
            <span className="hidden sm:inline text-base font-semibold tracking-tight text-slate-900 dark:text-slate-100">
              RepoHarbor
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={handleFeatureScroll}
              className="transform-gpu  cursor-pointer transition-transform duration-150 hover:scale-[1.02] active:scale-[0.98] disabled:scale-100 rounded-full px-5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100/80 dark:text-slate-200 dark:hover:bg-slate-800/80"
            >
              Features
            </Button>
            <Button
              onClick={handleGithubLogin}
              className="rounded-full cursor-pointer bg-slate-900 px-5 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 transform-gpu transition-transform duration-150 hover:scale-[1.02] active:scale-[0.98] disabled:scale-100"
            >
              Get Started
            </Button>
            <AnimatedThemeToggler className="inline-flex cursor-pointer items-center justify-center transform-gpu transition-transform duration-150 hover:scale-[1.02] active:scale-[0.98] disabled:scale-100" />
          </div>
        </div>
      </nav>
    );
  }

  if (isNewChatPage) {
    return (
      <nav className="relative z-30 h-16 border-b border-gray-200 dark:border-gray-800 bg-[#f5f7fb] dark:bg-black flex items-center justify-between px-3 sm:px-4 md:hidden">
        <div className="flex min-w-0 items-center gap-2">
          <SidebarTrigger className="size-9 rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800" />
          <div className="hidden sm:flex items-center gap-2">
            <Logo className="h-8 w-8" />
            <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">RepoHarbor</span>
          </div>
        </div>

        <div className="absolute left-1/2 -translate-x-1/2 sm:hidden">
          <span className="inline-flex max-w-[62vw] truncate rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
            {mobileGreetings[greetingIndex]}
          </span>
        </div>

        <AnimatedThemeToggler className="inline-flex h-8 w-8 shrink-0 items-center justify-center transform-gpu transition-transform duration-150 hover:scale-[1.02] active:scale-[0.98] disabled:scale-100" />
      </nav>
    );
  }

  return (
    <nav className="relative z-30 h-16 border-b border-gray-200 dark:border-gray-800 bg-[#f5f7fb] dark:bg-black flex items-center justify-between px-3 sm:px-4 md:px-6">
      <div className="flex items-center md:hidden">
        <SidebarTrigger className="size-9 rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 md:hidden" />
      </div>

      <div className="absolute left-1/2 max-w-[min(72vw,22rem)] -translate-x-1/2 sm:max-w-[min(58vw,28rem)]">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="inline-flex max-w-full items-center gap-1.5 px-2 sm:px-3 text-sm font-medium transform-gpu transition-transform duration-150 hover:scale-[1.02] active:scale-[0.98] disabled:scale-100"
              disabled={!activeRepo}
            >
              <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <div className="min-w-0 max-w-[min(50vw,14rem)] sm:max-w-[min(40vw,18rem)]">
                  <p className="truncate text-sm font-medium text-slate-900 dark:text-white">
                    {activeRepo?.name || 'Repository Chat'}
                  </p>
                  <p className="hidden text-xs text-slate-500 dark:text-slate-400 sm:block">
                    {indexStatus === 'running'
                      ? 'Indexing in progress'
                      : indexStatus === 'failed'
                        ? 'Index failed'
                        : isChatReady
                          ? 'Ready to chat'
                          : 'Indexing required'}
                  </p>
                </div>
              </div>
              <ChevronDown className="h-4 w-4 shrink-0" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" className="w-56 rounded-xl border border-slate-200 bg-white p-1 shadow-lg dark:border-slate-700 dark:bg-slate-900">
            <DropdownMenuItem
              className="cursor-pointer gap-2 transform-gpu rounded-xl transition-transform duration-150 hover:scale-[1.02] active:scale-[0.98] disabled:scale-100 hover:bg-slate-100 dark:hover:bg-slate-800"
              onClick={handleRepoInfo}
              disabled={!activeRepo}
            >
              <Info className="h-4 w-4" />
              Repo Info
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer gap-2 transform-gpu rounded-xl transition-transform duration-150 hover:scale-[1.02] active:scale-[0.98] disabled:scale-100 hover:bg-slate-100 dark:hover:bg-slate-800"
              onClick={handlePinRepo}
              disabled={!activeRepo}
            >
              <Pin className="h-4 w-4" />
              {activeRepo?.isPinned ? 'Unpin Repo' : 'Pin Repo'}
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer gap-2 transform-gpu rounded-xl transition-transform duration-150 hover:scale-[1.02] active:scale-[0.98] disabled:scale-100 hover:bg-slate-100 dark:hover:bg-slate-800"
              onClick={handleRepoSummary}
              disabled={!activeRepo || repoSummaryLoading}
            >
              {repoSummaryLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              {repoSummaryLoading ? 'Summarizing...' : 'Summarize Repo'}
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer gap-2 transform-gpu rounded-xl transition-transform duration-150 hover:scale-[1.02] active:scale-[0.98] disabled:scale-100 hover:bg-slate-100 dark:hover:bg-slate-800"
              onClick={handleRepoStructure}
              disabled={!activeRepo}
            >
              <FolderTree className="h-4 w-4" />
              Repo File Structure
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer gap-2 transform-gpu rounded-xl transition-transform duration-150 hover:scale-[1.02] active:scale-[0.98] disabled:scale-100 hover:bg-slate-100 dark:hover:bg-slate-800"
              onClick={handleClearChat}
              disabled={!activeRepo}
            >
              <XCircle className="h-4 w-4" />
              Clear Chat
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer gap-2 text-red-600 rounded-xl hover:text-red-600 data-[highlighted]:text-red-600 dark:text-red-400 transition-transform duration-150 hover:scale-[1.02] active:scale-[0.98] disabled:scale-100 hover:bg-slate-100 dark:hover:bg-slate-800"
              onClick={handleDeleteRepo}
              disabled={!activeRepo}
            >
              <Trash2 className="h-4 w-4" />
              Delete Chat
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        {showSummaryPanel && activeRepo && (
          <div className="repo-summary-panel absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[min(520px,90vw)] rounded-lg border border-border bg-popover p-4 text-sm shadow-xl hover:bg-slate-100 dark:hover:bg-slate-800">
            <div className="mb-2 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 font-medium">
                <Sparkles className="h-4 w-4 text-slate-700 dark:text-slate-300" />
                Repository Summary
              </div>
              <Button
                variant="ghost"
                className="h-7 px-2 text-xs transform-gpu transition-transform duration-150 hover:scale-[1.02] active:scale-[0.98] disabled:scale-100"
                onClick={() => setShowSummaryPanel(false)}
              >
                Close
              </Button>
            </div>
            {repoSummaryLoading && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating summary...
              </div>
            )}
            {!repoSummaryLoading && repoSummaryError && (
              <div className="rounded-md border border-red-200 bg-red-50 p-3 text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
                {getErrorMessage(repoSummaryErrorValue, 'Failed to summarize repository.')}
              </div>
            )}
            {!repoSummaryLoading && !repoSummaryError && repoSummary?.summary && (
              <div className="max-h-64 overflow-y-auto pr-1">
                <MarkdownRenderer content={repoSummary.summary} />
              </div>
            )}
          </div>
        )}
        {showStructurePanel && activeRepo && (
          <RepoStructurePanel
            repoName={activeRepo.name}
            isLoading={repoStructureLoading}
            isError={repoStructureError}
            error={repoStructureErrorValue}
            tree={repoStructure?.tree}
            onClose={() => setShowStructurePanel(false)}
          />
        )}
      </div>

      <div className="ml-auto flex items-center gap-1.5 sm:gap-2 md:ml-0">
        <Button
          onClick={handleIngestRepo}
          disabled={isIndexing || ingestRepoMutation.isPending}
          variant={isChatReady ? 'outline' : 'default'}
          size="sm"
          className={`h-9 min-w-9 px-2 sm:px-3 flex items-center justify-center leading-none transform-gpu transition-transform duration-150 hover:scale-[1.02] active:scale-[0.98] disabled:scale-100 ${isChatReady
              ? 'border-slate-300 dark:border-slate-700'
              : ''
            }`}
        >
          {isIndexing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="hidden sm:inline sm:ml-2">Indexing...</span>
            </>
          ) : indexStatus === 'failed' ? (
            <>
              <RotateCcw className="h-4 w-4" />
              <span className="hidden sm:inline sm:ml-2">Retry</span>
            </>
          ) : isChatReady ? (
            <>
              <RotateCcw className="h-4 w-4" />
              <span className="hidden sm:inline sm:ml-2">Reindex</span>
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              <span className="hidden sm:inline sm:ml-2">Index Repository</span>
            </>
          )}
        </Button>

        {isMobile ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label="index info"
                className="inline-flex h-7 w-7 items-center justify-center rounded-full text-slate-500 transform-gpu transition-transform duration-150 hover:scale-[1.02] active:scale-[0.98] disabled:scale-100 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              >
                <Info className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              side="bottom"
              sideOffset={6}
              collisionPadding={8}
              className="max-w-64 text-xs leading-relaxed"
            >
              {isChatReady
                ? 'Reindex to update embeddings with the latest changes from the repository.'
                : 'Indexing the repository will extract information and generate embeddings to enable chat functionality. The first indexing may take a few minutes depending on the repository size.'}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <TooltipProvider delayDuration={150}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  aria-label="index info"
                  className="inline-flex h-7 w-7 items-center justify-center rounded-full text-slate-500 transform-gpu transition-transform duration-150 hover:scale-[1.02] active:scale-[0.98] disabled:scale-100 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                >
                  <Info className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              {isChatReady && (
                <TooltipContent sideOffset={6} className="max-w-64 bg-slate-900 text-slate-100 dark:bg-slate-100 dark:text-slate-900">
                  Reindex to update embeddings with the latest changes from the repository.
                </TooltipContent>
              )}
              {!isChatReady && (
                <TooltipContent sideOffset={6} className="max-w-64 bg-slate-900 text-slate-100 dark:bg-slate-100 dark:text-slate-900">
                  Indexing the repository will extract information and generate embeddings to enable chat functionality. The first indexing may take a few minutes depending on the repository size.
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      <div className="hidden items-center md:flex">
        {activeRepo && (
          <span className="inline-flex max-w-[16rem] items-center rounded-md bg-slate-200 px-2 py-1 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-300 lg:max-w-[20rem]">
            <span className="truncate">Branch: {activeRepo.branch ?? 'main'}</span>
          </span>
        )}
      </div>
    </nav>
  );
}

