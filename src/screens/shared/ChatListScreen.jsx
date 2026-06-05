import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '../../components/layout/PageLayout';
import { Avatar } from '../../components/ui/Avatar';
import { useTelegram } from '../../hooks/useTelegram';
import { useChatStore } from '../../store/chatStore';
import { timeAgo } from '../../lib/utils';

export default function ChatListScreen() {
  const navigate = useNavigate();
  const { HapticFeedback } = useTelegram();
  const conversations = useChatStore((s) => s.conversations);
  const loadConversations = useChatStore((s) => s.loadConversations);
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
    <PageLayout>
      <div className="pt-4 pb-24 px-4 h-full flex flex-col">
        <h1 className="text-2xl font-bold text-edu-text mb-4">Xabarlar</h1>
        
        <div className="flex-1 overflow-y-auto space-y-2">
          {loading ? (
            <p className="text-edu-muted text-center py-10 font-medium">Yuklanmoqda...</p>
          ) : conversations?.length > 0 ? (
            conversations.map((conv) => (
              <div 
                key={conv.taskId}
                onClick={() => handleOpenChat(conv.taskId)}
                className="bg-edu-surface p-4 rounded-2xl border border-edu-border/40 shadow-card flex items-center gap-4 cursor-pointer press-scale"
              >
                <div className="relative">
                  <Avatar name={conv.otherUser.fullname} avatarUrl={conv.otherUser.avatarUrl} size="md" />
                  {conv.unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-edu-primary text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-edu-surface shadow-sm">
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-bold text-edu-text truncate">
                      {conv.otherUser.fullname}
                    </h3>
                    {conv.lastMessage && (
                      <span className="text-xs text-edu-muted whitespace-nowrap ml-2">
                        {timeAgo(conv.lastMessage.createdAt)}
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-bold text-edu-primary truncate mb-1">
                    {conv.taskTitle}
                  </p>
                  <p className="text-sm text-edu-muted truncate">
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
            <div className="h-full flex flex-col items-center justify-center text-edu-muted py-20">
              <span className="text-5xl mb-4">💬</span>
              <p className="font-bold">Chatlar topilmadi</p>
              <p className="text-sm mt-1 opacity-70">Suhbatlaringiz shu yerda ko'rinadi</p>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
