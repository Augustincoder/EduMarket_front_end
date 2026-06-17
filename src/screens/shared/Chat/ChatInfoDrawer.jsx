import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { chatApi } from '../../../services/chat.service';
import { useNavigate } from 'react-router-dom';
import { Users, UserPlus, Image as ImageIcon, FileText, ChevronLeft, LogOut, Trash2 } from 'lucide-react';
import { Avatar } from '../../../components/ui/Avatar';
import { cn } from '../../../lib/utils';
import { filesApi } from '../../../services/other.service';
import { showAlert, showConfirm } from '../../../lib/telegram';

function MediaItem({ media }) {
  const [url, setUrl] = useState(null);
  
  useEffect(() => {
    let isMounted = true;
    if (media.fileType === 'photo' || media.fileName?.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
      const publicUrl = filesApi.getPublicUrl(media.fileId);
      if (publicUrl) {
        Promise.resolve().then(() => { if (isMounted) setUrl(publicUrl) });
        return;
      }
      filesApi.getUrl(media.fileId).then(res => {
        if (isMounted) setUrl(res.data.data.url);
      }).catch(() => {});
    }
    return () => { isMounted = false; };
  }, [media]);

  if (url) {
    return <img src={url} alt="Media" className="w-full aspect-square object-cover rounded-lg bg-edu-surface" />;
  }
  return (
    <div className="w-full aspect-square rounded-lg bg-edu-surface flex flex-col items-center justify-center border border-edu-border/50">
      <FileText size={20} className="text-edu-muted mb-1" />
      <span className="text-[10px] text-edu-muted max-w-[90%] truncate px-1">{media.fileName || 'Fayl'}</span>
    </div>
  );
}

