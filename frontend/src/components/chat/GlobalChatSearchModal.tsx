import { AnimatePresence, motion } from 'motion/react';
import { Loader2, Search, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '../ui/input';
import { useMessageSearch } from '../../features/chat/chat.hooks';

type GlobalChatSearchModalProps = {
  open: boolean;
  onClose: () => void;
};

function formatTime(iso: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(iso));
}

function getSnippet(content: string, query: string, maxLength = 140) {
  const normalized = content.replace(/\s+/g, ' ').trim();
  if (!normalized) return '';
  if (!query.trim()) return normalized.slice(0, maxLength);

  const lower = normalized.toLowerCase();
  const needle = query.trim().toLowerCase();
  const matchIndex = lower.indexOf(needle);
  if (matchIndex < 0) return normalized.slice(0, maxLength);

  const start = Math.max(0, matchIndex - 36);
  const end = Math.min(normalized.length, matchIndex + needle.length + 64);
  const snippet = normalized.slice(start, end);
  return start > 0 ? `...${snippet}` : snippet;
}

function renderHighlightedSnippet(content: string, query: string) {
  if (!query.trim()) return content;
  const pattern = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'ig');
  const parts = content.split(pattern);
  return parts.map((part, index) =>
    index % 2 === 1 ? (
      <mark
        key={`${part}-${index}`}
        className="rounded bg-sky-100 px-2 py-2 text-slate-900 dark:bg-sky-500/25 dark:text-slate-100"
      >
        {part}
      </mark>
    ) : (
      <span key={`${part}-${index}`}>{part}</span>
    )
  );
}

export default function GlobalChatSearchModal({ open, onClose }: GlobalChatSearchModalProps) {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const { data: results = [], isFetching, isError, error } = useMessageSearch(query, open);

  useEffect(() => {
    if (!open) return;
    const timeout = window.setTimeout(() => inputRef.current?.focus(), 80);
    return () => window.clearTimeout(timeout);
  }, [open]);

  useEffect(() => {
    if (!open) setQuery('');
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [open, onClose]);

  const trimmed = query.trim();
  const showIdle = trimmed.length < 2;
  const showEmpty = !showIdle && !isFetching && !isError && results.length === 0;
  const errorMessage = useMemo(() => {
    if (!isError) return '';
    if (error instanceof Error) return error.message;
    return 'Failed to search messages.';
  }, [isError, error]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-start justify-center bg-slate-950/30 px-4 pt-[10vh] backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) onClose();
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 14, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.985 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900"
          >
            <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-3 dark:border-slate-700">
              <Search className="h-6 w-6 text-slate-500" />
              <Input
                ref={inputRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search all chats..."
                className="h-9 border-0 bg-transparent pl-3 shadow-none focus-visible:ring-0"
              />
              <button
                type="button"
                onClick={onClose}
                className="rounded-md p-1 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="max-h-[62vh] overflow-y-auto p-2">
              {showIdle && (
                <div className="px-3 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                  Type at least 2 characters to search messages.
                </div>
              )}
              {isFetching && (
                <div className="flex items-center justify-center gap-2 py-8 text-sm text-slate-500 dark:text-slate-400">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Searching messages...
                </div>
              )}
              {isError && (
                <div className="mx-2 my-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
                  {errorMessage}
                </div>
              )}
              {showEmpty && (
                <div className="px-3 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                  No results found.
                </div>
              )}
              {!showIdle &&
                !isFetching &&
                !isError &&
                results.map((result) => {
                  const snippet = getSnippet(result.content, trimmed);
                  return (
                    <button
                      key={result._id}
                      type="button"
                      className="w-full rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
                      onClick={() => {
                        onClose();
                        navigate(`/chat/${result.chatId}?highlight=${result._id}`);
                      }}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">
                          {result.repoName}
                        </p>
                        <p className="shrink-0 text-xs text-slate-500 dark:text-slate-400">
                          {formatTime(result.createdAt)}
                        </p>
                      </div>
                      <p className="mt-1 max-h-11 overflow-hidden text-sm text-slate-600 dark:text-slate-300">
                        {renderHighlightedSnippet(snippet, trimmed)}
                      </p>
                    </button>
                  );
                })}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
