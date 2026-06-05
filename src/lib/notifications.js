// src/lib/notifications.js
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage, isSupported } from "firebase/messaging";
import { usersApi } from "../services/users.service";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

let messaging = null;

/**
 * Manual check for required Web Push APIs.
 * This is more reliable in TMA/WebView than Firebase's isSupported() alone.
 */
const hasRequiredAPIs = () => {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'Notification' in window &&
    'PushManager' in window &&
    'indexedDB' in window &&
    window.indexedDB !== null
  );
};

export const initNotifications = async () => {
  try {
    if (!firebaseConfig.apiKey) return;

    // 1. Pre-flight check: If basic APIs are missing, don't even try to load Firebase Messaging
    if (!hasRequiredAPIs()) {
      console.info("Push notifications are not supported in this environment (TMA/WebView).");
      return;
    }

    const app = initializeApp(firebaseConfig);
    
    // 2. Secondary check using SDK helper
    const supported = await isSupported().catch(() => false);
    if (!supported) return;

    messaging = getMessaging(app);

    // Foreground messages handler
    onMessage(messaging, (payload) => {
      console.log('Message received. ', payload);
    });

  } catch (error) {
    // Silently fail for compatibility reasons in TMA
    console.warn("Notification system initialization skipped:", error.message);
  }
};

export const requestNotificationPermission = async () => {
  // If messaging didn't initialize, just return
  if (!messaging || !hasRequiredAPIs()) return;

  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const token = await getToken(messaging, { 
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY 
      });
      
      if (token) {
        await usersApi.updatePushToken(token);
        return token;
      }
    }
  } catch (error) {
    // Standard error log, but won't crash the app
    console.warn("Could not retrieve push token:", error.message);
  }
};
