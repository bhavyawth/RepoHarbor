import { useEffect, useMemo, useState, useRef, type FormEvent, type KeyboardEvent } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { useChatStore } from '../store/chat.store';
import { useGetRepos, useRepoIndexStatus, reposKeys } from '../features/repo/repos.hooks';
import { useQueryClient } from '@tanstack/react-query';
import { useChatHistory, useSendMessage } from '../features/chat/chat.hooks';
import { Button } from '../components/ui/button';
import ChatContainer from '../components/chat/ChatContainer';
import IndexingTerminal from '../components/chat/IndexingTerminal';
import { getErrorMessage } from '../lib/getErrorMessage';

export default function ChatPage() {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const { chats, setActiveChatId } = useChatStore();
  const { data: repos = [], isSuccess: reposLoaded } = useGetRepos();
  const [draftsByChatId, setDraftsByChatId] = useState<Record<string, string>>({});
  const [sendError, setSendError] = useState<string | null>(null);
  const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const message = chatId ? draftsByChatId[chatId] ?? '' : '';

  const activeChat = useMemo(
    () => chats.find((chat) => chat._id === chatId),
    [chats, chatId]
  );
  const { data: repoIndexStatus } = useRepoIndexStatus(chatId, true);
  const sendMessageMutation = useSendMessage(chatId ?? '');
  const { data: messages = [], isLoading: historyLoading } = useChatHistory(chatId ?? '', !!chatId);

  const indexStatus = repoIndexStatus?.indexStatus ?? activeChat?.indexStatus ?? 'idle';
  const isIndexing = indexStatus === 'running';
  const shouldShowIndexingTerminal = !!chatId && indexStatus === 'running';
  const isChatReady = indexStatus === 'done';
  const isInputDisabled = !isChatReady || isIndexing || sendMessageMutation.isPending;

  const setMessageForActiveChat = (nextMessage: string) => {
    if (!chatId) return;
    setDraftsByChatId((prev) => ({
      ...prev,
      [chatId]: nextMessage,
    }));
  };

  const submitMessage = async () => {
    if (!chatId || isInputDisabled) return;
    const currentChatId = chatId;
    const currentDraft = draftsByChatId[currentChatId] ?? '';
    const trimmedMessage = currentDraft.trim();
    if (!trimmedMessage) return;
    setSendError(null);
    setDraftsByChatId((prev) => ({
      ...prev,
      [currentChatId]: '',
    }));
    try {
      await sendMessageMutation.mutateAsync(trimmedMessage);
    } catch (error) {
      setDraftsByChatId((prev) => ({
        ...prev,
        [currentChatId]: trimmedMessage,
      }));
      setSendError(getErrorMessage(error, 'Failed to send message.'));
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await submitMessage();
  };

  const handleComposerKeyDown = async (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isInputDisabled && message.trim()) {
        await submitMessage();
      }
    }
  };

  useEffect(() => {
    if (chatId) setActiveChatId(chatId);
  }, [chatId, setActiveChatId]);

  useEffect(() => {
    if (!chatId || !reposLoaded) return;
    const existsInStore = chats.some((chat) => chat._id === chatId);
    const existsInRepos = repos.some((repo) => repo._id === chatId);
    if (existsInStore || existsInRepos) return;
    setActiveChatId(null);
    navigate('/chat/new', { replace: true });
  }, [chatId, chats, navigate, repos, reposLoaded, setActiveChatId]);

  useEffect(() => {
    setSendError(null);
  }, [chatId]);

  useEffect(() => {
    if (!chatId || !repoIndexStatus?.indexStatus) return;
    queryClient.invalidateQueries({ queryKey: reposKeys.list() });
    queryClient.invalidateQueries({ queryKey: reposKeys.detail(chatId) });
  }, [chatId, queryClient, repoIndexStatus?.indexStatus]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'instant' });
  }, [chatId, historyLoading]);

  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;
    input.style.height = '0px';
    const nextHeight = Math.min(Math.max(input.scrollHeight, 44), 148);
    input.style.height = `${nextHeight}px`;
  }, [message]);

  useEffect(() => {
    const highlightId = searchParams.get('highlight');
    if (!highlightId || messages.length === 0) return;
    const target = document.getElementById(`message-${highlightId}`);
    if (!target) return;
    setHighlightedMessageId(highlightId);
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    const timeout = window.setTimeout(() => {
      setHighlightedMessageId(null);
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete('highlight');
      setSearchParams(nextParams, { replace: true });
    }, 2000);

    return () => window.clearTimeout(timeout);
  }, [messages, searchParams, setSearchParams]);

  return (
    <div className="flex h-full flex-col bg-white dark:bg-black">
      <div className="flex-1 overflow-y-auto px-4 py-6 modern-scroll">
        <ChatContainer
          messages={messages}
          historyLoading={historyLoading}
          isChatReady={isChatReady}
          isThinking={sendMessageMutation.isPending}
          sendError={sendError}
          highlightedMessageId={highlightedMessageId}
          messagesEndRef={messagesEndRef}
        />
      </div>

      <div className="shrink-0 bg-white dark:bg-black p-4">
        <form onSubmit={handleSubmit} className="mx-auto w-full max-w-4xl">
          <div className="relative flex items-end gap-2 rounded-4xl border border-slate-200 bg-slate-50 px-4 py-2 shadow-sm transition-all focus-within:border-slate-300 focus-within:bg-white focus-within:shadow-md dark:border-slate-800 dark:bg-slate-950 dark:focus-within:border-slate-700 dark:focus-within:bg-slate-900">
            <textarea
              ref={inputRef}
              value={message}
              onChange={(e) => setMessageForActiveChat(e.target.value)}
              onKeyDown={handleComposerKeyDown}
              placeholder={isChatReady ? 'Ask about this repository...' : isIndexing
                ? 'Repository is being indexed. Chat will be available when indexing completes.'
                : 'Click "Index Repository" above to enable chat.'}
              disabled={isInputDisabled}
              rows={1}
              className="block w-full resize-none bg-transparent p-3.5 text-md leading-5 text-slate-900 outline-none placeholder:text-slate-500 disabled:cursor-not-allowed disabled:opacity-50 dark:text-slate-100 dark:placeholder:text-slate-500"
              style={{ minHeight: 24, maxHeight: 120 }}
            />
            <Button
              type="submit"
              disabled={isInputDisabled || !message.trim()}
              size="icon"
              className="h-10 w-10 shrink-0 my-auto rounded-full bg-slate-900 text-white transform-gpu transition-transform duration-150 hover:scale-[1.02] active:scale-[0.98] disabled:scale-100 disabled:bg-slate-300 disabled:text-slate-500 dark:bg-white dark:text-slate-900 dark:disabled:bg-slate-800 dark:disabled:text-slate-600"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-4 h-4"
              >
                <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
              </svg>
            </Button>
          </div>
        </form>
        <div className="mt-2 mx-auto w-full max-w-4xl text-xs text-slate-500 dark:text-slate-400 hidden lg:block text-center">
          <p>
            RepoHarbor may generate incorrect or incomplete responses. Always verify critical information from the original repository.
          </p>
        </div>
      </div>

      <AnimatePresence>
        {shouldShowIndexingTerminal && (
          <motion.div
            className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/25 backdrop-blur-[3px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
          >
            <motion.div
              initial={{ opacity: 0, y: 14, scale: 0.985 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.985 }}
              transition={{ duration: 0.22 }}
            >
              <IndexingTerminal
                key={chatId}
                repoId={chatId ?? ''}
                repoName={activeChat?.name}
                status={indexStatus}
                errorMessage={repoIndexStatus?.indexError ?? activeChat?.indexError}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
