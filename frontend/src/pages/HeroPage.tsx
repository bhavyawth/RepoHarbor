import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { Github, ArrowRight, Zap, Brain, Lock, Code2, MessageSquare, Search, Loader2, GitBranch, Sparkles } from 'lucide-react';
import FloatingBlob from '../components/FloatingBlob';
import { TypingAnimation } from '../components/ui/typing-animation';
import HeroVisual from '../components/HeroVisual';
import { useNavigate } from 'react-router-dom';
import { useChatStore } from '../store/chat.store';
import { useRegisterRepo } from '../features/repo/repos.hooks';
import { useState, useRef, type FormEvent, useEffect } from 'react';
import { normalizeRepoInput } from '../lib/repo-input';
import { getErrorMessage } from '../lib/getErrorMessage';

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
    description: "Chat naturally with your code. Ask questions like you would to a senior developer.",
  },
  {
    icon: Search,
    title: 'Semantic Code Search',
    description: "Find code by describing what it does, not what it's named. Skip the grep.",
  },
];

const demoMessages = [
  { role: 'user', content: 'How does authentication work in this repo?', delay: 0 },
  { role: 'ai', content: 'This repository uses JWT-based authentication with refresh tokens. The flow starts in `auth/middleware.ts` — access tokens expire in 15 minutes, and refresh tokens are stored as httpOnly cookies for security.', delay: 0.6 },
  { role: 'user', content: 'Where are the refresh tokens stored?', delay: 1.2 },
];

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-purple-400"
          style={{ animation: 'typingBounce 1.2s ease-in-out infinite', animationDelay: `${i * 0.2}s` }}
        />
      ))}
    </div>
  );
}

