// src/lib/notifications.js
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
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

export const initNotifications = async () => {
  try {
    if (!firebaseConfig.apiKey) {
      console.warn("Firebase config missing. Push notifications disabled.");
      return;
    }

    const app = initializeApp(firebaseConfig);
    messaging = getMessaging(app);

    // Foreground messages handler
    onMessage(messaging, (payload) => {
      console.log('Message received. ', payload);
      // You can show a custom toast here if needed
    });

  } catch (error) {
    console.error("Firebase init failed", error);
  }
};

export const requestNotificationPermission = async () => {
  if (!messaging) return;

  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const token = await getToken(messaging, { 
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY 
      });
      
      if (token) {
        // Send token to backend
        await usersApi.updatePushToken(token);
        console.log("Push token updated");
        return token;
      }
    }
  } catch (error) {
    console.error("An error occurred while retrieving token. ", error);
  }
};
