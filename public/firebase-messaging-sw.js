// public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

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
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/favicon.svg'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
