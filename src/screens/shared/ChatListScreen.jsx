import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '../../components/layout/PageLayout';
import { Avatar } from '../../components/ui/Avatar';
import { useChatStore } from '../../store/chatStore';
import { timeAgo, cn } from '../../lib/utils';
import { hapticLight } from '../../lib/telegram';
import { SectionErrorBoundary } from '../../components/ui/SectionErrorBoundary';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MessageSquare, Check, CheckCheck } from 'lucide-react';

function ChatListWidget({ searchTerm }) {
  const navigate = useNavigate();
  const conversations = useChatStore((s) => s.conversations);
  const loadConversations = useChatStore((s) => s.loadConversations);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadConversations()
      .catch((err) => setError(err))
      .finally(() => setLoading(false));

    const timer = setInterval(() => {
      loadConversations().catch(console.error); // Silent catch for polling
    }, 10000);
    
    return () => clearInterval(timer);
  }, [loadConversations]);

  if (error) {
    throw error;
  }

  const handleOpenChat = (taskId) => {
    hapticLight();
    navigate(`/tasks/${taskId}/chat`);
  };

  const filteredConversations = useMemo(() => {
    if (!conversations) return [];
    if (!searchTerm) return conversations;
    const lower = searchTerm.toLowerCase();
    return conversations.filter(conv => 
      conv.otherUser.fullname.toLowerCase().includes(lower) || 
      conv.taskTitle.toLowerCase().includes(lower) ||
      (conv.lastMessage?.content && conv.lastMessage.content.toLowerCase().includes(lower))
    );
  }, [conversations, searchTerm]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-50">
        <div className="w-8 h-8 border-3 border-edu-primary/30 border-t-edu-primary rounded-full animate-spin" />
        <p className="text-[15px] font-bold text-gray-400">Xabarlar yuklanmoqda...</p>
      </div>
    );
  }

  if (!conversations || conversations.length === 0) {
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
          Hozircha hech qanday suhbat mavjud emas. Vazifalarga taklif berish orqali muloqotni boshlang.
        </p>
      </motion.div>
    );
  }

  if (filteredConversations.length === 0) {
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
      <AnimatePresence mode="popLayout">
        {filteredConversations.map((conv) => (
          <motion.div 
            key={conv.taskId}
            variants={item}
            layout
            onClick={() => handleOpenChat(conv.taskId)}
            className="group relative card-base p-4 card-pressable hover:bg-black/5 dark:hover:bg-white/5 transition-all overflow-hidden"
          >
            {/* Unread indicator glow */}
            {conv.unreadCount > 0 && (
              <div className="absolute top-0 left-0 w-1.5 h-full bg-edu-primary shadow-[0_0_10px_rgba(59,130,246,0.6)]" />
            )}
            
            <div className="flex items-center gap-4">
              <div className="relative shrink-0">
                <Avatar name={conv.otherUser.fullname} avatarUrl={conv.otherUser.avatarUrl} size="lg" />
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
                  <h3 className="text-[16px] font-bold text-edu-text truncate tracking-tight pr-2">
                    {conv.otherUser.fullname}
                  </h3>
                  {conv.lastMessage && (
                    <span className="text-[11px] font-bold text-edu-muted whitespace-nowrap tabular-nums">
                      {timeAgo(conv.lastMessage.createdAt)}
                    </span>
                  )}
                </div>
                
                <p className="text-[13px] font-bold text-edu-primary truncate mb-1">
                  {conv.taskTitle}
                </p>
                
                <div className="flex items-center gap-1.5">
                  {conv.lastMessage && conv.lastMessage.senderId !== conv.otherUser.id && (
                    <span className="text-edu-muted shrink-0">
                      {conv.lastMessage.isRead ? <CheckCheck size={14} className="text-blue-500" /> : <Check size={14} />}
                    </span>
                  )}
                  <p className={cn(
                    "text-[14px] truncate flex-1",
                    conv.unreadCount > 0 ? "text-edu-text font-bold" : "text-edu-muted font-medium"
                  )}>
                    {conv.lastMessage ? (
                      conv.lastMessage.content || '📁 Fayl yuborildi'
                    ) : (
                      'Hali xabar yo\'q'
                    )}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}

export default function ChatListScreen() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <PageLayout className="bg-edu-bg relative overflow-hidden">
      <div className="absolute inset-0 bg-mesh-aurora opacity-10 dark:opacity-30 pointer-events-none" />
      <div className="relative z-10 h-full flex flex-col pt-6 pb-24">
        <div className="px-5 mb-5 shrink-0">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h1 className="text-[34px] font-extrabold text-edu-text tracking-tight leading-none">Xabarlar</h1>
              <p className="text-[14px] font-bold text-edu-muted tracking-wide mt-2">Sizning muloqotlaringiz</p>
            </div>
            <div className="w-12 h-12 bg-edu-surface rounded-full flex items-center justify-center border border-edu-border shadow-sm">
              <MessageSquare size={22} className="text-edu-primary" />
            </div>
          </div>
          
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-edu-muted group-focus-within:text-edu-primary transition-colors z-10">
              <Search size={18} strokeWidth={2.5} />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Suhbatdosh yoki vazifani qidiring..."
              className="w-full bg-edu-surface/60 backdrop-blur-md border border-edu-border text-edu-text text-[15px] font-medium rounded-2xl pl-11 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-edu-primary/30 transition-all shadow-sm placeholder:font-medium placeholder:text-edu-muted"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto scrollbar-hide px-5">
          <SectionErrorBoundary fallbackTitle="Chatlarni yuklashda xatolik">
            <ChatListWidget searchTerm={searchTerm} />
          </SectionErrorBoundary>
        </div>
      </div>
    </PageLayout>
  );
}
