import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Loader2, Plus } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { useRegisterRepo } from '../features/repo/repos.hooks';
import { useChatStore } from '../store/chat.store';
import FloatingBlob from './FloatingBlob';
import { normalizeRepoInput } from '../lib/repo-input';

export default function NewChat() {
  const navigate = useNavigate();
  const [repoUrl, setRepoUrl] = useState('');
  const [repoBranch, setRepoBranch] = useState('');
  const [error, setError] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const { addChat, setActiveChatId } = useChatStore();
  const registerRepoMutation = useRegisterRepo();
  const welcomeHeadline = useMemo(() => {
    const phrases = [
      'Hey - what are you building today?',
      'What repo are we diving into?',
      "Paste a repo and let's explore.",
      'Ready to understand some code?',
      'What would you like to analyze?',
      "Let's crack open a repository.",
      'Drop a GitHub link to get started.',
      'Which project has your curiosity today?',
      'Time to explore some code.',
      'Hi - what should we dive into today?',
    ];
    return phrases[Math.floor(Math.random() * phrases.length)];
  }, []);

const processRegistration = async (url: string, branch: string = "main") => {
  const { repoUrl: normalized, error: valError } = normalizeRepoInput(url);
  if (valError || !normalized) {
    setError(valError ?? 'Enter a valid GitHub URL.');
    setRepoUrl(url); 
    return;
  }
  setError('');
  setIsCreating(true);
  try {
    const chat = await registerRepoMutation.mutateAsync({
      repoUrl: normalized,
      branch: branch.trim() || "main",
    });
    addChat(chat);
    setActiveChatId(chat._id);
    navigate(`/chat/${chat._id}`);
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Failed to create chat.');
  } finally {
    setIsCreating(false);
  }
};

const handleCreateChat = (e: FormEvent) => {
  e.preventDefault();
  const trimmedInput = repoUrl.trim();
  processRegistration(trimmedInput, repoBranch);
};

useEffect(() => {
  const pendingUrl = localStorage.getItem('pendingRepoUrl');
  const pendingBranch = localStorage.getItem('pendingRepoBranch') ?? 'main';
  if (pendingUrl) {
    localStorage.removeItem('pendingRepoUrl');
    localStorage.removeItem('pendingRepoBranch');
    processRegistration(pendingUrl, pendingBranch);
  }
}, []);

  return (
    <section className="relative isolate mx-auto flex h-full w-full items-center justify-center px-6 py-10 sm:px-8 lg:px-10">
      <FloatingBlob numberOfBlobs={4}/>
      <div className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(to_right,rgba(100,116,139,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(100,116,139,0.08)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_75%_55%_at_50%_35%,#000_55%,transparent_100%)] dark:bg-[linear-gradient(to_right,rgba(148,163,184,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.12)_1px,transparent_1px)]" />

      <div className="relative z-10 w-full max-w-6xl">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-semibold leading-tight text-slate-900 dark:text-slate-100">
            {welcomeHeadline}
          </h1>
        </div>

        <form
          onSubmit={handleCreateChat}
          className="mx-auto mt-8 w-full max-w-2xl rounded-2xl border border-slate-200/80 bg-white/95 p-5 shadow-[0_16px_40px_-24px_rgba(15,23,42,0.35)] backdrop-blur-sm sm:p-6 dark:border-slate-800 dark:bg-slate-950/85 dark:shadow-[0_16px_40px_-24px_rgba(0,0,0,0.8)]"
        >
          <div className="mb-4">
            <h2 className="text-lg font-mono text-slate-900 dark:text-slate-100">Use any public GitHub repository URL.</h2>
          </div>

          <div className="flex gap-2.5">
            {/* URL input */}
            <div className="relative flex-1">
              <Input
                id="repo-url"
                value={repoUrl}
                onChange={(e) => {
                  setRepoUrl(e.target.value);
                  if (error) setError('');
                }}
                placeholder="https://github.com/owner/repository"
                disabled={isCreating}
                className="h-12 rounded-2xl border border-slate-200 bg-slate-50 pl-4 pr-4 text-sm text-slate-800 placeholder:text-slate-300 shadow-none transition-all duration-200 focus-visible:border-slate-400 focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-slate-100 disabled:opacity-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-600 dark:focus-visible:border-slate-600 dark:focus-visible:bg-slate-800 dark:focus-visible:ring-slate-800/60"
              />
            </div>

            {/* Branch input — fixed width */}
            <Input
              id="repo-branch"
              value={repoBranch}
              onChange={(e) => {
                setRepoBranch(e.target.value);
                if (error) setError('');
              }}
              placeholder="branch "
              disabled={isCreating}
              className="h-12 w-28 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-800 placeholder:text-slate-300 shadow-none transition-all duration-200 focus-visible:border-slate-400 focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-slate-100 disabled:opacity-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-600 dark:focus-visible:border-slate-600 dark:focus-visible:bg-slate-800 dark:focus-visible:ring-slate-800/60"
            />
            {/* Submit button */}
            <Button
              type="submit"
              disabled={isCreating}
              className="h-12 gap-2 rounded-2xl bg-slate-900 px-5 text-sm font-semibold text-white transition-all transform-gpu transition-transform duration-150 hover:scale-[1.02] active:scale-[0.98] disabled:scale-100 hover:bg-slate-700 hover:shadow-lg hover:shadow-slate-900/20 disabled:opacity-60 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 dark:hover:shadow-white/10"
            >
              {isCreating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Creating…</span>
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  <span>Create Chat</span>
                  <ArrowRight className="h-3.5 w-3.5 opacity-60" />
                </>
              )}
            </Button>
          </div>

          {error && (
            <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
              {error}
            </div>
          )}

          <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
            Example: <span className="font-mono text-slate-700 dark:text-slate-300">https://github.com/vercel/next.js | main</span>
          </p>
        </form>
      </div>
    </section>
  );
}
