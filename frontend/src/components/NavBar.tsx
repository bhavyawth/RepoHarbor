import {
  ChevronDown,
  Code2,
  FolderTree,
  Info,
  Loader2,
  Pin,
  XCircle,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { useAuth } from '../features/auth/auth.hooks';
import { useNavigate } from 'react-router-dom';
import { AnimatedThemeToggler } from './ui/animated-theme-toggler';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Button } from './ui/button';
import { useChatStore } from '../store/chat.store';
import {
  useDeleteRepo,
  useGetRepos,
  usePinRepo,
  useRepoStructure,
  useSummarizeRepo,
} from '../features/repo/repos.hooks';
import { useClearChat } from '../features/chat/chat.hooks';
import { useEffect, useState } from 'react';
import { RepoStructurePanel } from './RepoStructurePanel';

export default function Navbar() {
  const { data: user } = useAuth();
  const navigate = useNavigate();
  const { activeChatId: activeChat, setActiveChatId, setRepoInfoOpen, setRepoInfoTarget } = useChatStore();
  const { data: repos } = useGetRepos();
  const pinRepoMutation = usePinRepo();
  const deleteRepoMutation = useDeleteRepo();
  const [showSummaryPanel, setShowSummaryPanel] = useState(false);
  const [showStructurePanel, setShowStructurePanel] = useState(false);

  const activeRepo = repos?.find((repo) => repo._id === activeChat) ?? null;
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

  const handleGithubLogin = () => {
    window.location.href = `http://localhost:3000/api/auth/github`;
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

  useEffect(() => {
    setShowSummaryPanel(false);
    setShowStructurePanel(false);
    resetSummary();
  }, [activeRepo?._id, resetSummary]);

  return (
    <nav className="relative h-16 border-b border-gray-280 dark:border-gray-800 bg-[#f5f7fb] dark:bg-black flex items-center justify-between px-6">
      {!user && <div className="flex items-center gap-3">
        <Code2 className="w-6 h-6 text-purple-600 dark:text-purple-500" />
        <span className="text-xl font-semibold text-slate-900 dark:text-white">
          RepoHarbor
        </span>
      </div>}

      {user && (
        <div className="absolute left-1/2 -translate-x-1/2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2 text-sm font-medium"
                disabled={!activeRepo}
              >
                <span className="truncate max-w-[260px] text-xl">
                  {activeRepo? activeRepo.name : ''}
                </span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-56">
              <DropdownMenuItem
                className="cursor-pointer gap-2"
                onClick={handleRepoInfo}
                disabled={!activeRepo}
              >
                <Info className="h-4 w-4" />
                Repo Info
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer gap-2"
                onClick={handlePinRepo}
                disabled={!activeRepo}
              >
                <Pin className="h-4 w-4" />
                {activeRepo?.isPinned ? 'Unpin Repo' : 'Pin Repo'}
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer gap-2"
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
                className="cursor-pointer gap-2"
                onClick={handleRepoStructure}
                disabled={!activeRepo}
              >
                <FolderTree className="h-4 w-4" />
                Repo File Structure
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer gap-2"
                onClick={handleClearChat}
                disabled={!activeRepo}
              >
                <XCircle className="h-4 w-4" />
                Clear Chat
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer gap-2 text-red-600 dark:text-red-400"
                onClick={handleDeleteRepo}
                disabled={!activeRepo}
              >
                <Trash2 className="h-4 w-4" />
                Delete Chat
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {showSummaryPanel && activeRepo && (
            <div className="repo-summary-panel mt-2 w-[min(520px,90vw)] rounded-lg border border-border bg-popover p-4 text-sm shadow-xl">
              <div className="mb-2 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 font-medium">
                  <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  Repository Summary
                </div>
                <Button
                  variant="ghost"
                  className="h-7 px-2 text-xs"
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
                  {repoSummaryErrorValue instanceof Error
                    ? repoSummaryErrorValue.message
                    : 'Failed to summarize repository.'}
                </div>
              )}
              {!repoSummaryLoading && !repoSummaryError && repoSummary?.summary && (
                <p className="max-h-64 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                  {repoSummary.summary}
                </p>
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
      )}

      <div className="flex items-center gap-3">
        {!user ? (
          <>
            <Button
              onClick={handleGithubLogin}
              className="bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white"
            >
              Sign up with GitHub
            </Button>
            <AnimatedThemeToggler />
          </>
        ) : (
          <div />
        )}
      </div>
    </nav>
  );
}
