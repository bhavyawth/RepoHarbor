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
};