export default function Hero() {
  const [repoUrl, setRepoUrl] = useState('');
  const [repoBranch, setRepoBranch] = useState('');
  const [urlFocused, setUrlFocused] = useState(false);
  const [branchFocused, setBranchFocused] = useState(false);
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const { addChat, setActiveChatId } = useChatStore();
  const registerRepoMutation = useRegisterRepo();
  const topRef = useRef<HTMLDivElement>(null);
  const [showTyping, setShowTyping] = useState(false);

  const handleGithubLogin = () => {
    window.location.href = `http://localhost:3000/api/auth/github`;
  };

  const handleCreateChat = async (e: FormEvent) => {
    e.preventDefault();
    const { repoUrl: normalizedRepoUrl, error: validationError } = normalizeRepoInput(repoUrl);
    if (validationError || !normalizedRepoUrl) {
      setError(validationError ?? 'Enter a valid GitHub URL or owner/repo.');
      return;
    }
    setError('');
    try {
      await axios.get('http://localhost:3000/api/auth/me', { withCredentials: true });
      const chat = await registerRepoMutation.mutateAsync({
        repoUrl: normalizedRepoUrl,
        branch: repoBranch.trim() || 'main',
      });
      addChat(chat);
      setActiveChatId(chat._id);
      navigate(`/chat/${chat._id}`);
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 401) {
        localStorage.setItem('pendingRepoUrl', normalizedRepoUrl);
        localStorage.setItem('pendingRepoBranch', repoBranch.trim() || 'main');
        window.location.href = 'http://localhost:3000/api/auth/github';
        return;
      }
      setError(getErrorMessage(err, 'Failed to create chat. Please check the repository and try again.'));
    }
  };

  const handleScrollToTop = () => {
    topRef.current?.scrollIntoView({ behavior: 'instant' });
    const t = setTimeout(() => setShowTyping(true), 2800);
    return () => clearTimeout(t);
  }

  useEffect(() => {
    handleScrollToTop();
  }, []);

  const isFormActive = urlFocused || branchFocused || !!repoUrl || !!repoBranch;

  return (
    <div className="relative min-h-screen w-full bg-white dark:bg-black overflow-x-hidden">
      <style>{`
        @keyframes typingBounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-4px); opacity: 1; }
        }
      `}</style>
      <div ref={topRef} id="topdiv" />
      <FloatingBlob />
      {/* Backgrounds */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-50/50 via-transparent to-blue-50/30 dark:from-purple-950/10 dark:via-transparent dark:to-blue-950/10 pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)] pointer-events-none" />
      {/* ── Hero ── */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-32 pb-16 sm:pb-24">
        <div className="text-center max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2.5 rounded-full bg-purple-100 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 text-xs sm:text-sm font-medium mb-5 sm:mb-6 border border-purple-200 dark:border-purple-800"
            >
              <Code2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span>AI-Powered Code Understanding</span>
            </motion.div>
            {/* Heading */}
            <h1 className="text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight mb-4 lg:mb-6 xl:mb-6 w-full break-words">
              <span className="block">Chat with your</span>
              <span className="block bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent w-full">
                <TypingAnimation
                  words={[
                    "GitHub repository",
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
                  className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent"
                />
              </span>
              <span className="block">using AI.</span>
            </h1>
            <p className="text-base sm:text-xl text-slate-600 dark:text-slate-400 mb-8 sm:mb-12 max-w-2xl mx-auto leading-relaxed px-2 sm:px-0">
              Paste a GitHub URL. Ask questions. Get instant answers from your codebase with advanced RAG technology.
            </p>
            {/* ── Input Form ── */}
            <form onSubmit={handleCreateChat} className="w-full max-w-3xl mx-auto mb-5 sm:mb-6">
              {/* Mobile: stacked */}
              <div className="flex flex-col sm:hidden gap-3">
                <div
                  className="flex items-center gap-3 px-4 py-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-[box-shadow,border-color] duration-200"
                  style={{
                    borderColor: urlFocused ? 'rgba(147,51,234,0.5)' : undefined,
                    boxShadow: urlFocused
                      ? '0 0 0 3px rgba(147,51,234,0.2), 0 20px 60px -12px rgba(147,51,234,0.25)'
                      : undefined,
                  }}
                >
                  <Github className={`w-4 h-4 shrink-0 transition-colors duration-200 ${urlFocused || repoUrl ? 'text-purple-500' : 'text-slate-400'}`} />
                  <input
                    type="text"
                    value={repoUrl}
                    onChange={(e) => { setRepoUrl(e.target.value); if (error) setError(''); }}
                    onFocus={() => setUrlFocused(true)}
                    onBlur={() => setUrlFocused(false)}
                    placeholder="github.com/owner/repository"
                    className="flex-1 min-w-0 bg-transparent border-none outline-none text-slate-900 dark:text-white placeholder:text-slate-400 text-sm"
                  />
                </div>
                <div
                  className="flex items-center gap-3 px-4 py-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-[box-shadow,border-color] duration-200"
                  style={{
                    borderColor: branchFocused ? 'rgba(147,51,234,0.5)' : undefined,
                    boxShadow: branchFocused
                      ? '0 0 0 3px rgba(147,51,234,0.2), 0 20px 60px -12px rgba(147,51,234,0.25)'
                      : undefined,
                  }}
                >
                  <GitBranch className={`w-4 h-4 shrink-0 transition-colors duration-200 ${branchFocused || repoBranch ? 'text-purple-500' : 'text-slate-400'}`} />
                  <input
                    type="text"
                    value={repoBranch}
                    onChange={(e) => { setRepoBranch(e.target.value); if (error) setError(''); }}
                    onFocus={() => setBranchFocused(true)}
                    onBlur={() => setBranchFocused(false)}
                    placeholder="branch"
                    className="flex-1 min-w-0 bg-transparent border-none outline-none text-slate-900 dark:text-white placeholder:text-slate-400 text-sm"
                  />
                </div>
                <button
                  type="submit"
                  disabled={registerRepoMutation.isPending}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold text-sm rounded-xl transition-all transform-gpu duration-150 hover:scale-[1.02] active:scale-[0.98] disabled:scale-100 disabled:opacity-60 disabled:cursor-not-allowed shadow-md"
                >
                  {registerRepoMutation.isPending ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /><span>Creating…</span></>
                  ) : (
                    <><span>Start Chatting</span><ArrowRight className="w-4 h-4" /></>
                  )}
                </button>
              </div>
              {/* Desktop: single-line pill */}
              <div className="hidden sm:block">
                <motion.div
                  animate={{
                    boxShadow: isFormActive
                      ? '0 0 0 3px rgba(147,51,234,0.2), 0 20px 60px -12px rgba(147,51,234,0.25)'
                      : '0 4px 24px -4px rgba(0,0,0,0.15)',
                  }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-2 p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/60 rounded-full"
                  style={{ borderColor: isFormActive ? 'rgba(147,51,234,0.5)' : undefined }}
                >
                  {/* URL input */}
                  <div className="flex items-center gap-2.5 flex-1 min-w-0 pl-4">
                    <Github className={`w-4 h-4 shrink-0 transition-colors duration-200 ${urlFocused || repoUrl ? 'text-purple-500' : 'text-slate-400'}`} />
                    <input
                      type="text"
                      value={repoUrl}
                      onChange={(e) => { setRepoUrl(e.target.value); if (error) setError(''); }}
                      onFocus={() => setUrlFocused(true)}
                      onBlur={() => setUrlFocused(false)}
                      placeholder="github.com/owner/repository"
                      className="flex-1 min-w-0 bg-transparent border-none outline-none text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm"
                    />
                  </div>
                  {/* Divider */}
                  <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 shrink-0" />
                  {/* Branch input */}
                  <div className="flex items-center gap-2.5 w-44 pl-3">
                    <GitBranch className={`w-4 h-4 shrink-0 transition-colors duration-200 ${branchFocused || repoBranch ? 'text-purple-500' : 'text-slate-400'}`} />
                    <input
                      type="text"
                      value={repoBranch}
                      onChange={(e) => { setRepoBranch(e.target.value); if (error) setError(''); }}
                      onFocus={() => setBranchFocused(true)}
                      onBlur={() => setBranchFocused(false)}
                      placeholder="branch"
                      className="w-full bg-transparent border-none outline-none text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm"
                    />
                  </div>
                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={registerRepoMutation.isPending}
                    className="group/btn shrink-0 inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold text-sm rounded-full transition-all transform-gpu duration-150 hover:scale-[1.02] active:scale-[0.98] disabled:scale-100 disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    {registerRepoMutation.isPending ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /><span>Creating…</span></>
                    ) : (
                      <><span>Start Chatting</span><ArrowRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform duration-150" /></>
                    )}
                  </button>
                </motion.div>
              </div>
              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                    className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300"
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
            {/* Trust badges */}
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                <span>Free for public repos</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                <span>Chat like you're pair-programming</span>
              </div>
            </div>
          </motion.div>
        </div>
        {/* ── Demo Chat ── */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-14 sm:mt-20 max-w-5xl mx-auto"
        >
          <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl bg-white dark:bg-slate-900">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-blue-500/5 pointer-events-none" />
            {/* Browser chrome */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-sm">
              <div className="flex gap-1.5 shrink-0">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-3 py-1 text-xs text-slate-500 dark:text-slate-400 font-mono max-w-[180px] w-full justify-center">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse shrink-0" />
                  <span className="truncate">repoharbor</span>
                </div>
              </div>
            </div>
            {/* Chat messages */}
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
              {demoMessages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.6 + msg.delay }}
                  className={`flex gap-2 sm:gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  {msg.role === 'user' ? (
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 shrink-0 flex items-center justify-center text-white text-xs font-bold">
                      Y
                    </div>
                  ) : (
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 shrink-0 flex items-center justify-center">
                      <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                    </div>
                  )}
                  <div className={`flex flex-col gap-1 max-w-[80%] sm:max-w-[75%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <span className="text-[10px] sm:text-[11px] font-medium text-slate-400 dark:text-slate-500 px-1">
                      {msg.role === 'user' ? 'You' : 'RepoHarbor AI'}
                    </span>
                    {msg.role === 'user' ? (
                      <div className="bg-gradient-to-br from-purple-600 to-blue-600 text-white rounded-2xl rounded-tr-sm px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm leading-relaxed shadow-sm">
                        {msg.content}
                      </div>
                    ) : (
                      <div className="bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl rounded-tl-sm px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed shadow-sm">
                        {msg.content}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
              {/* Typing indicator */}
              <AnimatePresence>
                {showTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex gap-2 sm:gap-3"
                  >
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 shrink-0 flex items-center justify-center">
                      <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                    </div>
                    <div className="flex flex-col gap-1 items-start">
                      <span className="text-[10px] sm:text-[11px] font-medium text-slate-400 dark:text-slate-500 px-1">RepoHarbor AI</span>
                      <div className="bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl rounded-tl-sm shadow-sm">
                        <TypingIndicator />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
      {/* ── Features ── */}
      <div className="relative z-10 max-w-7xl mx-auto my-0 px-4 sm:px-5 lg:px-8 py-16 sm:py-16 border-t border-slate-200 dark:border-slate-800 scroll-mt-24 sm:scroll-mt-16" id="features">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 sm:mb-16"
        >
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-3 sm:mb-4">
            Built for developers who move fast
          </h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Stop searching through docs and README files. Get instant answers from your codebase.
          </p>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-700 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-950/50 dark:to-blue-950/50 flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-200">
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white mb-1.5 sm:mb-2">
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
      {/* ── CTA ── */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-12 sm:pb-16 my-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-purple-800 to-blue-900 p-6 sm:p-8 lg:p-10"
        >
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#fff2_1px,transparent_1px),linear-gradient(to_bottom,#fff2_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
          <div className="relative z-10 grid items-center gap-6 lg:grid-cols-2">
            <div className="text-center lg:text-left">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3">
                Ready to chat with your code?
              </h2>
              <p className="text-sm sm:text-base text-purple-100 mb-5 sm:mb-6 max-w-2xl mx-auto lg:mx-0">
                Join developers who are already using RepoHarbor to understand codebases faster.
              </p>
              <button
                onClick={handleGithubLogin}
                className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-white text-purple-600 rounded-lg font-semibold text-sm sm:text-base hover:bg-purple-50 transition-all transform-gpu duration-150 hover:scale-[1.02] active:scale-[0.98] shadow-xl"
              >
                <Github className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                Get Started with GitHub
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
              </button>
            </div>
            <HeroVisual />
          </div>
        </motion.div>
      </div>
    </div>
  );
}