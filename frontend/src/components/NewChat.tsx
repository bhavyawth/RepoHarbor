import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Loader2, Plus } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { useRegisterRepo } from '../features/repo/repos.hooks';
import { useChatStore } from '../store/chat.store';
import FloatingBlob from './FloatingBlob';
import { normalizeRepoInput } from '../lib/repo-input';
import { getErrorMessage } from '../lib/getErrorMessage';

export default function NewChat() {
  const navigate = useNavigate();
  const [repoUrl, setRepoUrl] = useState('');
  const [repoBranch, setRepoBranch] = useState('');
  const [repoUrlFocused, setRepoUrlFocused] = useState(false);
  const [repoBranchFocused, setRepoBranchFocused] = useState(false);
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

  const processRegistration = async (url: string, branch: string) => {
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
        branch: branch.trim(),
      });
      addChat(chat);
      setActiveChatId(chat._id);
      navigate(`/chat/${chat._id}`);
    } catch (err) {
      setError(getErrorMessage(err));
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
    const pendingBranch = localStorage.getItem('pendingRepoBranch');
    if (pendingUrl) {
      localStorage.removeItem('pendingRepoUrl');
      localStorage.removeItem('pendingRepoBranch');
      processRegistration(pendingUrl, pendingBranch ?? '');
    }
  }, []);

  return (
    <section className="relative isolate mx-auto flex h-full w-full min-h-0 items-center justify-center overflow-x-hidden px-4 py-8 sm:px-6 sm:py-10 lg:px-10">
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="sm:hidden opacity-75">
          <FloatingBlob numberOfBlobs={4} />
        </div>
        <div className="hidden sm:block">
          <FloatingBlob numberOfBlobs={4} />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(100,116,139,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(100,116,139,0.08)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_75%_55%_at_50%_35%,#000_55%,transparent_100%)] dark:bg-[linear-gradient(to_right,rgba(148,163,184,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.12)_1px,transparent_1px)]" />
      </div>

      <div className="relative z-10 w-full max-w-6xl min-w-0">
        <div className="mx-auto w-full max-w-4xl text-center">
          <h1 className="break-words text-3xl font-semibold leading-tight text-slate-900 dark:text-slate-100 sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl">
            {welcomeHeadline}
          </h1>
        </div>

        <form
          onSubmit={handleCreateChat}
          className="mx-auto mt-6 w-full max-w-2xl rounded-2xl border border-slate-200/80 bg-white/95 p-4 shadow-[0_16px_40px_-24px_rgba(15,23,42,0.35)] backdrop-blur-sm sm:mt-8 sm:p-6 dark:border-slate-800 dark:bg-slate-950/85 dark:shadow-[0_16px_40px_-24px_rgba(0,0,0,0.8)]"
        >
          <div className="mb-4 text-center sm:text-left">
            <h2 className="break-words text-sm font-medium text-slate-900 dark:text-slate-100 sm:text-base">
              Use any public GitHub repository URL.
            </h2>
          </div>

          <div className="flex flex-col gap-3 md:flex-row md:items-stretch md:gap-2.5">
            <div className="w-full min-w-0 md:flex-1">
              <Input
                id="repo-url"
                value={repoUrl}
                onChange={(e) => {
                  setRepoUrl(e.target.value);
                  if (error) setError('');
                }}
                onFocus={() => setRepoUrlFocused(true)}
                onBlur={() => setRepoUrlFocused(false)}
                placeholder="https://github.com/owner/repository"
                disabled={isCreating}
                className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-800 placeholder:text-slate-300 shadow-none transition-all duration-200 focus-visible:bg-white disabled:opacity-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-600 dark:focus-visible:bg-slate-800 sm:h-12"
                style={{
                  borderColor: repoUrlFocused ? 'rgba(99,102,241,0.5)' : undefined,
                  boxShadow: repoUrlFocused
                    ? '0 0 0 3px rgba(99,102,241,0.2), 0 20px 60px -12px rgba(129,140,248,0.25)'
                    : undefined,
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                }}
              />
            </div>

            <Input
              id="repo-branch"
              value={repoBranch}
              onChange={(e) => {
                setRepoBranch(e.target.value);
                if (error) setError('');
              }}
              onFocus={() => setRepoBranchFocused(true)}
              onBlur={() => setRepoBranchFocused(false)}
              placeholder="branch"
              disabled={isCreating}
              className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-800 placeholder:text-slate-300 shadow-none transition-all duration-200 focus-visible:bg-white disabled:opacity-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-600 dark:focus-visible:bg-slate-800 sm:h-12 md:w-28"
              style={{
                borderColor: repoBranchFocused ? 'rgba(99,102,241,0.5)' : undefined,
                boxShadow: repoBranchFocused
                  ? '0 0 0 3px rgba(99,102,241,0.2), 0 20px 60px -12px rgba(129,140,248,0.25)'
                  : undefined,
                transition: 'border-color 0.2s, box-shadow 0.2s',
              }}
            />

            <Button
              type="submit"
              disabled={isCreating}
              className="h-11 w-full gap-2 rounded-2xl bg-slate-900 px-5 text-sm font-semibold text-white transition-all transform-gpu duration-150 hover:scale-[1.02] active:scale-[0.98] disabled:scale-100 hover:bg-slate-700 hover:shadow-lg hover:shadow-slate-900/20 disabled:opacity-60 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 dark:hover:shadow-white/10 sm:h-12 md:w-auto"
            >
              {isCreating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Creating...</span>
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

          <p className="mt-3 break-words text-xs text-slate-500 dark:text-slate-400">
            Example:{' '}
            <span className="font-mono text-slate-700 dark:text-slate-300">
              https://github.com/vercel/next.js | main
            </span>
          </p>
        </form>
      </div>
    </section>
  );
}
