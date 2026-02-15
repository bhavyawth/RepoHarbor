import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useChatStore } from '../store/chat.store';

export default function ChatPage() {
  const { chatId } = useParams();
  const { setActiveChatId } = useChatStore();

  useEffect(() => {
    if (chatId) {
      setActiveChatId(chatId);
    }
  }, [chatId, setActiveChatId]);

  return (
    <div className="h-full p-6">
      <div className="text-sm text-muted-foreground">
        Chat session: {chatId}
      </div>
    </div>
  );
}

