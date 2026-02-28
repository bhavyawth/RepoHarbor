import { Brain } from 'lucide-react';
import type { ChatMessage } from '../../features/chat/chat.api';
import MarkdownRenderer from './MarkdownRenderer';
import { useAuth } from '../../features/auth/auth.hooks';

function formatTimestamp(iso: string) {
  return new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(iso));
}

type MessageRendererProps = {
  message: ChatMessage;
};

export default function MessageRenderer({ message }: MessageRendererProps) {
  const { data: user } = useAuth();

  if (message.role === 'user') {
    return (
      <div className="animate-in fade-in-0 slide-in-from-bottom-1 duration-300 flex justify-end gap-3">
        <div className="max-w-[82%] rounded-2xl rounded-tr-md border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-900 dark:text-slate-100">{message.content}</p>
          <p className="mt-2 text-right text-[11px] text-slate-500 dark:text-slate-400">
            {formatTimestamp(message.createdAt)}
          </p>
        </div>
        <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
          <img src={user?.avatarUrl || undefined} alt={user?.displayName || 'User'} className="rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in-0 slide-in-from-bottom-1 duration-300 flex justify-start gap-3">
      <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
        <Brain className="h-4 w-4" />
      </div>
      <div className="max-w-[85%] pt-0.5">
        <MarkdownRenderer content={message.content} />
        <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
          {formatTimestamp(message.createdAt)}
        </p>
      </div>
    </div>
  );
}
