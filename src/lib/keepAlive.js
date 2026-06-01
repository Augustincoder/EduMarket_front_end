// src/lib/keepAlive.js
import axios from 'axios';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

export function initKeepAlive() {
  // Ping server every 10 minutes to avoid Render sleep
  const TEN_MINUTES = 10 * 60 * 1000;
  
  setInterval(async () => {
    try {
      await axios.get(`${SOCKET_URL}/ping`, { timeout: 5000 });
      console.log('Keep-alive ping successful');
    } catch (err) {
      console.warn('Keep-alive ping failed:', err.message);
    }
  }, TEN_MINUTES);
}
