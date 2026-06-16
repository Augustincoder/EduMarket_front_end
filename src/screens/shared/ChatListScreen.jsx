import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '../../components/layout/PageLayout';
import { Avatar } from '../../components/ui/Avatar';
import { useChatStore } from '../../store/chatStore';
import { useAuthStore } from '../../store/authStore';
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
  const user = useAuthStore((s) => s.user);
  const conversations = useChatStore((s) => s.conversations);
  const loadConversations = useChatStore((s) => s.loadConversations);
  const userPresence = useChatStore((s) => s.userPresence);
  const typingUsers = useChatStore((s) => s.typingUsers);
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
              const isTyping = typingUsers?.[conv.chatRoomId]?.length > 0;
              const hasUnread = conv.unreadCount > 0;
              
              return (
                <motion.div 
                  key={conv.chatRoomId}
                  variants={item}
                  layout
                  onClick={() => handleOpenChat(conv.chatRoomId)}
                  whileTap={{ scale: 0.98, backgroundColor: 'rgba(0,0,0,0.03)' }}
                  className={cn(
                    "group relative flex items-center gap-3.5 p-2 rounded-2xl cursor-pointer transition-colors overflow-hidden mx-1",
                    hasUnread ? "bg-blue-50/50 dark:bg-blue-900/10" : "hover:bg-black/5 dark:hover:bg-white/5"
                  )}
                >
                  {/* Unread Left Dot Magic (Design Spells) */}
                  <AnimatePresence>
                    {hasUnread && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-r-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]"
                      />
                    )}
                  </AnimatePresence>

                  {/* Avatar Area */}
                  <div className="relative shrink-0 ml-1.5">
                    {isGroup ? (
                      <div className="w-[52px] h-[52px] rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-sm border border-black/5">
                        <Users size={24} strokeWidth={2.5} />
                      </div>
                    ) : (
                      <Avatar name={conv.title} avatarUrl={conv.avatarUrl} size="lg" className="shadow-sm border border-black/5" />
                    )}
                    
                    {/* Online indicator with breathing magic */}
                    <AnimatePresence>
                      {isOnline && !isGroup && (
                        <motion.div 
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          className="absolute bottom-0 right-0 z-10"
                        >
                          <div className="w-[14px] h-[14px] bg-green-500 border-[2.5px] border-edu-bg rounded-full shadow-sm relative">
                            <motion.div 
                              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                              className="absolute inset-0 bg-green-500 rounded-full"
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  
                  {/* Text Content */}
                  <div className="flex-1 min-w-0 flex flex-col justify-center h-[52px] border-b border-edu-border/40 pb-1 group-last:border-b-0">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <h3 className="text-[16px] font-semibold text-edu-text truncate pr-2 flex items-center gap-1">
                        {isGroup && <Users size={13} className="text-edu-muted shrink-0" />}
                        {conv.title || 'Nomsiz Guruh'}
                      </h3>
                      {conv.lastMessage && (
                        <span className={cn(
                          "text-[12px] whitespace-nowrap tabular-nums shrink-0",
                          hasUnread ? "text-blue-500 font-bold" : "text-edu-muted font-medium"
                        )}>
                          {timeAgo(conv.lastMessage.createdAt)}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1 flex-1 min-w-0">
                        {/* Read Receipt if I'm the sender */}
                        {conv.lastMessage && conv.lastMessage.senderId === user?.id && conv.lastMessage.type !== 'SYSTEM_EVENT' && !isTyping && (
                          <span className="shrink-0 mr-0.5">
                            {conv.lastMessage.isRead ? (
                              <CheckCheck size={14} className="text-blue-500" />
                            ) : (
                              <Check size={14} className="text-edu-muted" />
                            )}
                          </span>
                        )}
                        
                        {/* Message Preview or Typing */}
                        {isTyping ? (
                          <motion.p 
                            initial={{ opacity: 0, x: -5 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-[14px] text-blue-500 font-medium truncate italic"
                          >
                            Yozmoqda...
                          </motion.p>
                        ) : (
                          <p className={cn(
                            "text-[14px] truncate flex-1",
                            hasUnread ? "text-edu-text font-semibold" : "text-edu-muted",
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
                        )}
                      </div>
                      
                      {/* Unread Badge Right Side (iOS Telegram style) */}
                      <AnimatePresence>
                        {hasUnread && (
                          <motion.div 
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                            className="shrink-0 min-w-[20px] h-[20px] px-1.5 bg-blue-500 text-white text-[11px] font-bold rounded-full flex items-center justify-center shadow-[0_2px_8px_rgba(59,130,246,0.4)]"
                          >
                            {conv.unreadCount > 99 ? '99+' : conv.unreadCount}
                          </motion.div>
                        )}
                      </AnimatePresence>
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
                  whileTap={{ scale: 0.98, backgroundColor: 'rgba(0,0,0,0.03)' }}
                  className="group relative flex items-start gap-3.5 p-2 rounded-2xl cursor-pointer transition-colors overflow-hidden mx-1 hover:bg-black/5 dark:hover:bg-white/5"
                >
                  <div className="relative shrink-0 ml-1.5 pt-1">
                    <Avatar name={msg.sender?.fullname} avatarUrl={msg.sender?.avatarUrl} size="lg" className="shadow-sm border border-black/5" />
                  </div>
                  
                  <div className="flex-1 min-w-0 flex flex-col justify-center border-b border-edu-border/40 pb-2 group-last:border-b-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className="text-[16px] font-semibold text-edu-text truncate pr-2">
                        {msg.sender?.fullname || 'Foydalanuvchi'}
                      </h3>
                      <span className="text-[12px] font-medium text-edu-muted whitespace-nowrap tabular-nums">
                        {timeAgo(msg.createdAt)}
                      </span>
                    </div>
                    
                    <div className="text-[14px] text-edu-text font-medium line-clamp-2 leading-relaxed bg-black/5 dark:bg-white/5 px-2.5 py-1.5 rounded-xl border-l-[3px] border-edu-primary/60 mb-1.5">
                      {msg.content || (msg.fileId ? '📁 Biriktirma' : '')}
                    </div>
                    
                    <div className="text-[12px] font-medium text-edu-muted flex items-center gap-1.5">
                      <Users size={13} className="opacity-70" /> {msg.chatRoom?.name || 'Shaxsiy suhbat'}
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
      <div className="relative z-10 h-full flex flex-col pt-4 pb-24">
        <div className="px-4 mb-4 shrink-0">
          <div className="flex items-center justify-between mb-3 px-1">
            <h1 className="text-[32px] font-bold text-edu-text tracking-tight">Xabarlar</h1>
            <button 
              onClick={() => {
                hapticLight();
                setIsModalOpen(true);
              }}
              className="w-10 h-10 bg-black/5 dark:bg-white/10 rounded-full flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/20 active:scale-95 transition-all text-edu-primary"
            >
              <Plus size={22} strokeWidth={2.5} />
            </button>
          </div>
          
          <div className="relative group mx-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-edu-muted group-focus-within:text-edu-primary transition-colors z-10">
              <Search size={18} strokeWidth={2.5} />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Qidirish"
              className="w-full bg-black/5 dark:bg-white/10 text-edu-text text-[16px] font-medium rounded-[14px] pl-10 pr-4 py-2.5 focus:outline-none focus:bg-black/10 dark:focus:bg-white/20 transition-all placeholder:font-medium placeholder:text-edu-muted"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto scrollbar-hide px-2">
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
