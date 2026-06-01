import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '../components/layout/PageLayout';
import { Avatar } from '../components/ui/Avatar';
import { useTelegram } from '../hooks/useTelegram';
import { useChatStore } from '../store/chatStore';
import { timeAgo } from '../lib/utils';

export default function ChatListScreen() {
  const navigate = useNavigate();
  const { HapticFeedback } = useTelegram();
  const { conversations, loadConversations } = useChatStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConversations().finally(() => setLoading(false));
    const timer = setInterval(loadConversations, 10000);
    return () => clearInterval(timer);
  }, [loadConversations]);

  const handleOpenChat = (taskId) => {
    HapticFeedback.impactOccurred('light');
    navigate(`/tasks/${taskId}/chat`);
  };

  return (
    <PageLayout bgClass="bg-slate-50 dark:bg-slate-900">
      <div className="pt-4 pb-24 px-4 h-full flex flex-col">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Xabarlar</h1>
        
        <div className="flex-1 overflow-y-auto space-y-2">
          {loading ? (
            <p className="text-slate-500 text-center py-10">Yuklanmoqda...</p>
          ) : conversations?.length > 0 ? (
            conversations.map((conv) => (
              <div 
                key={conv.taskId}
                onClick={() => handleOpenChat(conv.taskId)}
                className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-4 cursor-pointer active:scale-[0.98] transition-transform"
              >
                <div className="relative">
                  <Avatar name={conv.otherUser.fullname} avatarUrl={conv.otherUser.avatarUrl} size="md" />
                  {conv.unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-slate-800">
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-bold text-slate-900 dark:text-white truncate">
                      {conv.otherUser.fullname}
                    </h3>
                    {conv.lastMessage && (
                      <span className="text-xs text-slate-400 whitespace-nowrap ml-2">
                        {timeAgo(conv.lastMessage.createdAt)}
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400 truncate mb-1">
                    {conv.taskTitle}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                    {conv.lastMessage ? (
                      conv.lastMessage.content || 'Fayl yuborildi'
                    ) : (
                      'Hali xabar yo\'q'
                    )}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
              <span className="text-4xl mb-3">💬</span>
              <p>Chatlar topilmadi</p>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
