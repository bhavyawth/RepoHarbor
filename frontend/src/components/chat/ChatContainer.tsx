import type React from 'react';
import { Brain, Loader2 } from 'lucide-react';
import type { ChatMessage } from '../../features/chat/chat.api';
import MessageRenderer from './MessageRenderer';

type ChatContainerProps = {
  messages: ChatMessage[];
  historyLoading: boolean;
  isChatReady: boolean;
  isThinking: boolean;
  sendError: string | null;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
};

export default function ChatContainer({
  messages,
  historyLoading,
  isChatReady,
  isThinking,
  sendError,
  messagesEndRef,
}: ChatContainerProps) {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-7 sm:px-6">
      {historyLoading && (
        <div className="flex items-center justify-center py-14">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      )}

      {!historyLoading && messages.length === 0 && (
        <div className="flex items-center justify-center py-14">
          <div className="max-w-md text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-900">
              <Brain className="h-6 w-6 text-slate-500" />
            </div>
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
              {isChatReady ? 'Start a conversation' : 'Repository not indexed'}
            </p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {isChatReady
                ? 'Ask anything about this repository.'
                : 'Index this repository to start chatting.'}
            </p>
          </div>
        </div>
      )}

      {messages.map((message) => (
        <MessageRenderer key={message._id} message={message} />
      ))}

      {isThinking && (
        <div className="animate-in fade-in-0 slide-in-from-bottom-1 duration-300 flex justify-start gap-3">
          <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
            <Brain className="h-4 w-4" />
          </div>
          <div className="max-w-[85%] rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Thinking...
            </div>
          </div>
        </div>
      )}

      {sendError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
          {sendError}
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}
