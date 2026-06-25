import React, { useState, useMemo, useEffect } from 'react';
import { useChat } from '../../context/ChatContext';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Plus, Trash2, Edit2, Check, X, PanelLeftClose, PanelLeft, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { ConfirmModal } from '../ui/ConfirmModal';
import { ConversationSkeleton } from '../ui/Skeleton';

interface SidebarProps {
  onNavigate?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onNavigate }) => {
  const {
    conversations,
    activeConversation,
    loadingConversations,
    createConversation,
    renameConversation,
    deleteConversation,
  } = useChat();

  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);

  // Filter conversations by search query
  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const q = searchQuery.toLowerCase();
    return conversations.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        (c.last_message && c.last_message.toLowerCase().includes(q))
    );
  }, [conversations, searchQuery]);

  // Keyboard shortcut: Ctrl+N for new chat
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        handleCreate();
      }
    };
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, []);

  const handleStartRename = (e: React.MouseEvent, id: string, currentTitle: string) => {
    e.stopPropagation();
    setEditingId(id);
    setEditTitle(currentTitle);
  };

  const handleSaveRename = async (e: React.FormEvent, id: string) => {
    e.preventDefault();
    if (editTitle.trim()) {
      await renameConversation(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const handleCancelRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(null);
  };

  const handleDeleteClick = (e: React.MouseEvent, id: string, title: string) => {
    e.stopPropagation();
    setDeleteTarget({ id, title });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    const { id } = deleteTarget;
    const isActive = activeConversation?.id === id;
    await deleteConversation(id);
    setDeleteTarget(null);
    if (isActive) {
      navigate('/chat');
      onNavigate?.();
    }
  };

  const handleCreate = async () => {
    const newConv = await createConversation();
    if (newConv?.id) {
      navigate(`/chat/${newConv.id}`);
      onNavigate?.();
    }
  };

  const handleConversationClick = (id: string) => {
    navigate(`/chat/${id}`);
    onNavigate?.();
  };

  return (
    <>
    <motion.div
      animate={{ width: isCollapsed ? 80 : 280 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="glass h-full border-r border-white/8 bg-black/40 flex flex-col overflow-hidden shrink-0 select-none"
    >
      {/* Sidebar Header */}
      <div className={`p-4 flex items-center justify-between border-b border-white/5 ${isCollapsed ? 'flex-col gap-4' : 'flex-row'}`}>
        {!isCollapsed && (
          <span className="text-xs font-bold uppercase tracking-wider text-white/40">
            Conversations
          </span>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-lg hover:bg-white/5 border border-white/0 hover:border-white/5 text-white/50 hover:text-white transition-all cursor-pointer hidden md:flex"
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
        </button>
      </div>

      {/* New Chat Button */}
      <div className="p-3">
        {isCollapsed ? (
          <button
            onClick={handleCreate}
            className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center hover:bg-white/90 active:scale-95 transition-all shadow-lg mx-auto cursor-pointer"
            title="New Conversation (Ctrl+N)"
          >
            <Plus className="w-5 h-5" />
          </button>
        ) : (
          <button
            onClick={handleCreate}
            className="w-full py-3 px-4 rounded-xl border border-white/10 hover:border-white/20 bg-white/5 text-white font-medium text-sm flex items-center justify-center gap-2 hover:bg-white/10 active:scale-[0.99] transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            New Chat
            <span className="ml-auto text-[10px] text-white/30 font-mono">⌃N</span>
          </button>
        )}
      </div>

      {/* Search Box (when not collapsed) */}
      {!isCollapsed && (
        <div className="px-3 pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/3 border border-white/8 rounded-lg pl-9 pr-3 py-2 text-xs text-white/80 placeholder-white/30 outline-none focus:border-white/15 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto px-2 py-1 space-y-1">
        {loadingConversations ? (
          <ConversationSkeleton />
        ) : filteredConversations.length === 0 ? (
          <div className="text-center py-8 text-xs text-white/30 font-medium">
            {!isCollapsed && (searchQuery ? 'No matching conversations.' : 'No conversations yet.')}
          </div>
        ) : (
          filteredConversations.map((conv) => {
            const isActive = activeConversation?.id === conv.id;
            const isEditing = editingId === conv.id;

            return (
              <div
                key={conv.id}
                onClick={() => !isEditing && handleConversationClick(conv.id)}
                className={`group relative flex items-center justify-between rounded-xl p-3 cursor-pointer transition-all ${
                  isActive
                    ? 'bg-white/10 border border-white/10 text-white shadow-xl'
                    : 'border border-transparent text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3 w-full overflow-hidden">
                  <MessageSquare className="w-4 h-4 shrink-0 opacity-70" />
                  
                  {!isCollapsed && (
                    <div className="flex-1 overflow-hidden">
                      {isEditing ? (
                        <form
                          onSubmit={(e) => handleSaveRename(e, conv.id)}
                          className="flex items-center gap-1.5 w-full"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="w-full bg-white/10 border border-white/20 rounded px-1.5 py-0.5 text-xs text-white outline-none focus:border-white/50"
                            autoFocus
                          />
                          <button
                            type="submit"
                            className="p-0.5 text-emerald-400 hover:text-emerald-300"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={handleCancelRename}
                            className="p-0.5 text-rose-400 hover:text-rose-300"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </form>
                      ) : (
                        <p className="text-xs font-semibold truncate leading-relaxed">
                          {conv.title}
                        </p>
                      )}
                      {conv.last_message && !isEditing && (
                        <p className="text-[10px] text-white/30 truncate mt-0.5">
                          {conv.last_message}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions (visible on hover) */}
                {!isCollapsed && !isEditing && (
                  <div className="absolute right-2 opacity-0 group-hover:opacity-100 flex items-center gap-1 bg-gradient-to-l from-black/80 via-black/80 to-transparent pl-4 py-1.5 rounded-r-xl transition-opacity">
                    <button
                      onClick={(e) => handleStartRename(e, conv.id, conv.title)}
                      className="p-1 text-white/40 hover:text-white/80 transition-colors"
                      title="Rename"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteClick(e, conv.id, conv.title)}
                      className="p-1 text-white/40 hover:text-rose-400 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </motion.div>

    {/* Delete Confirmation Modal */}
    <ConfirmModal
      isOpen={!!deleteTarget}
      onClose={() => setDeleteTarget(null)}
      onConfirm={handleDeleteConfirm}
      title="Delete Conversation"
      message={`This will permanently delete "${deleteTarget?.title || 'this conversation'}" and all its messages. This action cannot be undone.`}
      confirmText="Delete"
      cancelText="Cancel"
      variant="danger"
    />
    </>
  );
};
