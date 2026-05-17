'use client';
import { useEffect, useState } from 'react';
import { Icon } from './Icon';
import { tokens } from '@/lib/tokens';
import { useTheme } from './ThemeProvider';
import { useToast } from './Toast';
import { firebaseConfigured, requestPushPermissionAndToken } from '@/lib/firebase';
import { registerPushToken } from '@/lib/actions';

// Lightweight one-time banner that shows when:
//   • Firebase is configured (env vars present)
//   • Browser supports the Notifications API
//   • Current permission is 'default' (user hasn't decided)
//   • localStorage flag isn't set (user dismissed)
// On accept it requests permission, gets the FCM token, persists via
// registerPushToken. On dismiss it remembers and never shows again.

const DISMISSED_KEY = 'siyoh-push-dismissed';

export function PushOptIn() {
  const { dark } = useTheme();
  const { push } = useToast();
  const ink = dark ? tokens.darkInk : tokens.ink;
  const mute = dark ? tokens.darkMute : tokens.mute;
  const line = dark ? tokens.darkLine : tokens.line;
  const [show, setShow] = useState(false);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('Notification' in window)) return;
    if (!firebaseConfigured()) return;
    if (Notification.permission !== 'default') return;
    if (localStorage.getItem(DISMISSED_KEY) === '1') return;
    // Tiny delay so the banner doesn't compete with first paint.
    const t = setTimeout(() => setShow(true), 1800);
    return () => clearTimeout(t);
  }, []);

  function dismiss() {
    localStorage.setItem(DISMISSED_KEY, '1');
    setShow(false);
  }

  async function enable() {
    setPending(true);
    const res = await requestPushPermissionAndToken();
    if (res.ok && res.token) {
      const platform: 'web' = 'web';
      const device = typeof navigator !== 'undefined'
        ? `${navigator.platform || 'web'} · ${navigator.userAgent.slice(0, 60)}`
        : 'web';
      const persist = await registerPushToken({ token: res.token, platform, device });
      if (persist.ok) {
        push({ kind: 'success', title: 'Bildirishnomalar yoqildi' });
        localStorage.setItem(DISMISSED_KEY, '1');
        setShow(false);
      } else {
        push({ kind: 'error', title: 'Saqlab bo\'lmadi', body: persist.error });
      }
    } else {
      push({ kind: 'error', title: 'Bildirishnomalar yoqilmadi', body: res.error });
    }
    setPending(false);
  }

  if (!show) return null;

  return (
    <div className="anim-fade-up" style={{
      position: 'fixed', bottom: 18, left: 18, right: 18, zIndex: 80,
      display: 'flex', justifyContent: 'center', pointerEvents: 'none',
    }}>
      <div className="card" style={{
        pointerEvents: 'auto',
        padding: '14px 18px',
        display: 'flex', alignItems: 'center', gap: 14, maxWidth: 540,
        boxShadow: '0 18px 40px rgba(26,22,19,0.16)',
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: 'rgba(255,87,34,0.10)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}><Icon.bell s={18} c={tokens.orangeDeep} /></div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: 'var(--font-geist)', fontSize: 13.5, color: ink, fontWeight: 600 }}>
            Bildirishnomalarni yoqing
          </div>
          <div style={{ fontFamily: 'var(--font-geist)', fontSize: 12, color: mute }}>
            Yangi sharhlar va kuzatuvchilar haqida xabardor bo&apos;ling.
          </div>
        </div>
        <button onClick={dismiss} aria-label="Dismiss" className="press" style={{
          height: 30, padding: '0 10px', borderRadius: 8, border: `1px solid ${line}`,
          background: 'transparent', color: mute, cursor: 'pointer',
          fontFamily: 'var(--font-geist)', fontSize: 12, fontWeight: 500,
        }}>Keyinroq</button>
        <button onClick={enable} disabled={pending} className="press" style={{
          height: 30, padding: '0 14px', borderRadius: 8, border: 'none', cursor: pending ? 'wait' : 'pointer',
          background: tokens.orangeGrad, color: '#fff',
          fontFamily: 'var(--font-geist)', fontSize: 12, fontWeight: 600,
          boxShadow: '0 4px 12px rgba(255,87,34,0.28)',
          opacity: pending ? 0.7 : 1,
        }}>{pending ? '…' : 'Yoqish'}</button>
      </div>
    </div>
  );
}
