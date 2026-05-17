// Siyoh — notify-user Edge Function (Deno).
//
// Deploy:
//   supabase functions deploy notify-user --no-verify-jwt
//
// Required secrets (set via `supabase secrets set` or dashboard):
//   FCM_PROJECT_ID         = your Firebase project ID
//   FCM_SERVICE_ACCOUNT    = the FULL service account JSON, on one line
//                            (Firebase console → Project settings → Service accounts → Generate new key)
//   NOTIFY_SHARED_SECRET   = arbitrary string; DB triggers send this as `Authorization: Bearer ...`
//   SUPABASE_URL           = (set automatically)
//   SUPABASE_SERVICE_ROLE_KEY = (set automatically)
//
// The function:
//   1) Validates the bearer matches NOTIFY_SHARED_SECRET.
//   2) Inserts an in-app notification row (visible at /notifications).
//   3) Looks up push_subscriptions for the target user.
//   4) Mints an OAuth access token from the service account JWT.
//   5) Sends FCM HTTP v1 to each token.
//   6) Removes subscriptions for tokens FCM rejects (404/UNREGISTERED).

// deno-lint-ignore-file no-explicit-any
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

type Input = {
  user_id: string;
  kind: 'follow' | 'like' | 'comment' | 'contest' | string;
  payload?: Record<string, unknown>;
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const FCM_PROJECT_ID = Deno.env.get('FCM_PROJECT_ID') || '';
const FCM_SERVICE_ACCOUNT = Deno.env.get('FCM_SERVICE_ACCOUNT') || '';
const NOTIFY_SHARED_SECRET = Deno.env.get('NOTIFY_SHARED_SECRET') || '';
const SITE_URL = Deno.env.get('SITE_URL') || 'https://siyoh-web.vercel.app';

const TEXT_BY_KIND: Record<string, { title: string; body: string }> = {
  follow:  { title: 'Yangi kuzatuvchi',     body: 'Sizni kuzatishni boshladi.' },
  like:    { title: 'Hikoyangiz yoqdi',     body: 'Kimdir hikoyangizni yoqtirdi.' },
  comment: { title: 'Yangi sharh',          body: 'Hikoyangizga sharh qoldirdi.' },
  contest: { title: 'Tanlov yangiligi',     body: 'Yangi tanlov mavjud.' },
};

// ---------------------------------------------------------------- OAuth token

async function importPrivateKey(pem: string): Promise<CryptoKey> {
  const cleaned = pem
    .replace(/-----BEGIN PRIVATE KEY-----/g, '')
    .replace(/-----END PRIVATE KEY-----/g, '')
    .replace(/\\n/g, '')
    .replace(/\s+/g, '');
  const der = Uint8Array.from(atob(cleaned), c => c.charCodeAt(0));
  return crypto.subtle.importKey(
    'pkcs8',
    der.buffer,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign'],
  );
}

function base64url(input: Uint8Array | string): string {
  const bytes = typeof input === 'string' ? new TextEncoder().encode(input) : input;
  let s = '';
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 30_000) return cachedToken.token;

  const sa = JSON.parse(FCM_SERVICE_ACCOUNT);
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claim = base64url(JSON.stringify({
    iss: sa.client_email,
    scope: 'https://www.googleapis.com/auth/firebase.messaging',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  }));
  const toSign = `${header}.${claim}`;
  const key = await importPrivateKey(sa.private_key);
  const sig = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, new TextEncoder().encode(toSign));
  const jwt = `${toSign}.${base64url(new Uint8Array(sig))}`;

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });
  if (!res.ok) throw new Error(`oauth: ${res.status} ${await res.text()}`);
  const data = await res.json();
  cachedToken = { token: data.access_token, expiresAt: Date.now() + (data.expires_in - 60) * 1000 };
  return cachedToken.token;
}

// ---------------------------------------------------------------- HTTP handler

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  // Shared secret gate — only our DB triggers should call this.
  const auth = req.headers.get('authorization') || '';
  if (!NOTIFY_SHARED_SECRET || auth !== `Bearer ${NOTIFY_SHARED_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  let input: Input;
  try { input = await req.json(); }
  catch { return new Response('Bad JSON', { status: 400 }); }
  if (!input.user_id || !input.kind) {
    return new Response('Missing user_id or kind', { status: 400 });
  }

  const sb = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } });

  // 1) In-app notification (idempotent in DB if you add a uniqueness constraint).
  const { error: insErr } = await sb.from('notifications').insert({
    user_id: input.user_id,
    kind: input.kind,
    payload: input.payload || {},
  });
  if (insErr) console.warn('notifications insert', insErr.message);

  // 2) Push fan-out — only if FCM is configured. Otherwise we're "in-app only".
  if (!FCM_PROJECT_ID || !FCM_SERVICE_ACCOUNT) {
    return Response.json({ ok: true, pushed: 0, mode: 'in-app-only' });
  }

  const { data: subs } = await sb.from('push_subscriptions')
    .select('fcm_token, platform')
    .eq('user_id', input.user_id);

  if (!subs || subs.length === 0) {
    return Response.json({ ok: true, pushed: 0, mode: 'no-subscriptions' });
  }

  const text = TEXT_BY_KIND[input.kind] ?? { title: 'Siyoh', body: '' };
  const slug = (input.payload as any)?.story_slug;
  const url = slug ? `${SITE_URL}/story/${slug}` : `${SITE_URL}/notifications`;

  let accessToken: string;
  try { accessToken = await getAccessToken(); }
  catch (e: any) {
    return Response.json({ ok: false, error: e.message }, { status: 500 });
  }

  const endpoint = `https://fcm.googleapis.com/v1/projects/${FCM_PROJECT_ID}/messages:send`;

  let pushed = 0;
  const toDelete: string[] = [];
  for (const s of subs) {
    const msg = {
      message: {
        token: s.fcm_token,
        notification: { title: text.title, body: text.body },
        webpush: { fcm_options: { link: url } },
        data: {
          kind: input.kind,
          url,
          ...Object.fromEntries(
            Object.entries(input.payload || {}).map(([k, v]) => [k, String(v ?? '')]),
          ),
        },
      },
    };
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify(msg),
    });
    if (res.ok) { pushed++; continue; }
    if (res.status === 404 || res.status === 400) {
      // 404 = token unregistered; 400 often = invalid argument (stale token).
      toDelete.push(s.fcm_token);
    } else {
      console.warn('fcm send', res.status, await res.text());
    }
  }

  if (toDelete.length > 0) {
    await sb.from('push_subscriptions').delete()
      .eq('user_id', input.user_id)
      .in('fcm_token', toDelete);
  }

  return Response.json({ ok: true, pushed, pruned: toDelete.length });
});
