import { motion } from 'framer-motion';
import axios from 'axios';
import { Github, ArrowRight, Zap, Brain, Lock, Code2, MessageSquare, Search } from 'lucide-react';
import FloatingBlob from '../components/FloatingBlob';
import { TypingAnimation } from '../components/ui/typing-animation';
import HeroVisual from '../components/HeroVisual';
import { useNavigate } from 'react-router-dom';
import { useChatStore } from '../store/chat.store';
import { useRegisterRepo } from '../features/repo/repos.hooks';
import { useState, type FormEvent } from 'react';
import { normalizeRepoInput } from '../lib/repo-input';

const features = [
  {
    icon: Brain,
    title: 'AI-Powered Understanding',
    description: 'Advanced RAG technology analyzes your entire codebase to provide contextual answers.',
  },
  {
    icon: Zap,
    title: 'Instant Indexing',
    description: 'Index any public repository in seconds. Start asking questions immediately.',
  },
  {
    icon: MessageSquare,
    title: 'Natural Conversations',
    description: 'Chat naturally with your code. Ask questions like you would to a senior developer.',
  },
  {
    icon: Search,
    title: 'Semantic Code Search',
    description: 'Find code by describing what it does, not what it\'s named. Skip the grep.',
  },
];

export default function Hero() {
  const [repoUrl, setRepoUrl] = useState('');
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const { addChat, setActiveChatId } = useChatStore();
  const registerRepoMutation = useRegisterRepo();

  const handleCreateChat = async (e: FormEvent) => {
    e.preventDefault();
    const { repoUrl: normalizedRepoUrl, error: validationError } = normalizeRepoInput(repoUrl);
    if (validationError || !normalizedRepoUrl) {
      setError(validationError ?? 'Enter a valid GitHub URL or owner/repo.');
      return;
    }
    setError("");
    try {
      await axios.get("http://localhost:3000/api/auth/me", {
        withCredentials: true,
      });
      const chat = await registerRepoMutation.mutateAsync({ repoUrl: normalizedRepoUrl });
      addChat(chat);
      setActiveChatId(chat._id);
      navigate(`/chat/${chat._id}`);
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 401) {
        localStorage.setItem("pendingRepoUrl", normalizedRepoUrl);
        window.location.href = "http://localhost:3000/api/auth/github";
        return;
      }
      setError(
        err instanceof Error && err.message
          ? err.message
          : "Failed to create chat. Please check the repository and try again."
      );
    }
  };


  return (
    <div className="relative min-h-screen bg-white dark:bg-black">
      <FloatingBlob />
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-50/50 via-transparent to-blue-50/30 dark:from-purple-950/10 dark:via-transparent dark:to-blue-950/10" />
      
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
      
      {/* Hero Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 pt-32 pb-24">
        <div className="text-center max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 text-sm font-medium mb-6 border border-purple-200 dark:border-purple-800">
              <Code2 className="w-4 h-4" />
              <span>AI-Powered Code Understanding</span>
            </div>

            <h1 className="text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight mb-6">
                Chat with your{' '}
                <span className="bg-linear-to-r min-w-[22ch] from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent inline-block">
                  <TypingAnimation
                    words={[
                      "GitHub repositories",
                      "Source code",
                      "Private projects",
                      "Codebase"
                    ]}
                    showCursor={true}
                    blinkCursor={true}
                    cursorStyle={'line'}
                    pauseDelay={2000}
                    loop
                    startOnView={false}
                    className="bg-linear-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent"
                  />
                </span>
                <p>{' '}using AI.</p>
              </h1>

            <p className="text-xl text-slate-600 dark:text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed">
              Paste a GitHub URL. Ask questions. Get instant answers from your codebase with advanced RAG technology.
            </p>

            {/* GitHub URL Input */}
            <form onSubmit={handleCreateChat} className="max-w-2xl mx-auto mb-6">
              <div className="relative group">
                <div className="flex gap-3 p-2 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-3 flex-1 px-4">
                    <Github className="w-5 h-5 text-slate-400 shrink-0" />
                    <input
                      type="text"
                      value={repoUrl}
                      onChange={(e) => {
                        setRepoUrl(e.target.value);
                        if (error) setError('');
                      }}
                      placeholder="https://github.com/owner/repository"
                      className="flex-1 bg-transparent border-none outline-none text-slate-900 dark:text-white placeholder:text-slate-400 text-base"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={registerRepoMutation.isPending}
                    className="group/btn px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-lg font-semibold transition-all flex items-center gap-2 shrink-0"
                  >
                    {registerRepoMutation.isPending ? (
                      'Creating...'
                    ) : (
                      <>
                        Start Chatting
                        <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </div>
                {error && (
                  <div className="mt-3 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
                    {error}
                  </div>
                )}
              </div>
            </form>

            <div className="flex items-center justify-center gap-6 text-sm text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                <span>Free for public repos</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                <span>Chat like you're pair-programming</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Demo Preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-20 max-w-5xl mx-auto"
        >
          <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl bg-white dark:bg-slate-900">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-blue-500/5" />
            
            {/* Browser chrome */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <div className="flex-1 text-center text-sm text-slate-500 dark:text-slate-400 font-mono">
                repoharbor.com
              </div>
            </div>

            {/* Mock chat interface */}
            <div className="p-8 space-y-6">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="text-sm font-medium text-slate-900 dark:text-white">You</div>
                  <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl rounded-tl-sm px-4 py-3 text-slate-900 dark:text-white">
                    How does authentication work in this repo?
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shrink-0">
                  <Brain className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="text-sm font-medium text-slate-900 dark:text-white">RepoHarbor AI</div>
                  <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30 rounded-2xl rounded-tl-sm px-4 py-3 text-slate-900 dark:text-white border border-purple-100 dark:border-purple-900/30">
                    This repository uses JWT-based authentication with refresh tokens...
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Features Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-24 border-t border-slate-200 dark:border-slate-800 scroll-mt-24"
      id='features'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Built for developers who move fast
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Stop searching through docs and README files. Get instant answers from your codebase.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-700 transition-all hover:shadow-lg"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-950/50 dark:to-blue-950/50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Icon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-8 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-800 to-blue-900 p-8 lg:p-10"
        >
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#fff2_1px,transparent_1px),linear-gradient(to_bottom,#fff2_1px,transparent_1px)] bg-[size:32px_32px]" />
          <div className="relative z-10 grid items-center gap-6 lg:grid-cols-2">
            <div className="text-center lg:text-left">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">
                Ready to chat with your code?
              </h2>
              <p className="text-base text-purple-100 mb-6 max-w-2xl mx-auto lg:mx-0">
                Join developers who are already using RepoHarbor to understand codebases faster.
              </p>
              <button
                onClick={() => window.location.href = "http://localhost:3000/api/auth/github"}
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-purple-600 rounded-lg font-semibold hover:bg-purple-50 transition-all shadow-xl"
              >
                <Github className="w-5 h-5" />
                Get Started with GitHub
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
            <HeroVisual />
          </div>
        </motion.div>
      </div>
    </div>
  );
}     
