import React, { useRef, useState, useEffect } from 'react';
import { useChat } from '../../context/ChatContext';
import { ArrowUp, StopCircle, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

export const PromptInput: React.FC = () => {
  const { sendMessage, isStreaming, webSearchEnabled, setWebSearchEnabled } = useChat();
  const [input, setInput] = useState<string>('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [input]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;
    
    const messageToSend = input;
    setInput('');
    
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    await sendMessage(messageToSend);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="glass border border-white/8 rounded-2xl p-2 bg-black/60 shadow-2xl flex items-end gap-2 w-full max-w-[800px] mx-auto mb-6"
    >
      <motion.button
        type="button"
        onClick={() => setWebSearchEnabled(!webSearchEnabled)}
        whileHover={{ scale: isStreaming ? 1 : 1.05 }}
        whileTap={{ scale: isStreaming ? 1 : 0.95 }}
        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-all select-none ${
          isStreaming ? 'opacity-40 cursor-not-allowed' : ''
        } ${
          webSearchEnabled
            ? 'bg-sky-500/10 border-sky-400/30 text-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.2)] hover:bg-sky-500/15'
            : 'bg-white/3 border-white/5 text-white/35 hover:text-white/60 hover:border-white/10'
        }`}
        title="Search the web"
        disabled={isStreaming}
      >
        <Globe className="w-5 h-5" />
      </motion.button>

      <textarea
        ref={textareaRef}
        rows={1}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask L AI anything..."
        className="flex-1 bg-transparent border-0 outline-none text-sm text-white placeholder-white/35 py-3 px-4 resize-none leading-relaxed focus:ring-0 max-h-[200px]"
        disabled={isStreaming}
      />
      
      <motion.button
        type="submit"
        disabled={!input.trim() || isStreaming}
        whileHover={{ scale: input.trim() && !isStreaming ? 1.05 : 1 }}
        whileTap={{ scale: input.trim() && !isStreaming ? 0.95 : 1 }}
        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors select-none ${
          input.trim() && !isStreaming
            ? 'bg-white text-black hover:bg-white/95 cursor-pointer'
            : 'bg-white/5 border border-white/5 text-white/30 cursor-not-allowed'
        }`}
      >
        {isStreaming ? (
          <StopCircle className="w-5 h-5 animate-pulse text-rose-400" />
        ) : (
          <ArrowUp className="w-5 h-5" />
        )}
      </motion.button>
    </form>
  );
};
