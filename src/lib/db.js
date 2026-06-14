import localforage from 'localforage';

// Configure standard localforage DB
localforage.config({
  name: 'EduMarketChatDB',
  storeName: 'chat_store'
});

export const db = {
  // --- Conversations List ---
  async saveConversations(conversations) {
    try {
      await localforage.setItem('conversations', conversations);
    } catch (err) {
      console.error('Failed to save conversations to IndexedDB', err);
    }
  },

  async getConversations() {
    try {
      return await localforage.getItem('conversations');
    } catch (err) {
      console.error('Failed to get conversations from IndexedDB', err);
      return null;
    }
  },

  // --- Messages per Chat Room ---
  async saveMessages(chatRoomId, messages) {
    try {
      // Limit to last 200 messages to prevent QuotaExceededError over time
      const limit = 200;
      const msgsToSave = messages.length > limit ? messages.slice(messages.length - limit) : messages;
      await localforage.setItem(`messages_${chatRoomId}`, msgsToSave);
    } catch (err) {
      console.error(`Failed to save messages for ${chatRoomId}`, err);
    }
  },

  async getMessages(chatRoomId) {
    try {
      return await localforage.getItem(`messages_${chatRoomId}`);
    } catch (err) {
      console.error(`Failed to get messages for ${chatRoomId}`, err);
      return null;
    }
  },

  async clearAll() {
    try {
      await localforage.clear();
    } catch (err) {
      console.error('Failed to clear IndexedDB', err);
    }
  }
};
