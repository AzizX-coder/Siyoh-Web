// Siyoh — Firebase Cloud Messaging service worker (background notifications).
//
// MUST live at /firebase-messaging-sw.js so the FCM SDK can register it.
// MUST be served with Content-Type: application/javascript (Next.js does this
// automatically for files under /public).
//
// SAFETY: this worker contains only your Firebase WEB config (apiKey,
// projectId, messagingSenderId, appId). These are intentionally public —
// they identify your project, they don't authorize writes. The dangerous
// secret is the server-side service-account JSON, which lives only in the
// Supabase edge function env.
//
// Replace the placeholder config below with values from:
//   Firebase console → Project settings → General → Your apps → Web app config

importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey:            'REPLACE_ME',
  authDomain:        'siyoh-app.firebaseapp.com',
  projectId:         'siyoh-app',
  messagingSenderId: 'REPLACE_ME',
  appId:             'REPLACE_ME',
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || payload.data?.title || 'Siyoh';
  const body  = payload.notification?.body  || payload.data?.body  || '';
  const url   = payload.fcmOptions?.link    || payload.data?.url   || '/';
  self.registration.showNotification(title, {
    body,
    icon: '/icon.svg',
    badge: '/icon.svg',
    tag: payload.data?.tag || title,
    data: { url },
  });
});

// Clicking a notification opens or focuses the target URL.
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow(url);
    })
  );
});
