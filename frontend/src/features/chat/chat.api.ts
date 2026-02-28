import { api } from '../../api/client';

export interface ChatMessage {
  _id: string;
  repoId: string;
  userId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface MessageSearchResult {
  _id: string;
  chatId: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  createdAt: string;
  repoName: string;
}

export interface SendMessageRequest {
  question: string;
}

export interface SendMessageResponse {
  answer: string;
}

export const chatApi = {
  sendMessage: async (repoId: string, data: SendMessageRequest): Promise<SendMessageResponse> => {
    const { data: response } = await api.post(`/repos/${repoId}/messages`, data);
    return response;
  },

  getChatHistory: async (repoId: string): Promise<ChatMessage[]> => {
    const { data } = await api.get(`/repos/${repoId}/messages`);
    return data;
  },

  clearChatHistory: async (repoId: string): Promise<void> => {
    await api.delete(`/repos/${repoId}/messages`);
  },

  searchMessages: async (query: string): Promise<MessageSearchResult[]> => {
    const { data } = await api.get('/repos/search/messages', {
      params: { q: query },
    });
    return data;
  },
};
