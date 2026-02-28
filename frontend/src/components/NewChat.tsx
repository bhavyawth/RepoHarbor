import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Github, Loader2, Plus } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { useRegisterRepo } from '../features/repo/repos.hooks';
import { useChatStore } from '../store/chat.store';
import FloatingBlob from './FloatingBlob';
import { normalizeRepoInput } from '../lib/repo-input';

export default function NewChat() {
  const navigate = useNavigate();
  const [repoUrl, setRepoUrl] = useState('');
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

const processRegistration = async (url: string) => {
  const { repoUrl: normalized, error: valError } = normalizeRepoInput(url);
  if (valError || !normalized) {
    setError(valError ?? 'Enter a valid GitHub URL.');
    setRepoUrl(url); 
    return;
  }
  setError('');
  setIsCreating(true);
  try {
    const chat = await registerRepoMutation.mutateAsync({ repoUrl: normalized });
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
  processRegistration(repoUrl);
};

useEffect(() => {
  const pendingUrl = localStorage.getItem('pendingRepoUrl');
  if (pendingUrl) {
    localStorage.removeItem('pendingRepoUrl');
    processRegistration(pendingUrl);
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

          <label htmlFor="repo-url" className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Repository URL
          </label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Github className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                id="repo-url"
                value={repoUrl}
                onChange={(e) => {
                  setRepoUrl(e.target.value);
                  if (error) setError('');
                }}
                placeholder="https://github.com/owner/repository"
                disabled={isCreating}
                className="h-11 rounded-xl border-slate-300 bg-white pl-9 text-sm shadow-none focus-visible:border-slate-400 focus-visible:ring-2 focus-visible:ring-slate-300/60 dark:border-slate-700 dark:bg-slate-900 dark:focus-visible:border-slate-500 dark:focus-visible:ring-slate-700/70"
              />
            </div>
            <Button
              type="submit"
              className="h-11 rounded-xl bg-slate-900 px-5 text-sm font-medium text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
              disabled={isCreating}
            >
              {isCreating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Create Chat
                  <ArrowRight className="h-4 w-4 opacity-80" />
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
            Example: <span className="font-mono text-slate-700 dark:text-slate-300">https://github.com/vercel/next.js</span>
          </p>
        </form>
      </div>
    </section>
  );
}
