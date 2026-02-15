import { useMemo, useState, type FormEvent } from 'react';
// import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Loader2, Plus } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { useRegisterRepo } from '../features/repo/repos.hooks';
import { useChatStore } from '../store/chat.store';
import FloatingBlob from './FloatingBlob';

export default function NewChat() {
  const navigate = useNavigate();
  const [repoUrl, setRepoUrl] = useState('');
  const [error, setError] = useState('');
  const { addChat, setActiveChatId } = useChatStore();
  const registerRepoMutation = useRegisterRepo();
  const welcomeHeadline = useMemo(() => {
    const phrases = [
      "Hey — what are you building today?",
      "What repo are we diving into?",
      "Paste a repo and let’s explore.",
      "Ready to understand some code?",
      "What would you like to analyze?",
      "Let’s crack open a repository.",
      "Drop a GitHub link to get started.",
      "What are you looking for?",
      "Time to explore some code.",
      "Hi — what should we dive into today?",
    ];
    return phrases[Math.floor(Math.random() * phrases.length)];
  }, []);

  const handleCreateChat = async (e: FormEvent) => {
    e.preventDefault();
    const url = repoUrl.trim();
    if (!url) {
      setError('Repository URL is required.');
      return;
    }
    setError('');
    try {
      const chat = await registerRepoMutation.mutateAsync({ repoUrl: url });
      addChat(chat);
      setActiveChatId(chat._id);
      navigate(`/chat/${chat._id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create chat.');
    }
  };

  return (
    <div className="relative mx-auto flex h-full w-full items-center justify-center px-6">
      <div className="pointer-events-none absolute inset-0 z-0 w-full">
        <FloatingBlob />
      </div>
      <div className="relative z-10 w-full max-w-2xl">
        <h1 className="mb-4 text-center max-w-full text-6xl font-semibold pb-4">
          {welcomeHeadline}
        </h1>
        <form
          onSubmit={handleCreateChat}
          className="w-full space-y-4 rounded-4xl border border-border bg-card p-6 shadow-sm"
        >
        <div>
          <h2 className="text-xl font-semibold">Create New Chat</h2>
          <p className="text-sm text-muted-foreground">
            Enter a GitHub repository URL to start a new chat.
          </p>
        </div>
        <Input
          value={repoUrl}
          onChange={(e) => setRepoUrl(e.target.value)}
          placeholder="https://github.com/owner/repo"
          disabled={registerRepoMutation.isPending}
        />
        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
            {error}
          </div>
        )}
        <Button
          type="submit"
          className="w-full bg-linear-to-r from-purple-600 to-blue-600 text-white hover:from-purple-500 hover:to-blue-500"
          disabled={registerRepoMutation.isPending}
        >
          {registerRepoMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Plus className="mr-2 h-4 w-4" />
              Create Chat
            </>
          )}
        </Button>
        </form>
      </div>
    </div>
  );
}
