import React, { useState } from 'react';
import { type Message } from '../../types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check, Sparkles, User, RefreshCw, ThumbsUp, ThumbsDown, Globe, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MessageBubbleProps {
  message: Message;
  onRegenerate?: (messageId: string) => void;
}

const WebSearchSources: React.FC<{ sources: { title: string; url: string }[] }> = ({ sources }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="flex flex-col gap-2 my-2.5">
      <button
        onClick={() => setExpanded(!expanded)}
        className="glass-interactive flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-sky-400/20 bg-sky-500/5 hover:bg-sky-500/10 text-sky-400 text-xs font-medium cursor-pointer w-fit select-none transition-all duration-300"
      >
        <Globe className="w-3.5 h-3.5 animate-pulse text-sky-400" />
        <span>Searched the web: {sources.length} {sources.length === 1 ? 'source' : 'sources'}</span>
        {expanded ? <ChevronUp className="w-3.5 h-3.5 ml-1" /> : <ChevronDown className="w-3.5 h-3.5 ml-1" />}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1.5 max-w-[650px]">
              {sources.map((src, idx) => {
                let domain = '';
                try {
                  domain = new URL(src.url).hostname.replace('www.', '');
                } catch {
                  domain = src.url;
                }

                return (
                  <a
                    key={idx}
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="glass glass-interactive flex items-start gap-3 p-3 rounded-xl border border-white/5 bg-white/2 hover:bg-white/5 hover:border-white/10 hover:shadow-[0_4px_12px_rgba(0,0,0,0.4)] transition-all group"
                  >
                    <div className="w-5 h-5 rounded-md bg-sky-500/10 text-sky-400 border border-sky-400/20 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <p className="text-xs font-medium text-white/80 group-hover:text-white transition-colors truncate">
                          {src.title}
                        </p>
                        <ExternalLink className="w-3 h-3 text-white/20 group-hover:text-white/60 shrink-0 transition-colors" />
                      </div>
                      <p className="text-[10px] text-white/35 group-hover:text-sky-400/70 transition-colors truncate mt-0.5">
                        {domain}
                      </p>
                    </div>
                  </a>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, onRegenerate }) => {
  const isUser = message.sender === 'user';
  const [copied, setCopied] = useState(false);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy message:', err);
    }
  };

  const handleCopyCode = async (codeText: string, id: string) => {
    try {
      await navigator.clipboard.writeText(codeText);
      setCopiedCodeId(id);
      setTimeout(() => setCopiedCodeId(null), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const handleFeedback = (type: 'up' | 'down') => {
    setFeedback((prev) => (prev === type ? null : type));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`group relative flex gap-4 p-5 rounded-2xl border transition-all ${
        isUser
          ? 'bg-white/3 border-white/5 self-end ml-16 max-w-[85%]'
          : 'bg-transparent border-transparent mr-16 self-start max-w-full'
      }`}
    >
      {/* Sender Avatar */}
      <div
        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border select-none ${
          isUser
            ? 'bg-white/10 border-white/20 text-white'
            : 'bg-white text-black border-white'
        }`}
      >
        {isUser ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
      </div>

      {/* Message Body */}
      <div className="flex-1 overflow-hidden flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-white/40">
            {isUser ? 'You' : 'L AI'}
          </span>
        </div>

        {/* Web Search Sources */}
        {!isUser && message.sources && message.sources.length > 0 && (
          <WebSearchSources sources={message.sources} />
        )}

        {/* Content Render */}
        <div className="text-sm leading-relaxed text-white/90 font-body prose prose-invert max-w-none break-words">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeSanitize]}
            components={{
              // Custom code block renderer with copy header
              code({ className, children }) {
                const match = /language-(\w+)/.exec(className || '');
                const codeContent = String(children).replace(/\n$/, '');
                
                if (match) {
                  const lang = match[1];
                  const codeId = Math.random().toString(36).substring(2, 9);
                  const isCodeCopied = copiedCodeId === codeId;

                  return (
                    <div className="my-4 rounded-xl border border-white/8 overflow-hidden bg-black/40">
                      <div className="flex items-center justify-between px-4 py-2 bg-white/4 border-b border-white/5">
                        <span className="text-[10px] font-bold text-white/50 uppercase tracking-wider">
                          {lang}
                        </span>
                        <button
                          onClick={() => handleCopyCode(codeContent, codeId)}
                          className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/80 transition-colors"
                        >
                          {isCodeCopied ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-[10px] font-semibold text-emerald-400">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span className="text-[10px] font-semibold">Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                      <SyntaxHighlighter
                        style={vscDarkPlus as any}
                        language={lang}
                        PreTag="div"
                        className="!m-0 !bg-transparent !p-4 text-xs font-mono leading-relaxed"
                      >
                        {codeContent}
                      </SyntaxHighlighter>
                    </div>
                  );
                }

                // Inline code formatting
                return (
                  <code
                    className="bg-white/8 border border-white/5 px-1.5 py-0.5 rounded text-xs text-white/90 font-mono"
                  >
                    {children}
                  </code>
                );
              },
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>

        {/* Message Action Bar — visible on hover */}
        <div className="flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {/* Copy */}
          <button
            onClick={handleCopyMessage}
            className="flex items-center gap-1 px-2 py-1 rounded-md text-white/40 hover:text-white/80 hover:bg-white/5 transition-all text-[11px] font-medium"
            title="Copy message"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>

          {/* Assistant-only actions */}
          {!isUser && (
            <>
              {/* Regenerate */}
              {onRegenerate && (
                <button
                  onClick={() => onRegenerate(message.id)}
                  className="flex items-center gap-1 px-2 py-1 rounded-md text-white/40 hover:text-white/80 hover:bg-white/5 transition-all text-[11px] font-medium"
                  title="Regenerate response"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Regenerate</span>
                </button>
              )}

              {/* Divider */}
              <div className="w-px h-4 bg-white/10 mx-0.5" />

              {/* Thumbs Up */}
              <button
                onClick={() => handleFeedback('up')}
                className={`p-1.5 rounded-md transition-all ${
                  feedback === 'up'
                    ? 'text-emerald-400 bg-emerald-950/30'
                    : 'text-white/40 hover:text-white/80 hover:bg-white/5'
                }`}
                title="Good response"
              >
                <ThumbsUp className="w-3.5 h-3.5" />
              </button>

              {/* Thumbs Down */}
              <button
                onClick={() => handleFeedback('down')}
                className={`p-1.5 rounded-md transition-all ${
                  feedback === 'down'
                    ? 'text-rose-400 bg-rose-950/30'
                    : 'text-white/40 hover:text-white/80 hover:bg-white/5'
                }`}
                title="Bad response"
              >
                <ThumbsDown className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};
