import React, { useEffect, useRef } from 'react';
import { useChat } from '../context/ChatContext';
import { useParams } from 'react-router-dom';
import { MessageBubble } from '../components/chat/MessageBubble';
import { PromptInput } from '../components/chat/PromptInput';
import { TypingIndicator } from '../components/chat/TypingIndicator';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Code, MessageSquare, Mail } from 'lucide-react';
import { MessageSkeleton } from '../components/ui/Skeleton';

export const ChatPage: React.FC = () => {
  const { conversationId } = useParams<{ conversationId?: string }>();
  const {
    activeConversation,
    messages,
    loadingMessages,
    isStreaming,
    streamingContent,
    sendMessage,
    setActiveConversationId,
    regenerateMessage,
    currentSources,
  } = useChat();

  // Synchronize route conversationId with ChatContext state
  useEffect(() => {
    if (conversationId) {
      if (activeConversation?.id !== conversationId) {
        setActiveConversationId(conversationId);
      }
    } else {
      if (activeConversation !== null) {
        setActiveConversationId(null);
      }
    }
  }, [conversationId, setActiveConversationId, activeConversation]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const suggestedPrompts = [
    {
      text: 'Write a script to automate file organization in Python',
      icon: Code,
      label: 'Coding',
    },
    {
      text: 'Explain the difference between SQL and NoSQL databases',
      icon: MessageSquare,
      label: 'Database',
    },
    {
      text: 'Draft a polite follow-up email requesting feedback',
      icon: Mail,
      label: 'Writing',
    },
    {
      text: 'Brainstorm features for a generative AI notes app',
      icon: Sparkles,
      label: 'Creative',
    },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Scroll to bottom on new messages or during active streaming content changes
  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent, isStreaming]);

  const handleSuggestedPromptClick = async (promptText: string) => {
    if (isStreaming) return;
    await sendMessage(promptText);
  };

  const getStreamingMessage = () => {
    if (!isStreaming || (!streamingContent && !currentSources)) return null;
    return {
      id: 'temp-streaming',
      conversation_id: activeConversation?.id || '',
      sender: 'assistant' as const,
      content: streamingContent,
      created_at: new Date().toISOString(),
      sources: currentSources || undefined,
    };
  };

  const streamingMessage = getStreamingMessage();

  return (
    <div className="flex flex-col h-full bg-black relative">
      {/* Scrollable messages container */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto px-6 py-8"
      >
        <div className="max-w-[800px] mx-auto min-h-full flex flex-col">
          {loadingMessages ? (
            <div className="flex-1 flex flex-col gap-6 py-4">
              <MessageSkeleton />
              <MessageSkeleton />
              <MessageSkeleton />
            </div>
          ) : messages.length === 0 ? (
            /* Welcome / Onboarding Screen */
            <div className="flex-1 flex flex-col justify-center items-center py-12 select-none">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="text-center mb-12"
              >
                <h1 className="font-heading text-5xl md:text-6xl font-medium tracking-wide text-white mb-3">
                  Hello. I'm L AI.
                </h1>
                <p className="text-white/40 text-base md:text-lg">
                  How can I help you today?
                </p>
              </motion.div>

              {/* Suggestions grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl px-4">
                {suggestedPrompts.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: idx * 0.08 }}
                      onClick={() => handleSuggestedPromptClick(item.text)}
                      className="glass glass-interactive flex flex-col justify-between p-5 rounded-2xl border border-white/5 bg-white/2 text-left cursor-pointer select-none group min-h-[120px]"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded-md">
                          {item.label}
                        </span>
                        <Icon className="w-4 h-4 text-white/40 group-hover:text-white/90 transition-colors" />
                      </div>
                      <p className="text-sm font-medium text-white/70 group-hover:text-white transition-colors leading-relaxed">
                        {item.text}
                      </p>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Messages list */
            <div className="flex flex-col gap-6 pb-24">
              {messages.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  onRegenerate={msg.sender === 'assistant' ? regenerateMessage : undefined}
                />
              ))}
              
              <AnimatePresence>
                {streamingMessage && (
                  <MessageBubble key="streaming" message={streamingMessage} />
                )}
              </AnimatePresence>

              {isStreaming && !streamingContent && (
                <div className="self-start mr-16">
                  <TypingIndicator />
                </div>
              )}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Floating Prompt Input bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/90 to-transparent px-6 pt-12">
        <PromptInput />
      </div>
    </div>
  );
};
