import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '../../components/layout/PageLayout';
import { Avatar } from '../../components/ui/Avatar';
import { useChatStore } from '../../store/chatStore';
import { timeAgo, cn } from '../../lib/utils';
import { hapticLight } from '../../lib/telegram';

export default function ChatListScreen() {
  const navigate = useNavigate();
  const conversations = useChatStore((s) => s.conversations);
  const loadConversations = useChatStore((s) => s.loadConversations);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConversations().finally(() => setLoading(false));
    const timer = setInterval(loadConversations, 10000);
    return () => clearInterval(timer);
  }, [loadConversations]);

  const handleOpenChat = (taskId) => {
    hapticLight();
    navigate(`/tasks/${taskId}/chat`);
  };

  return (
    <PageLayout className="bg-white dark:bg-black">
      <div className="pt-6 pb-24 h-full flex flex-col">
        <div className="px-6 mb-6">
          <h1 className="text-[32px] font-black text-gray-900 dark:text-white tracking-tight">Xabarlar</h1>
          <p className="text-[13px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-1">Sizning muloqotlaringiz</p>
        </div>
        
        <div className="flex-1 overflow-y-auto scrollbar-hide px-2">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-50">
              <div className="w-8 h-8 border-3 border-[#007AFF]/30 border-t-[#007AFF] rounded-full animate-spin" />
              <p className="text-[15px] font-bold text-gray-400">Xabarlar yuklanmoqda...</p>
            </div>
          ) : conversations?.length > 0 ? (
            <div className="w-[94%] mx-auto bg-white dark:bg-[#1C1C1E] rounded-[24px] border border-black/[0.03] dark:border-white/[0.03] overflow-hidden shadow-ios">
              {conversations.map((conv) => (
                <div 
                  key={conv.taskId}
                  onClick={() => handleOpenChat(conv.taskId)}
                  className="flex items-center gap-3.5 py-3 px-4 cursor-pointer hover:bg-gray-50/70 dark:hover:bg-white/[0.02] active:bg-gray-100/50 dark:active:bg-white/[0.04] transition-all border-b border-black/[0.03] dark:border-white/[0.05] last:border-b-0"
                >
                  <div className="relative shrink-0">
                    <Avatar name={conv.otherUser.fullname} avatarUrl={conv.otherUser.avatarUrl} size="md" />
                    {conv.unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#007AFF] text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white dark:border-[#1C1C1E] shadow-sm">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <h3 className="text-[14.5px] font-black text-gray-900 dark:text-white truncate tracking-tight">
                        {conv.otherUser.fullname}
                      </h3>
                      {conv.lastMessage && (
                        <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase whitespace-nowrap ml-2">
                          {timeAgo(conv.lastMessage.createdAt)}
                        </span>
                      )}
                    </div>
                    <p className="text-[12px] font-bold text-edu-primary truncate mb-0.5">
                      {conv.taskTitle}
                    </p>
                    <p className={cn(
                      "text-[13px] truncate font-medium",
                      conv.unreadCount > 0 ? "text-gray-900 dark:text-white font-bold" : "text-gray-400 dark:text-gray-500"
                    )}>
                      {conv.lastMessage ? (
                        conv.lastMessage.content || '📁 Fayl yuborildi'
                      ) : (
                        'Hali xabar yo\'q'
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center py-24 px-10">
              <div className="w-20 h-20 bg-gray-50 dark:bg-white/5 rounded-2xl flex items-center justify-center text-4xl mb-6 shadow-inner border border-black/[0.03] dark:border-white/5">
                💬
              </div>
              <h2 className="text-[19px] font-black text-gray-900 dark:text-white mb-2">Chatlar topilmadi</h2>
              <p className="text-[14px] text-gray-400 dark:text-gray-500 font-medium leading-relaxed">
                Hozircha hech qanday suhbat mavjud emas. Vazifalarga taklif berish orqali muloqotni boshlang.
              </p>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
