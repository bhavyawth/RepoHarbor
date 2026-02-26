import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { useParams } from 'react-router-dom';
import { useChatStore } from '../store/chat.store';
import { useRepoIndexStatus, reposKeys } from '../features/repo/repos.hooks';
import { useQueryClient } from '@tanstack/react-query';
// import TerminalOverlay from '../components/TerminalOverlay'; todo
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Send } from 'lucide-react';

export default function ChatPage() {
  const { chatId } = useParams();
  const queryClient = useQueryClient();
  const { chats, setActiveChatId, indexingByChatId, setChatIndexing } = useChatStore();
  const [message, setMessage] = useState('');
  const previousBackendIndexingRef = useRef(false);

  const activeChat = useMemo(
    () => chats.find((chat) => chat._id === chatId),
    [chats, chatId]
  );
  const isIndexing = chatId ? !!indexingByChatId[chatId] : false;
  const { data: repoIndexStatus } = useRepoIndexStatus(chatId, true);
  const isBackendIndexing = repoIndexStatus?.indexStatus === 'indexing';
  const isInputDisabled = !activeChat?.lastIndexedAt;
  const showOverlay = isIndexing || isBackendIndexing;
  
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isInputDisabled || showOverlay) return;
    setMessage('');
  };
  
  useEffect(() => {
    if (chatId) {
      setActiveChatId(chatId);
    }
  }, [chatId, setActiveChatId]);

  useEffect(() => {
    if (!chatId || !repoIndexStatus) return;
    const backendCurrentlyIndexing = repoIndexStatus.indexStatus === 'indexing';
    setChatIndexing(chatId, backendCurrentlyIndexing);
    if (previousBackendIndexingRef.current && !backendCurrentlyIndexing) {
      queryClient.invalidateQueries({ queryKey: reposKeys.list() });
      queryClient.invalidateQueries({ queryKey: reposKeys.detail(chatId) });
    }
    previousBackendIndexingRef.current = backendCurrentlyIndexing;
  }, [chatId, queryClient, repoIndexStatus, setChatIndexing]);

  
  
  return (
    <div className="relative h-full">
      <div className="h-full p-6 pb-32">
        <div className="text-sm text-muted-foreground">
          Chat session: {chatId}
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 border-t bg-background/95 p-4 backdrop-blur-sm">
        <form onSubmit={handleSubmit} className="mx-auto w-full max-w-3xl">
          {isInputDisabled && (
            <p className="mb-2 text-sm text-muted-foreground">
              Please index this repository before chatting.
            </p>
          )}
          <div className="flex items-center gap-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask about this repository..."
              disabled={isInputDisabled || showOverlay}
            />
            <Button type="submit" disabled={isInputDisabled || showOverlay || !message.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </div>

      {/* {showOverlay && <TerminalOverlay />} */}
    </div>
  );
}
