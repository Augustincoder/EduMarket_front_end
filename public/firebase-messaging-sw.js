/* global firebase, importScripts */
// public/firebase-messaging-sw.js
// NOTE: Service workers cannot read Vite env vars, so this config must be kept
// in sync with the VITE_FIREBASE_* variables (see .env.example).
// Firebase web config values are public app identifiers, not secrets.
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyARVihbIUnHdzJZrXDN_hRsmMJSjUUE3-M",
  authDomain: "edumarket-61bef.firebaseapp.com",
  projectId: "edumarket-61bef",
  storageBucket: "edumarket-61bef.firebasestorage.app",
  messagingSenderId: "840802545705",
  appId: "1:840802545705:web:ccd1c08efc1873dcb0ac38"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const notification = payload?.notification;
  if (!notification?.title) return;

  self.registration.showNotification(notification.title, {
    body: notification.body || '',
    icon: '/favicon.svg',
  });
});
