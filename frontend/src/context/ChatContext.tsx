import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Conversation, Message } from '../types';
import { conversationApi } from '../services/conversationApi';
import { getAuthToken } from '../services/apiClient';
import { useAuth } from './AuthContext';
import { useNotification } from './NotificationContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

interface ChatContextType {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  messages: Message[];
  loadingConversations: boolean;
  loadingMessages: boolean;
  isStreaming: boolean;
  streamingContent: string;
  createConversation: (title?: string) => Promise<Conversation | null>;
  renameConversation: (id: string, title: string) => Promise<void>;
  deleteConversation: (id: string) => Promise<void>;
  setActiveConversationId: (id: string | null) => void;
  sendMessage: (content: string) => Promise<void>;
  regenerateMessage: (assistantMessageId: string) => Promise<void>;
  loadConversations: () => Promise<void>;
  loadMessages: (id: string, reload?: boolean) => Promise<void>;
  hasMoreMessages: boolean;
  webSearchEnabled: boolean;
  setWebSearchEnabled: (enabled: boolean) => void;
  currentSources: { title: string; url: string }[] | null;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { session } = useAuth();
  const { showError, showSuccess } = useNotification();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  
  const [loadingConversations, setLoadingConversations] = useState<boolean>(false);
  const [loadingMessages, setLoadingMessages] = useState<boolean>(false);
  
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [streamingContent, setStreamingContent] = useState<string>('');
  const [hasMoreMessages, setHasMoreMessages] = useState<boolean>(false);
  const [messageOffset, setMessageOffset] = useState<number>(0);

  const [webSearchEnabled, setWebSearchEnabled] = useState<boolean>(false);
  const [currentSources, setCurrentSources] = useState<{ title: string; url: string }[] | null>(null);

  const loadConversations = useCallback(async () => {
    if (!session) return;
    setLoadingConversations(true);
    try {
      const data = await conversationApi.listConversations();
      setConversations(data.conversations);
    } catch (err: any) {
      showError(err.message || 'Failed to fetch conversations.');
    } finally {
      setLoadingConversations(false);
    }
  }, [session, showError]);

  const loadMessages = useCallback(async (id: string, reload = true) => {
    setLoadingMessages(reload);
    try {
      const limit = 30;
      const offset = reload ? 0 : messageOffset;
      
      const data = await conversationApi.getMessages(id, limit, offset);
      
      if (reload) {
        setMessages(data.messages);
        setMessageOffset(data.messages.length);
      } else {
        setMessages((prev) => [...data.messages, ...prev]);
        setMessageOffset((prev) => prev + data.messages.length);
      }
      setHasMoreMessages(data.has_more);
    } catch (err: any) {
      showError(err.message || 'Failed to fetch messages.');
    } finally {
      setLoadingMessages(false);
    }
  }, [messageOffset, showError]);

  const setActiveConversationId = useCallback(async (id: string | null) => {
    if (!id) {
      setActiveConversation(null);
      setMessages([]);
      return;
    }

    const found = conversations.find((c) => c.id === id);
    if (found) {
      setActiveConversation(found);
      loadMessages(id, true);
    } else {
      // If not in cache, fetch it
      try {
        const fullConv = await conversationApi.getConversation(id);
        setActiveConversation(fullConv);
        loadMessages(id, true);
      } catch (err: any) {
        showError('Conversation not found.');
        setActiveConversation(null);
      }
    }
  }, [conversations, loadMessages, showError]);

  const createConversation = async (title = 'New Conversation') => {
    try {
      const newConv = await conversationApi.createConversation(title);
      setConversations((prev) => [newConv, ...prev]);
      setActiveConversation(newConv);
      setMessages([]);
      return newConv;
    } catch (err: any) {
      showError(err.message || 'Failed to create conversation.');
      return null;
    }
  };

