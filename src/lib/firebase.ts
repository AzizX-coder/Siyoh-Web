'use client';
// Firebase Cloud Messaging — web client.
// All NEXT_PUBLIC_FIREBASE_* env vars are safe to expose (they identify the
// project, not authenticate it). FCM auth happens server-side in the edge fn
// using the service account private key.

import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import {
  getMessaging, getToken, onMessage,
  type Messaging,
} from 'firebase/messaging';

const config = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

export function firebaseConfigured(): boolean {
  return !!(config.apiKey && config.projectId && config.messagingSenderId && config.appId && VAPID_KEY);
}

let app: FirebaseApp | null = null;
let messaging: Messaging | null = null;

function ensureApp(): FirebaseApp | null {
  if (!firebaseConfigured()) return null;
  if (app) return app;
  app = getApps().length ? getApps()[0] : initializeApp(config as any);
  return app;
}

async function ensureMessaging(): Promise<Messaging | null> {
  if (messaging) return messaging;
  if (typeof window === 'undefined') return null;
  if (!firebaseConfigured()) return null;
  // Lazy: only import on browsers that actually support FCM.
  const { isSupported } = await import('firebase/messaging');
  if (!(await isSupported())) return null;
  const a = ensureApp();
  if (!a) return null;
  messaging = getMessaging(a);
  return messaging;
}

// Request browser permission, register the service worker, fetch the FCM
// token. Caller is responsible for persisting the token (see registerPushToken
// server action).
export async function requestPushPermissionAndToken(): Promise<{ ok: boolean; token?: string; error?: string }> {
  try {
    if (typeof window === 'undefined') return { ok: false, error: 'No window' };
    if (!('Notification' in window)) return { ok: false, error: 'Notifications not supported' };
    if (!firebaseConfigured()) return { ok: false, error: 'Firebase not configured' };

    // Register the messaging service worker once.
    let registration: ServiceWorkerRegistration | undefined;
    if ('serviceWorker' in navigator) {
      registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
    }

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      return { ok: false, error: `Permission ${permission}` };
    }

    const m = await ensureMessaging();
    if (!m) return { ok: false, error: 'Messaging unsupported' };

    const token = await getToken(m, { vapidKey: VAPID_KEY, serviceWorkerRegistration: registration });
    if (!token) return { ok: false, error: 'No token returned' };
    return { ok: true, token };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? 'Unknown' };
  }
}

// Foreground message handler — fires when the tab is focused.
export async function onForegroundMessage(handler: (payload: any) => void) {
  const m = await ensureMessaging();
  if (!m) return () => {};
  return onMessage(m, handler);
}