export function ChatInfoDrawer({ isOpen, onClose, chatRoomId, conversation, currentUser, onViewFile, _onJumpToMessage }) {
  const navigate = useNavigate();
  const isGroup = conversation?.type === 'CUSTOM_GROUP' || conversation?.type === 'TASK_ROOM';
  const isCustomGroup = conversation?.type === 'CUSTOM_GROUP';

  const [activeTab, setActiveTab] = useState('media'); // default to media, sync below
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [invitingId, setInvitingId] = useState(null);

  const { data: info, refetch } = useQuery({
    queryKey: ['chatRoomInfo', chatRoomId],
    queryFn: () => chatApi.getChatRoomInfo(chatRoomId).then(r => r.data.data),
    enabled: isOpen
  });

  // Real-time info refresh listener
  useEffect(() => {
    const handleUpdate = (e) => {
      if (e.detail?.chatRoomId === chatRoomId) {
        refetch();
      }
    };
    window.addEventListener('chat_info_update', handleUpdate);
    return () => window.removeEventListener('chat_info_update', handleUpdate);
  }, [chatRoomId, refetch]);

  const hasSyncedTab = useRef(false);

  // Sync tab when group status is detected
  useEffect(() => {
    if (isOpen && isGroup && activeTab === 'media' && !hasSyncedTab.current) {
      setActiveTab('members');
      hasSyncedTab.current = true;
    }
  }, [isGroup, isOpen, activeTab]);

  // Reset sync ref when drawer closes
  useEffect(() => {
    if (!isOpen) {
      hasSyncedTab.current = false;
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    if (activeTab === 'invite' && searchQuery.trim().length > 1) {
      Promise.resolve().then(() => setLoadingSearch(true));
      chatApi.searchUsersForInvite(chatRoomId, searchQuery)
        .then(res => setSearchResults(res.data.data))
        .catch(() => {})
        .finally(() => setLoadingSearch(false));
    } else {
      Promise.resolve().then(() => setSearchResults([]));
    }
  }, [searchQuery, activeTab, isOpen, chatRoomId]);

  if (!isOpen) return null;

  const participants = info?.participants || [];
  const mediaFiles = info?.media || [];

  const handleInvite = async (userId) => {
    setInvitingId(userId);
    try {
      await chatApi.sendInvite(chatRoomId, userId);
      setSearchResults(prev => prev.filter(u => u.id !== userId));
      showAlert('Taklif yuborildi!');
    } catch (err) {
      showAlert(err.response?.data?.message || 'Xatolik');
    } finally {
      setInvitingId(null);
    }
  };

  const handleLeave = async () => {
    showConfirm("Rostdan ham guruhni tark etmoqchimisiz?", async (ok) => {
      if (ok) {
        try {
          await chatApi.leaveGroup(chatRoomId);
          window.location.href = '/chats';
        } catch (err) {
          showAlert("Xatolik: " + err.message);
        }
      }
    });
  };

  const handleKick = async (userId) => {
    showConfirm("Bu ishtirokchini guruhdan chetlatmoqchimisiz?", async (ok) => {
      if (ok) {
        try {
          await chatApi.removeParticipant(chatRoomId, userId);
          refetch();
        } catch (err) {
          showAlert("Xatolik: " + (err.response?.data?.message || err.message));
        }
      }
    });
  };

  const handleOpenDirectChat = async (userId) => {
    if (userId === currentUser?.id) return;
    try {
      const res = await chatApi.getOrCreateDirect(userId);
      onClose(); // Drawer ni yopamiz
      navigate(`/chat/${res.data.data.id}`);
    } catch (err) {
      showAlert("Chat ochishda xatolik: " + (err.response?.data?.message || err.message));
    }
  };

  const myRole = participants.find(p => p.userId === currentUser?.id)?.role;
  const canManage = isCustomGroup && (myRole === 'OWNER' || myRole === 'ADMIN');

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          key="drawer-backdrop"
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }} 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 md:hidden"
          onClick={onClose}
        />
      )}
      {isOpen && (
        <motion.div 
          key="drawer-panel"
          initial={{ x: '100%' }} 
          animate={{ x: 0 }} 
          exit={{ x: '100%' }} 
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed inset-y-0 right-0 z-50 w-full md:w-[400px] bg-edu-bg border-l border-edu-border shadow-2xl flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center px-4 py-3 border-b border-edu-border bg-edu-surface">
            <button onClick={onClose} className="p-2 -ml-2 text-edu-muted hover:text-edu-text rounded-full hover:bg-black/5 transition-colors">
              <ChevronLeft size={24} />
            </button>
            <h2 className="ml-2 font-bold text-lg text-edu-text">Ma'lumot</h2>
          </div>

          {/* Profile Info */}
          <div className="flex flex-col items-center py-6 border-b border-edu-border bg-edu-surface">
            {isGroup ? (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white mb-3 shadow-lg">
                <Users size={40} />
              </div>
            ) : (
              <Avatar name={conversation?.displayTitle || conversation?.title} avatarUrl={conversation?.otherUser?.avatarUrl} size="xl" className="mb-3 shadow-lg w-24 h-24 text-3xl" />
            )}
            <h1 className="text-xl font-bold text-edu-text tracking-tight">{conversation?.displayTitle || conversation?.title}</h1>
            {isGroup && (
              <p className="text-sm text-edu-muted mt-1">{participants.length} a'zo</p>
            )}
          </div>

          {/* Tabs */}
          <div className="flex border-b border-edu-border bg-edu-surface sticky top-0 z-10">
            {isGroup && (
              <button 
                onClick={() => setActiveTab('members')}
                className={cn("flex-1 py-3 text-sm font-bold transition-all", activeTab === 'members' ? "text-edu-primary border-b-2 border-edu-primary" : "text-edu-muted hover:bg-black/5")}
              >
                A'zolar
              </button>
            )}
            <button 
              onClick={() => setActiveTab('media')}
              className={cn("flex-1 py-3 text-sm font-bold transition-all", activeTab === 'media' ? "text-edu-primary border-b-2 border-edu-primary" : "text-edu-muted hover:bg-black/5")}
            >
              Media
            </button>
            {canManage && (
              <button 
                onClick={() => setActiveTab('invite')}
                className={cn("flex-1 py-3 text-sm font-bold transition-all", activeTab === 'invite' ? "text-edu-primary border-b-2 border-edu-primary" : "text-edu-muted hover:bg-black/5")}
              >
                Taklif
              </button>
            )}
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto bg-edu-bg p-4 space-y-4">
            
            {activeTab === 'members' && isGroup && (
              <div className="space-y-3">
                {participants.map(p => (
                  <div key={p.id} className="flex items-center justify-between p-3 bg-edu-surface rounded-xl border border-edu-border/50 hover:bg-black/5 dark:hover:bg-white/5 transition-colors group">
                    <div 
                      className="flex items-center gap-3 flex-1 cursor-pointer"
                      onClick={() => handleOpenDirectChat(p.userId)}
                    >
                      <Avatar name={p.user.fullname} avatarUrl={p.user.avatarUrl} size="md" />
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-sm text-edu-text leading-tight group-hover:text-edu-primary transition-colors">{p.user.fullname}</p>
                          {p.role === 'OWNER' && <span className="text-[10px] bg-indigo-500/10 text-indigo-500 px-1.5 py-0.5 rounded font-bold uppercase">Asoschi</span>}
                          {p.role === 'ADMIN' && <span className="text-[10px] bg-blue-500/10 text-blue-500 px-1.5 py-0.5 rounded font-bold uppercase">Admin</span>}
                        </div>
                      </div>
                    </div>
                    
                    {canManage && p.userId !== currentUser?.id && p.role !== 'OWNER' && (
                      <button 
                        onClick={() => handleKick(p.userId)}
                        className="p-2 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Guruhdan o'chirish"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
                
                <button 
                  onClick={handleLeave}
                  className="w-full flex items-center justify-center gap-2 py-3 mt-4 text-red-500 bg-red-50 rounded-xl font-bold active:scale-[0.98] transition-transform"
                >
                  <LogOut size={18} /> Guruhni tark etish
                </button>
              </div>
            )}

            {activeTab === 'media' && (
              mediaFiles.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 opacity-50">
                  <ImageIcon size={48} className="mb-3" />
                  <p className="text-sm font-medium">Hali hech qanday media yo'q</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {mediaFiles.map(media => (
                    <div 
                      key={media.id} 
                      className="cursor-pointer active:scale-95 transition-transform"
                      onClick={() => {
                        const ext = media.fileName?.split('.').pop().toLowerCase();
                        const isImg = ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext);
                        onViewFile?.(media.fileId, media.fileName, false, isImg ? 'image/jpeg' : '');
                      }}
                    >
                      <MediaItem media={media} />
                    </div>
                  ))}
                </div>
              )
            )}

            {activeTab === 'invite' && isGroup && canManage && (
              <div className="space-y-4">
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Username bo'yicha qidiring..." 
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full bg-edu-surface border border-edu-border rounded-xl pl-4 pr-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-edu-primary/30 transition-all"
                  />
                </div>

                {loadingSearch ? (
                  <div className="text-center py-6"><div className="w-6 h-6 border-2 border-edu-primary border-t-transparent rounded-full animate-spin mx-auto" /></div>
                ) : searchResults.length > 0 ? (
                  <div className="space-y-2">
                    {searchResults.map(u => (
                      <div key={u.id} className="flex items-center justify-between bg-edu-surface p-3 rounded-xl border border-edu-border/50">
                        <div className="flex items-center gap-3">
                          <Avatar name={u.fullname} avatarUrl={u.avatarUrl} size="sm" />
                          <div>
                            <p className="text-sm font-bold text-edu-text leading-tight">{u.fullname}</p>
                            <p className="text-[11px] text-edu-muted">@{u.username}</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleInvite(u.id)}
                          disabled={invitingId === u.id}
                          className="p-1.5 bg-edu-primary/10 text-edu-primary rounded-lg hover:bg-edu-primary/20 transition-colors disabled:opacity-50"
                        >
                          <UserPlus size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : searchQuery.length > 2 ? (
                  <p className="text-center text-sm text-edu-muted py-6">Foydalanuvchi topilmadi</p>
                ) : (
                  <p className="text-center text-xs text-edu-muted py-6">Qidirish uchun kamida 3ta belgi kiriting</p>
                )}
              </div>
            )}

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