  const renameConversation = async (id: string, title: string) => {
    // Optimistic Update
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title } : c))
    );
    if (activeConversation?.id === id) {
      setActiveConversation((prev) => prev ? { ...prev, title } : null);
    }

    try {
      await conversationApi.updateConversation(id, title);
      showSuccess('Conversation renamed.');
    } catch (err: any) {
      showError(err.message || 'Failed to rename conversation.');
      // Revert cache on error
      loadConversations();
    }
  };

  const deleteConversation = async (id: string) => {
    const isDeletingActive = activeConversation?.id === id;
    
    // Optimistic update
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (isDeletingActive) {
      setActiveConversation(null);
      setMessages([]);
    }

    try {
      await conversationApi.deleteConversation(id);
      showSuccess('Conversation deleted.');
    } catch (err: any) {
      showError(err.message || 'Failed to delete conversation.');
      loadConversations();
    }
  };

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    let convId = activeConversation?.id;
    let localSources: { title: string; url: string }[] | null = null;
    
    // 1. Optimistic User Message
    const userMsgPlaceholder: Message = {
      id: `temp-${Date.now()}`,
      conversation_id: convId || '',
      sender: 'user',
      content,
      created_at: new Date().toISOString(),
    };
    
    setMessages((prev) => [...prev, userMsgPlaceholder]);
    setIsStreaming(true);
    setStreamingContent('');
    setCurrentSources(null);

    try {
      // Fetch Event Stream
      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify({
          message: content,
          conversation_id: convId || undefined,
          web_search: webSearchEnabled,
        }),
      });

      if (!response.ok) {
        let errText = 'Failed to send message';
        try {
          const errData = await response.json();
          errText = errData.detail || errText;
        } catch {}
        throw new Error(errText);
      }

      if (!response.body) {
        throw new Error('Readable stream not supported on response.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';
      let accumContent = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data: ')) continue;

          try {
            const dataStr = trimmed.substring(6);
            const data = JSON.parse(dataStr);

            if (data.error) {
              throw new Error(data.error);
            }

            if (data.web_search) {
              localSources = data.sources || [];
              setCurrentSources(localSources);
            }

            if (data.token) {
              accumContent += data.token;
              setStreamingContent(accumContent);
            }

            if (data.done) {
              // Finalized parameters
              const newConvId = data.conversation_id;
              const serverMsgId = data.message_id;
              const convTitle = data.conversation_title;

              // Save assistant message to local messages list
              const assistantMsg: Message = {
                id: serverMsgId || `assistant-${Date.now()}`,
                conversation_id: newConvId,
                sender: 'assistant',
                content: accumContent,
                created_at: new Date().toISOString(),
                sources: localSources || undefined,
              };

              setMessages((prev) => {
                // Filter out temporary user message and append correct message records
                const filtered = prev.filter((m) => m.id !== userMsgPlaceholder.id);
                const correctedUserMsg: Message = {
                  ...userMsgPlaceholder,
                  conversation_id: newConvId,
                };
                return [...filtered, correctedUserMsg, assistantMsg];
              });

              // Clean up streaming state
              setStreamingContent('');
              setCurrentSources(null);
              setIsStreaming(false);

              // If it was a new conversation, refresh conversations list & activate it
              if (!convId) {
                await loadConversations();
                // Select the new conversation with the auto-generated title
                try {
                  const fullConv = await conversationApi.getConversation(newConvId);
                  if (convTitle) fullConv.title = convTitle;
                  setActiveConversation(fullConv);
                } catch {
                  setActiveConversationId(newConvId);
                }
              } else {
                // Just update sidebar's last message
                setConversations((prev) =>
                  prev.map((c) =>
                    c.id === convId
                      ? {
                          ...c,
                          last_message: accumContent.substring(0, 200),
                          message_count: c.message_count + 2,
                          updated_at: new Date().toISOString(),
                        }
                      : c
                  )
                );
              }
            }
          } catch (e: any) {
            console.error('SSE line error:', e);
            throw new Error(e.message || 'Error occurred while streaming response.');
          }
        }
      }
    } catch (err: any) {
      showError(err.message || 'Connection lost. Failed to get reply.');
      setIsStreaming(false);
      setStreamingContent('');
      // Revert optimistic user message if we fail before creating conversation
      if (!convId) {
        setMessages([]);
      }
    }
  };

  const regenerateMessage = async (assistantMessageId: string) => {
    if (isStreaming) return;

    // Find the assistant message index
    const assistantIdx = messages.findIndex((m) => m.id === assistantMessageId);
    if (assistantIdx < 0) return;

    // Find the preceding user message
    let userMessage: Message | null = null;
    for (let i = assistantIdx - 1; i >= 0; i--) {
      if (messages[i].sender === 'user') {
        userMessage = messages[i];
        break;
      }
    }
    if (!userMessage) {
      showError('Could not find the original user message to regenerate.');
      return;
    }

    // Optimistically remove the old assistant message
    setMessages((prev) => prev.filter((m) => m.id !== assistantMessageId));

    // Re-send the user message through the pipeline
    // (the user message already exists in the DB, so we just need to stream a new response)
    setIsStreaming(true);
    setStreamingContent('');
    setCurrentSources(null);

    const convId = activeConversation?.id;
    let localSources: { title: string; url: string }[] | null = null;
    try {
      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify({
          message: userMessage.content,
          conversation_id: convId || undefined,
          web_search: webSearchEnabled,
        }),
      });

      if (!response.ok) {
        let errText = 'Failed to regenerate response';
        try {
          const errData = await response.json();
          errText = errData.detail || errText;
        } catch {}
        throw new Error(errText);
      }

      if (!response.body) throw new Error('Readable stream not supported.');

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';
      let accumContent = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data: ')) continue;
          try {
            const dataStr = trimmed.substring(6);
            const data = JSON.parse(dataStr);
            if (data.error) throw new Error(data.error);
            if (data.web_search) {
              localSources = data.sources || [];
              setCurrentSources(localSources);
            }
            if (data.token) {
              accumContent += data.token;
              setStreamingContent(accumContent);
            }
            if (data.done) {
              const serverMsgId = data.message_id;
              const assistantMsg: Message = {
                id: serverMsgId || `assistant-${Date.now()}`,
                conversation_id: convId || '',
                sender: 'assistant',
                content: accumContent,
                created_at: new Date().toISOString(),
                sources: localSources || undefined,
              };
              setMessages((prev) => [...prev, assistantMsg]);
              setStreamingContent('');
              setCurrentSources(null);
              setIsStreaming(false);

              if (convId) {
                setConversations((prev) =>
                  prev.map((c) =>
                    c.id === convId
                      ? { ...c, last_message: accumContent.substring(0, 200), updated_at: new Date().toISOString() }
                      : c
                  )
                );
              }
            }
          } catch (e: any) {
            throw new Error(e.message || 'Error during regeneration.');
          }
        }
      }
    } catch (err: any) {
      showError(err.message || 'Failed to regenerate response.');
      setIsStreaming(false);
      setStreamingContent('');
    }
  };

  // Auto load conversations on login
  useEffect(() => {
    if (session) {
      loadConversations();
    } else {
      setConversations([]);
      setActiveConversation(null);
      setMessages([]);
    }
  }, [session, loadConversations]);

  return (
    <ChatContext.Provider
      value={{
        conversations,
        activeConversation,
        messages,
        loadingConversations,
        loadingMessages,
        isStreaming,
        streamingContent,
        createConversation,
        renameConversation,
        deleteConversation,
        setActiveConversationId,
        sendMessage,
        regenerateMessage,
        loadConversations,
        loadMessages,
        hasMoreMessages,
        webSearchEnabled,
        setWebSearchEnabled,
        currentSources,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
