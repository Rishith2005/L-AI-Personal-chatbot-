import { apiClient } from './apiClient';
import type { Conversation, Message } from '../types';

export const conversationApi = {
  listConversations: async (limit = 50, offset = 0): Promise<{ conversations: Conversation[]; total: number }> => {
    return apiClient('/api/conversations', {
      method: 'GET',
      params: { limit, offset },
    });
  },

  createConversation: async (title = 'New Conversation'): Promise<Conversation> => {
    return apiClient('/api/conversations', {
      method: 'POST',
      body: JSON.stringify({ title }),
    });
  },

  getConversation: async (id: string): Promise<Conversation> => {
    return apiClient(`/api/conversations/${id}`, {
      method: 'GET',
    });
  },

  updateConversation: async (id: string, title: string): Promise<Conversation> => {
    return apiClient(`/api/conversations/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ title }),
    });
  },

  deleteConversation: async (id: string): Promise<void> => {
    return apiClient(`/api/conversations/${id}`, {
      method: 'DELETE',
    });
  },

  getMessages: async (id: string, limit = 30, offset = 0): Promise<{ messages: Message[]; has_more: boolean }> => {
    return apiClient(`/api/conversations/${id}/messages`, {
      method: 'GET',
      params: { limit, offset },
    });
  },
};
