import { api } from '@/lib/api/client';
import { ChatConversation, ChatMessage } from './types';
import { CreateDirectInput, CreateGroupInput, SendMessageInput, UpdateConversationInput } from './schemas';

export const chatApi = {
  getConversations: async (params: { page: number; pageSize: number; search?: string; type?: 'DIRECT' | 'GROUP' }) => {
    const searchParams = new URLSearchParams({
      page: params.page.toString(),
      pageSize: params.pageSize.toString(),
    });
    if (params.search) searchParams.set('search', params.search);
    if (params.type) searchParams.set('type', params.type);
    
    return api.get<ChatConversation[]>(`/chat/conversations?${searchParams.toString()}`);
  },

  getConversation: async (id: string) => {
    return api.get<ChatConversation>(`/chat/conversations/${id}`);
  },

  getUnreadCount: async () => {
    return api.get<{ count: number }>('/chat/unread-count');
  },

  createDirect: async (data: CreateDirectInput) => {
    return api.post<ChatConversation>('/chat/conversations/direct', data);
  },

  createGroup: async (data: CreateGroupInput) => {
    return api.post<ChatConversation>('/chat/conversations/group', data);
  },

  updateConversation: async (id: string, data: UpdateConversationInput) => {
    return api.patch<ChatConversation>(`/chat/conversations/${id}`, data);
  },

  deleteConversation: async (id: string) => {
    return api.delete<{ success: boolean }>(`/chat/conversations/${id}`);
  },

  muteConversation: async (id: string, data: { minutes: number }) => {
    return api.post<{ success: boolean }>(`/chat/conversations/${id}/mute`, data);
  },

  // Member Management
  addMembers: async (id: string, data: { employeeIds: string[] }) => {
    return api.post<{ success: boolean }>(`/chat/conversations/${id}/members`, data);
  },

  removeMember: async (id: string, employeeId: string) => {
    return api.delete<{ success: boolean }>(`/chat/conversations/${id}/members/${employeeId}`);
  },

  leaveConversation: async (id: string) => {
    return api.post<{ success: boolean }>(`/chat/conversations/${id}/leave`, {});
  },

  updateMemberRole: async (id: string, employeeId: string, role: 'ADMIN' | 'MEMBER') => {
    return api.patch<{ success: boolean }>(`/chat/conversations/${id}/members/${employeeId}/role`, { role });
  },

  transferOwnership: async (id: string, employeeId: string) => {
    return api.post<{ success: boolean }>(`/chat/conversations/${id}/transfer-ownership`, { employeeId });
  },

  // Messages
  getMessages: async (id: string, params: { page: number; pageSize: number; search?: string; before?: string }) => {
    const searchParams = new URLSearchParams({
      page: params.page.toString(),
      pageSize: params.pageSize.toString(),
    });
    if (params.search) searchParams.set('search', params.search);
    if (params.before) searchParams.set('before', params.before);
    
    return api.get<ChatMessage[]>(`/chat/conversations/${id}/messages?${searchParams.toString()}`);
  },

  sendMessage: async (id: string, data: SendMessageInput) => {
    return api.post<ChatMessage>(`/chat/conversations/${id}/messages`, data);
  },

  updateMessage: async (id: string, data: { content: string }) => {
    return api.patch<ChatMessage>(`/chat/messages/${id}`, data);
  },

  deleteMessage: async (id: string) => {
    return api.delete<{ success: boolean }>(`/chat/messages/${id}`);
  },

  searchMessages: async (params: { q: string; page: number; pageSize: number }) => {
    const searchParams = new URLSearchParams({
      q: params.q,
      page: params.page.toString(),
      pageSize: params.pageSize.toString(),
    });
    return api.get<(ChatMessage & { conversation: ChatConversation })[]>(`/chat/messages/search?${searchParams.toString()}`);
  },

  readMessages: async (id: string, messageId?: string) => {
    return api.post<{ success: boolean }>(`/chat/conversations/${id}/read`, { messageId });
  },

  toggleReaction: async (id: string, emoji: string) => {
    return api.post<{ active: boolean; emoji: string; reaction?: unknown }>(`/chat/messages/${id}/reactions/toggle`, { emoji });
  },
};
