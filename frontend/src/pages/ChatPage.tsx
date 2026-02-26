import { useEffect, useMemo, useState, useRef, type FormEvent } from 'react';
import { useParams } from 'react-router-dom';
import { useChatStore } from '../store/chat.store';
import { useRepoIndexStatus, useIndexChat, reposKeys } from '../features/repo/repos.hooks';
import { normalizeIndexStatus, type NormalizedIndexStatus } from '../features/repo/repos.api';
import { useQueryClient } from '@tanstack/react-query';
import { useChatHistory, useSendMessage } from '../features/chat/chat.hooks';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Loader2, Send, Brain, User } from 'lucide-react';

function formatTimestamp(iso: string) {
  return new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(iso));
}

export default function ChatPage() {
  const { chatId } = useParams();
  const queryClient = useQueryClient();
  const { chats, setActiveChatId } = useChatStore();
  const [message, setMessage] = useState('');
  const [sendError, setSendError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeChat = useMemo(
    () => chats.find((chat) => chat._id === chatId),
    [chats, chatId]
  );

  const { data: repoIndexStatus } = useRepoIndexStatus(chatId, true);
  const indexMutation = useIndexChat();
  const sendMessageMutation = useSendMessage(chatId ?? '');
  const { data: messages = [], isLoading: historyLoading } = useChatHistory(chatId ?? '', !!chatId);

  const effectiveStatus: NormalizedIndexStatus = useMemo(() => {
    const backendStatus = normalizeIndexStatus(repoIndexStatus?.indexStatus);
    if (repoIndexStatus?.indexStatus) return backendStatus;

    const chatStatus = normalizeIndexStatus(activeChat?.indexStatus);
    if (chatStatus === 'done' || activeChat?.lastIndexedAt) return 'done';
    return chatStatus;
  }, [repoIndexStatus?.indexStatus, activeChat?.indexStatus, activeChat?.lastIndexedAt]);

  const isIndexing = effectiveStatus === 'running' || indexMutation.isPending;
  const isChatReady = effectiveStatus === 'done';
  const isInputDisabled = !isChatReady || isIndexing || sendMessageMutation.isPending;


  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!chatId || isInputDisabled) return;
    const trimmedMessage = message.trim();
    if (!trimmedMessage) return;

    setSendError(null);
    setMessage('');
    try {
      await sendMessageMutation.mutateAsync(trimmedMessage);
    } catch (error) {
      setMessage(trimmedMessage);
      setSendError(error instanceof Error ? error.message : 'Failed to send message.');
    }
  };

  useEffect(() => {
    if (chatId) setActiveChatId(chatId);
  }, [chatId, setActiveChatId]);

  useEffect(() => {
    if (!chatId || !repoIndexStatus?.indexStatus) return;
    queryClient.invalidateQueries({ queryKey: reposKeys.list() });
    queryClient.invalidateQueries({ queryKey: reposKeys.detail(chatId) });
  }, [chatId, queryClient, repoIndexStatus?.indexStatus]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sendMessageMutation.isPending]);
  return (
    <div className="flex h-full flex-col bg-white dark:bg-black">

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="mx-auto w-full max-w-4xl space-y-6">
          {historyLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
            </div>
          )}

          {!historyLoading && messages.length === 0 && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center max-w-md">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center">
                  <Brain className="w-8 h-8 text-slate-400" />
                </div>
                <p className="text-sm font-medium text-slate-900 dark:text-white mb-2">
                  {isChatReady ? 'Start a conversation' : 'Repository not indexed'}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {isChatReady
                    ? 'Ask anything about this repository'
                    : 'Index this repository to start chatting'}
                </p>
              </div>
            </div>
          )}

          {messages.map((chatMessage) => (
            <div
              key={chatMessage._id}
              className={`flex gap-4 ${chatMessage.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {chatMessage.role === 'assistant' && (
                <div className="w-8 h-8 shrink-0 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center">
                  <Brain className="w-4 h-4 text-white" />
                </div>
              )}
              
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  chatMessage.role === 'user'
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-tr-sm'
                    : 'bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-tl-sm'
                }`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{chatMessage.content}</p>
                <p className="mt-2 text-xs opacity-60">{formatTimestamp(chatMessage.createdAt)}</p>
              </div>

              {chatMessage.role === 'user' && (
                <div className="w-8 h-8 shrink-0 rounded-full bg-slate-900 dark:bg-white flex items-center justify-center">
                  <User className="w-4 h-4 text-white dark:text-slate-900" />
                </div>
              )}
            </div>
          ))}

          {sendMessageMutation.isPending && (
            <div className="flex gap-4 justify-start">
              <div className="w-8 h-8 shrink-0 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center">
                <Brain className="w-4 h-4 text-white" />
              </div>
              <div className="max-w-[80%] rounded-2xl rounded-tl-sm px-4 py-3 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Thinking...
                </div>
              </div>
            </div>
          )}

          {sendError && (
            <div className="rounded-lg border border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30 px-4 py-3 text-sm text-red-700 dark:text-red-300">
              {sendError}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="shrink-0 border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-black/95 backdrop-blur-sm p-4">
        <form onSubmit={handleSubmit} className="mx-auto w-full max-w-4xl">
          <div className="flex items-end gap-2">
            <div className="flex-1 relative">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={isChatReady ? 'Ask about this repository...' : 'Index repository to start chatting'}
                disabled={isInputDisabled}
                className="pr-12 resize-none min-h-[44px]"
              />
            </div>
            <Button
              type="submit"
              disabled={isInputDisabled || !message.trim()}
              size="icon"
              className="h-11 w-11 shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          {!isChatReady && (
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              {isIndexing
                ? 'Repository is being indexed. Chat will be available when indexing completes.'
                : 'Click "Index Repository" above to enable chat.'}
            </p>
          )}
        </form>
      </div>

      {/* Indexing Overlay */}
      {isIndexing && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/80 dark:bg-black/80 backdrop-blur-sm">
          <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-6 py-4 shadow-lg">
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">Indexing repository</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">This may take a few minutes...</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}