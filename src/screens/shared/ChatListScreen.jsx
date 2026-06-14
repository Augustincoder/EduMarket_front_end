import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '../../components/layout/PageLayout';
import { Avatar } from '../../components/ui/Avatar';
import { useChatStore } from '../../store/chatStore';
import { timeAgo, cn } from '../../lib/utils';
import { hapticLight } from '../../lib/telegram';
import { SectionErrorBoundary, WidgetError } from '../../components/ui/SectionErrorBoundary';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MessageSquare, Check, CheckCheck, Users, Plus, X } from 'lucide-react';
import { chatApi } from '../../services/chat.service';
import { ChatListSkeleton } from '../../components/ui/ChatListSkeleton';
import { useQuery } from '@tanstack/react-query';

function CreateGroupModal({ isOpen, onClose, onSuccess }) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError(null);
    try {
      await chatApi.createCustomGroup({ name: name.trim() });
      hapticLight();
      onSuccess();
      onClose();
      setName('');
    } catch (err) {
      setError(err.response?.data?.message || 'Guruh yaratishda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-edu-surface w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden border border-edu-border"
      >
        <div className="p-5 flex justify-between items-center border-b border-edu-border/50">
          <h2 className="text-xl font-bold text-edu-text">Yangi Guruh</h2>
          <button onClick={onClose} className="p-2 text-edu-muted hover:text-edu-text bg-edu-bg rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5">
          <div className="mb-5">
            <label className="block text-sm font-bold text-edu-muted mb-2">Guruh nomi</label>
            <input 
              type="text" 
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Masalan: Frontend jamoasi"
              className="w-full bg-edu-bg border border-edu-border rounded-xl px-4 py-3 text-edu-text focus:outline-none focus:ring-2 focus:ring-edu-primary/30 transition-all"
              autoFocus
            />
            {error && <p className="text-red-500 text-sm mt-2 font-medium">{error}</p>}
          </div>
          <button 
            type="submit" 
            disabled={!name.trim() || loading}
            className="w-full bg-edu-primary text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 transition-transform active:scale-95"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Plus size={20} />
                <span>Yaratish</span>
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

function ChatListWidget({ searchTerm }) {
  const navigate = useNavigate();
  const conversations = useChatStore((s) => s.conversations);
  const loadConversations = useChatStore((s) => s.loadConversations);
  const userPresence = useChatStore((s) => s.userPresence);
  const isConversationsLoading = useChatStore((s) => s.isConversationsLoading);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadConversations().catch((err) => setError(err));
  }, [loadConversations]);

  // Global search hook
  const { data: globalSearchResults, isLoading: isSearchLoading } = useQuery({
    queryKey: ['globalSearch', searchTerm],
    queryFn: async () => {
      if (!searchTerm || searchTerm.trim().length < 2) return [];
      const res = await chatApi.searchGlobalMessages(searchTerm);
      return res.data?.data || [];
    },
    enabled: searchTerm.trim().length >= 2,
    staleTime: 1000 * 60,
  });

  const filteredConversations = useMemo(() => {
    if (!conversations) return [];
    if (!searchTerm) return conversations;
    const lower = searchTerm.toLowerCase();
    return conversations.filter(conv => 
      (conv.title && conv.title.toLowerCase().includes(lower)) || 
      (conv.lastMessage?.content && conv.lastMessage.content.toLowerCase().includes(lower))
    );
  }, [conversations, searchTerm]);

  if (error) {
    return (
      <div className="py-10">
        <WidgetError 
          fallbackTitle="Chatlarni yuklashda xatolik" 
          onRetry={() => {
            setError(null);
            loadConversations().catch(setError);
          }} 
        />
      </div>
    );
  }

  const handleOpenChat = (chatRoomId) => {
    hapticLight();
    // Assuming new route structure: /chat/:chatRoomId 
    navigate(`/chat/${chatRoomId}`);
  };

  // If no cached conversations and still loading API
  if (isConversationsLoading && (!conversations || conversations.length === 0)) {
    return <ChatListSkeleton />;
  }

  if (!isConversationsLoading && (!conversations || conversations.length === 0)) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="h-full flex flex-col items-center justify-center text-center py-24 px-10"
      >
        <div className="w-24 h-24 bg-edu-surface rounded-full flex items-center justify-center text-4xl mb-6 shadow-[0_0_40px_rgba(59,130,246,0.15)] border border-edu-border">
          <MessageSquare size={36} className="text-edu-primary opacity-80" />
        </div>
        <h2 className="text-2xl font-bold text-edu-text mb-2 tracking-tight">Chatlar topilmadi</h2>
        <p className="text-[15px] text-edu-muted font-medium leading-relaxed">
          Hozircha hech qanday suhbat mavjud emas. Yangi guruh yarating yoki vazifalarga qayting.
        </p>
      </motion.div>
    );
  }

  if (filteredConversations.length === 0 && (!globalSearchResults || globalSearchResults.length === 0)) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-20 text-center px-8"
      >
        <Search size={48} className="text-edu-border mb-4" />
        <h2 className="text-[18px] font-bold text-edu-text mb-1">Natija topilmadi</h2>
        <p className="text-sm text-edu-muted font-medium">Boshqa so'z bilan qidirib ko'ring.</p>
      </motion.div>
    );
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="w-full flex flex-col gap-3"
    >
      {filteredConversations.length > 0 && (
        <div className="flex flex-col gap-3">
          {searchTerm && <h3 className="text-xs font-bold text-edu-muted uppercase tracking-wider mb-1 px-1">Suhbatlar</h3>}
          <AnimatePresence mode="popLayout">
            {filteredConversations.map((conv) => {
          const isGroup = conv.type === 'CUSTOM_GROUP';
          const isOnline = conv.otherUser && userPresence[conv.otherUser.id];
          
          return (
            <motion.div 
              key={conv.chatRoomId}
              variants={item}
              layout
              onClick={() => handleOpenChat(conv.chatRoomId)}
              className="group relative card-base p-4 card-pressable hover:bg-black/5 dark:hover:bg-white/5 transition-all overflow-hidden"
            >
              {/* Unread indicator glow */}
              {conv.unreadCount > 0 && (
                <div className="absolute top-0 left-0 w-1.5 h-full bg-edu-primary shadow-[0_0_10px_rgba(59,130,246,0.6)]" />
              )}
              
              <div className="flex items-center gap-4">
                <div className="relative shrink-0">
                  {isGroup ? (
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
                      <Users size={24} />
                    </div>
                  ) : (
                    <Avatar name={conv.title} avatarUrl={conv.avatarUrl} size="lg" />
                  )}
                  
                  {isOnline && !isGroup && (
                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-edu-surface rounded-full shadow-sm" />
                  )}

                  {conv.unreadCount > 0 && (
                    <motion.span 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-[11px] font-bold rounded-full flex items-center justify-center border-2 border-edu-surface shadow-md"
                    >
                      {conv.unreadCount > 99 ? '99+' : conv.unreadCount}
                    </motion.span>
                  )}
                </div>
                
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="text-[16px] font-bold text-edu-text truncate tracking-tight pr-2 flex items-center gap-1.5">
                      {isGroup && <Users size={14} className="text-edu-muted" />}
                      {conv.title || 'Nomsiz Guruh'}
                    </h3>
                    {conv.lastMessage && (
                      <span className="text-[11px] font-bold text-edu-muted whitespace-nowrap tabular-nums">
                        {timeAgo(conv.lastMessage.createdAt)}
                      </span>
                    )}
                  </div>
                  
                  {/* Tizim xabari yoki file yoki oddiy matn */}
                  <div className="flex items-center gap-1.5">
                    {conv.lastMessage && conv.lastMessage.senderId !== (conv.otherUser?.id || 'none') && conv.lastMessage.type !== 'SYSTEM_EVENT' && (
                      <span className="text-edu-muted shrink-0">
                        {conv.lastMessage.isRead ? <CheckCheck size={14} className="text-blue-500" /> : <Check size={14} />}
                      </span>
                    )}
                    <p className={cn(
                      "text-[14px] truncate flex-1",
                      conv.unreadCount > 0 ? "text-edu-text font-bold" : "text-edu-muted font-medium",
                      conv.lastMessage?.type === 'SYSTEM_EVENT' && "text-blue-500 italic text-[13px]"
                    )}>
                      {conv.lastMessage ? (
                        conv.lastMessage.type === 'SYSTEM_EVENT' 
                          ? conv.lastMessage.content 
                          : (conv.lastMessage.content || (conv.lastMessage.fileType === 'voice' ? '🎤 Ovozli xabar' : '📁 Fayl yuborildi'))
                      ) : (
                        'Hali xabar yo\'q'
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
      </div>
      )}

      {/* Global Message Search Results */}
      {searchTerm.trim().length >= 2 && (
        <div className="mt-6 flex flex-col gap-2">
          <h3 className="text-xs font-bold text-edu-muted uppercase tracking-wider mb-1 px-1">Xabarlar orqali</h3>
          
          {isSearchLoading ? (
            <div className="flex justify-center p-4"><div className="w-6 h-6 border-2 border-edu-primary border-t-transparent rounded-full animate-spin" /></div>
          ) : globalSearchResults?.length > 0 ? (
            <AnimatePresence mode="popLayout">
              {globalSearchResults.map((msg) => (
                <motion.div 
                  key={`msg_${msg.id}`}
                  variants={item}
                  layout
                  onClick={() => handleOpenChat(msg.chatRoomId)}
                  className="group relative card-base p-4 card-pressable hover:bg-black/5 dark:hover:bg-white/5 transition-all overflow-hidden cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <Avatar name={msg.sender?.fullname} avatarUrl={msg.sender?.avatarUrl} size="md" />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <h3 className="text-[14px] font-bold text-edu-text truncate pr-2">
                          {msg.sender?.fullname || 'Foydalanuvchi'}
                        </h3>
                        <span className="text-[10px] font-bold text-edu-muted whitespace-nowrap">
                          {timeAgo(msg.createdAt)}
                        </span>
                      </div>
                      <div className="text-[13px] text-edu-text opacity-90 line-clamp-2 leading-relaxed bg-black/5 dark:bg-white/5 p-2 rounded-lg border-l-2 border-edu-primary/50">
                        {msg.content || (msg.fileId ? '📁 Biriktirma' : '')}
                      </div>
                      <div className="text-[11px] font-bold text-edu-muted mt-2 flex items-center gap-1">
                        <Users size={12} /> {msg.chatRoom?.name || 'Shaxsiy suhbat'}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          ) : (
            <div className="text-center py-6">
              <p className="text-[13px] text-edu-muted font-medium">Boshqa xabar topilmadi</p>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}

export default function ChatListScreen() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const loadConversations = useChatStore((s) => s.loadConversations);

  return (
    <PageLayout className="bg-edu-bg relative overflow-hidden">
      <div className="absolute inset-0 bg-mesh-aurora opacity-10 dark:opacity-30 pointer-events-none" />
      <div className="relative z-10 h-full flex flex-col pt-6 pb-24">
        <div className="px-5 mb-5 shrink-0">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h1 className="text-[34px] font-extrabold text-edu-text tracking-tight leading-none">Xabarlar</h1>
              <p className="text-[14px] font-bold text-edu-muted tracking-wide mt-2">Shaxsiy chatlar va guruhlar</p>
            </div>
            <button 
              onClick={() => {
                hapticLight();
                setIsModalOpen(true);
              }}
              className="w-12 h-12 bg-edu-surface rounded-full flex items-center justify-center border border-edu-border shadow-sm hover:scale-105 active:scale-95 transition-transform text-edu-primary"
            >
              <Plus size={22} />
            </button>
          </div>
          
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-edu-muted group-focus-within:text-edu-primary transition-colors z-10">
              <Search size={18} strokeWidth={2.5} />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Suhbatdosh yoki guruhni qidiring..."
              className="w-full bg-edu-surface/60 backdrop-blur-md border border-edu-border text-edu-text text-[15px] font-medium rounded-xl pl-11 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-edu-primary/30 transition-all shadow-sm placeholder:font-medium placeholder:text-edu-muted"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto scrollbar-hide px-5">
          <SectionErrorBoundary fallbackTitle="Chatlarni yuklashda xatolik">
            <ChatListWidget searchTerm={searchTerm} />
          </SectionErrorBoundary>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <CreateGroupModal 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
            onSuccess={() => loadConversations()} 
          />
        )}
      </AnimatePresence>
    </PageLayout>
  );
}
