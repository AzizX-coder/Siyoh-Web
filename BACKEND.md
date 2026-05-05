# Siyoh — Backend Guide

`SETUP.md` ishga tushirish bo‘yicha qisqacha. **Bu fayl** — backend’ning to‘liq
ichidan tushuntirilishi: arxitektura, baza, JWT, RLS, storage, realtime,
webhooks, edge funksiyalar, monitoring va xavfsizlik.

> Texnik tildagi qismlari ingliz tilida — chunki SQL/JWT/HTTP standartlari
> shunday. Tushuntirishlari o‘zbekcha.

---

## Tarkib

1. [Arxitektura](#1-arxitektura)
2. [Lokal dev environment (Supabase CLI)](#2-lokal-dev-environment-supabase-cli)
3. [Database — schema, indekslar, triggerlar](#3-database--schema-indekslar-triggerlar)
4. [Row-Level Security (RLS)](#4-row-level-security-rls)
5. [Auth — JWT, session, refresh, custom claims](#5-auth--jwt-session-refresh-custom-claims)
6. [Role-Based Access Control (RBAC)](#6-role-based-access-control-rbac)
7. [Storage — buckets, signed URL, fayl yuklash](#7-storage--buckets-signed-url-fayl-yuklash)
8. [Realtime — kanallar va obunalar](#8-realtime--kanallar-va-obunalar)
9. [Email — Resend SMTP, transactional shablonlar](#9-email--resend-smtp-transactional-shablonlar)
10. [Server actions va API qatlam](#10-server-actions-va-api-qatlam)
11. [Edge functions (zarur bo‘lganda)](#11-edge-functions-zarur-bolganda)
12. [Webhooks va database triggerlar](#12-webhooks-va-database-triggerlar)
13. [Backup, restore, migratsiya](#13-backup-restore-migratsiya)
14. [Monitoring va loglar](#14-monitoring-va-loglar)
15. [Xavfsizlik checklist](#15-xavfsizlik-checklist)

---

## 1. Arxitektura

```
┌──────────────────────────────────────────────────────────────┐
│  Vercel (Edge Network)                                        │
│  ├─ Next.js App Router                                        │
│  │   ├─ React Server Components (server-rendered)             │
│  │   ├─ Client Components (interactivity)                     │
│  │   ├─ Server Actions (mutations, no API needed)             │
│  │   └─ middleware.ts (auth gate, /admin role check)          │
│  └─ Static assets (favicon, OG, sitemap)                      │
└──────────────┬───────────────────────────────────────────────┘
               │ HTTPS (PostgREST + GoTrue + Storage + Realtime)
               ▼
┌──────────────────────────────────────────────────────────────┐
│  Supabase (managed Postgres + services)                       │
│  ├─ PostgreSQL 15 (your database, RLS-protected)              │
│  ├─ GoTrue (auth: email, OAuth, magic link, JWT)              │
│  ├─ PostgREST (auto REST API on schema)                       │
│  ├─ Realtime (Postgres logical replication → WebSocket)       │
│  ├─ Storage (S3-compatible, RLS-protected files)              │
│  └─ Edge Functions (Deno, optional)                           │
└──────────────┬───────────────────────────────────────────────┘
               │ SMTP (587/465)
               ▼
┌──────────────────────────────────────────────────────────────┐
│  Resend (email delivery)                                      │
│  └─ Transactional email — confirm signup, magic link, recovery│
└──────────────────────────────────────────────────────────────┘
```

**Asosiy xulosa:** Siyoh’da “backend serveri” yo‘q — siz to‘g‘ridan-to‘g‘ri
Supabase’dan o‘qiysiz/yozasiz. Auth to‘g‘ri sozlanganida, **RLS** har bir so‘rov
xavfsizligini bazani ichida ta‘minlaydi.

---

## 2. Lokal dev environment (Supabase CLI)

Lokalda baza, auth, storage’ni Docker’da ishga tushirish — production’ga o‘xshash
muhit + bepul.

### O‘rnatish

```bash
# Windows
scoop install supabase
# yoki
npm i -g supabase

# macOS / Linux
brew install supabase/tap/supabase
```

### Loyiha ichida ishga tushirish

```bash
cd siyoh-web
supabase init                      # supabase/ papkasini yaratadi (allaqachon bor)
supabase start                     # Docker konteynerlar ishga tushadi
```

CLI sizga lokal `API URL`, `anon key`, `service_role key` beradi. Ularni
`.env.local` ga yozing — production keylarini ezmaydi.

### Migratsiyalar

```bash
# yangi migratsiya yaratish
supabase migration new add_user_settings

# editorda yozing, keyin
supabase db reset                  # lokalni qayta yaratadi (drop + apply)
supabase db push                   # production’ga yuboradi
```

> Avval `supabase login` + `supabase link --project-ref <ref>` kerak.

---

## 3. Database — schema, indekslar, triggerlar

`supabase/schema.sql` — to‘liq sxema. Asosiy jadvallar:

| Jadval | Maqsad | Muhim ustunlar |
|---|---|---|
| `profiles` | `auth.users` ga 1:1 ulangan public profil | `id` (UUID, FK to auth.users), `username` (unique), `role` (enum) |
| `stories` | Hikoyalar (matn / audio / both) | `slug` (unique), `status`, `author_id`, `tags[]`, `published_at` |
| `comments` | Hikoyaga sharhlar | `story_id`, `author_id`, `body` |
| `likes` | Yoqtirishlar (kompozit PK) | `(story_id, user_id)` |
| `bookmarks` | Saqlanganlar | `(story_id, user_id)` |
| `follows` | Kuzatuvlar | `(follower_id, following_id)`, check `<>` |
| `contests` | Tanlovlar | `status`, `starts_at`, `ends_at`, `prize` |
| `contest_entries` | Tanlov ishtirokchilari | `(contest_id, story_id)` unique |
| `notifications` | Foydalanuvchi bildirishnomalari | `user_id`, `kind`, `payload` (JSONB), `read_at` |
| `reports` | Moderatsiya navbati | `target_kind`, `target_id`, `reason`, `status` |

### Indekslar

```sql
profiles_username_idx          -- unique constraint = avtomatik index
stories_author_idx             -- profil sahifasidagi list uchun
stories_status_idx             -- published filter
stories_published_idx          -- order by published_at DESC
stories_tags_idx (GIN)         -- tags @> ARRAY['Esse'] kabi so‘rovlar uchun
comments_story_idx             -- detail sahifa
notifications_user_idx         -- user_id, created_at DESC
```

### Triggerlar

| Trigger | Vazifa |
|---|---|
| `on_auth_user_created` (auth.users) | Yangi signup → `profiles` qatori avtomatik (display_name, username metadata’dan) |
| `likes_bump` | Like qo‘shilsa/o‘chsa → `stories.likes` counteri yangilanadi (denormalizatsiya) |
| `*_touch` | Har qanday update’da `updated_at = now()` |

`public.is_admin()` — har bir RLS siyosatida ishlatish uchun helper funksiya
(STABLE, security definer):

```sql
create or replace function public.is_admin()
returns boolean language sql stable as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'admin');
$$;
```

---

## 4. Row-Level Security (RLS)

**Asosiy printsip:** har bir public jadvalda RLS yoqilgan. Hech bir foydalanuvchi
boshqasining ma‘lumotini ko‘rmasin/o‘zgartirmasin, **agar siyosat ruxsat bermasa**.

### `stories` jadvali misolida

```sql
-- 1) Hammaga publish qilingan hikoyalarni ko‘rish, mualifga + adminga hammasini
create policy "stories public read published" on public.stories for select
  using (status = 'published' or author_id = auth.uid() or public.is_admin());

-- 2) Faqat o‘zining hikoyasini insert qilish (author_id ni boshqa user qila olmaydi)
create policy "stories author insert" on public.stories for insert
  with check (author_id = auth.uid());

-- 3) Faqat muallif yoki admin update/delete qila oladi
create policy "stories author update" on public.stories for update
  using (author_id = auth.uid() or public.is_admin())
  with check (author_id = auth.uid() or public.is_admin());
```

### Test qilish

```sql
-- Lokal psql session’da yoki Supabase SQL Editor’da
set role authenticated;
set request.jwt.claim.sub to '00000000-0000-0000-0000-000000000001'; -- user UUID

select * from stories;  -- bu user nimani ko‘rishi kerak bo‘lsa, o‘shanigina chiqaradi
```

### `auth.uid()` qachon `null` bo‘ladi?

- Anonymous so‘rov (anon key bilan, sessionsiz) — `null`.
- Server-side, `service_role` bilan — RLS umuman bypass bo‘ladi.

---

## 5. Auth — JWT, session, refresh, custom claims

### JWT tuzilishi

Supabase har bir foydalanuvchiga **2 ta token** beradi:

| Token | Yashash muddati | Maqsad |
|---|---|---|
| **Access token** (JWT) | 1 soat (sozlanadi) | Har bir API so‘rovga `Authorization: Bearer ...` |
| **Refresh token** | 30 kun (sozlanadi) | Access token tugaganida yangisini olish |

JWT payload misoli:

```json
{
  "aud": "authenticated",
  "exp": 1777400000,
  "sub": "00000000-0000-0000-0000-000000000001",
  "email": "elena@siyoh.app",
  "role": "authenticated",
  "session_id": "...",
  "user_metadata": {
    "display_name": "Elena Marquez",
    "username": "elena.writes"
  },
  "app_metadata": {
    "provider": "email",
    "providers": ["email", "google"]
  }
}
```

- **`sub`** = foydalanuvchi UUID. RLS siyosatlarida `auth.uid()` aynan shu.
- **`role`** = `authenticated` (login qilgan) yoki `anon`. RLS uchun PostgREST roli.
- **`user_metadata`** = signup’da yuborilgan ma’lumot. Foydalanuvchi o‘zi
  o‘zgartira oladi.
- **`app_metadata`** = faqat server (service_role) yozadi. Trust qilinadigan
  ma‘lumot uchun (masalan, plan, role).

### Session’ni qaerda saqlash

`@supabase/ssr` — Next.js uchun rasmiy library:
- **Cookies’da** (HTTP-only, secure, samesite=lax) — XSS’dan himoya
- Browser’da `localStorage` ishlatilmaydi (XSS xavfli)
- Har bir RSC/server action `cookies()` orqali sessionni o‘qiydi

`src/lib/supabase/{client,server}.ts` aynan shuni ta‘minlaydi.
`middleware.ts` har bir so‘rovda cookielarni yangilaydi (refresh).

### Access token muddatini sozlash

Supabase Dashboard → **Settings → Auth**:
- **JWT expiry**: 3600 (1 soat) — default.
- **Refresh token reuse interval**: 10s.
- **Refresh token rotation**: ON (tavsiya).

### Custom claims (rolni JWT’ga qo‘shish)

RLS’da `is_admin()` har safar DB’ga so‘rov yuboradi. Trafik kattalashganda
`role`ni JWT ichiga qo‘yish samaraliroq. Buning uchun `auth.users` ga trigger:

```sql
-- profiles.role o‘zgarsa, auth.users.raw_app_meta_data ga sinxronlash
create or replace function public.sync_role_to_jwt()
returns trigger language plpgsql security definer as $$
begin
  update auth.users
  set raw_app_meta_data =
    coalesce(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('role', new.role)
  where id = new.id;
  return new;
end $$;

drop trigger if exists profiles_role_sync on public.profiles;
create trigger profiles_role_sync
  after insert or update of role on public.profiles
  for each row execute function public.sync_role_to_jwt();
```

Endi RLS’da:
```sql
create or replace function public.is_admin()
returns boolean language sql stable as $$
  select coalesce(auth.jwt() ->> 'app_metadata' ->> 'role', '') = 'admin';
$$;
```

> Foydalanuvchi yangi rolni olishi uchun **logout/login** yoki refresh kerak.

### Server-only API key (service role)

`SUPABASE_SERVICE_ROLE_KEY` — RLS’ni butunlay bypass qiladi. **Hech qachon
clientga chiqmasin.** Faqat:
- Edge function’da
- Next.js server action’da (clientga qaytmasdan)
- CLI/cron skriptida

---

## 6. Role-Based Access Control (RBAC)

`profiles.role` enum: `'reader' | 'writer' | 'admin'`.

| Rol | Nima qila oladi |
|---|---|
| `reader` | O‘qish, like, bookmark, kuzatish, sharh yozish |
| `writer` | Yuqoridagilar + hikoya nashr qilish, qoralama saqlash |
| `admin` | Hammasi + `/admin/*` paneli, har qanday hikoyani edit/delete |

**`writer` ↔ `reader` farq:** schema’da hozir bir xil ruxsat (har kim yozishi
mumkin). Agar “verified writer” oqimi qo‘shmoqchi bo‘lsangiz, RLS’ga shart
qo‘shing:

```sql
-- Faqat writer/admin nashr qila oladi
drop policy if exists "stories author insert" on public.stories;
create policy "stories author insert" on public.stories for insert
  with check (
    author_id = auth.uid()
    and exists (
      select 1 from profiles
      where id = auth.uid() and role in ('writer', 'admin')
    )
  );
```

Adminni qo‘yish:
```sql
update profiles set role = 'admin' where username = 'sizning_username';
```

---

## 7. Storage — buckets, signed URL, fayl yuklash

`schema.sql` ikki bucket yaratadi:
- **`covers`** (public read) — hikoya muqovalari
- **`audio`** (public read) — audio yozuvlar

Yo‘l konventsiyasi: `<user_id>/<filename>`.

### RLS storage’da

```sql
-- Ochiq read
create policy "covers public read" on storage.objects for select
  using (bucket_id in ('covers', 'audio'));

-- Faqat o‘zining papkasiga yozish
create policy "covers user upload" on storage.objects for insert
  with check (
    bucket_id in ('covers', 'audio')
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
```

### Clientdan yuklash (`/create` sahifasida)

```ts
import { createClient } from '@/lib/supabase/client';

async function uploadCover(file: File, userId: string) {
  const sb = createClient()!;
  const path = `${userId}/${Date.now()}-${file.name}`;
  const { data, error } = await sb.storage
    .from('covers')
    .upload(path, file, { contentType: file.type, cacheControl: '3600' });
  if (error) throw error;
  return sb.storage.from('covers').getPublicUrl(path).data.publicUrl;
}
```

### Audio uchun (xususiy variant — signed URL)

Agar audioga faqat sotib olganlar kira olsin desangiz, bucket’ni **private**
qilib qo‘ying va talab paytida signed URL bering:

```ts
const { data } = await sb.storage
  .from('audio')
  .createSignedUrl(path, 3600); // 1 soat amal qiladi
```

---

## 8. Realtime — kanallar va obunalar

Supabase logical replication orqali Postgres o‘zgarishlarini WebSocket bilan
clientga yetkazadi.

### Bildirishnomalar real-time

```ts
'use client';
import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

useEffect(() => {
  const sb = createClient();
  if (!sb) return;
  const ch = sb
    .channel('notif')
    .on('postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` },
      (payload) => {
        // toast yoki badge yangilash
        console.log('new notification:', payload.new);
      })
    .subscribe();
  return () => { sb.removeChannel(ch); };
}, [userId]);
```

### Yangi sharhlar live ko‘rinishi (story sahifa)

```ts
sb.channel(`story-${storyId}`)
  .on('postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'comments', filter: `story_id=eq.${storyId}` },
    (payload) => setComments(c => [payload.new, ...c]))
  .subscribe();
```

### Cheklov

- Realtime publication’ga jadval qo‘shilishi kerak. Schema’da `notifications`
  va `comments` defaultda **qo‘shilmagan** — agar realtime kerak bo‘lsa:
  ```sql
  alter publication supabase_realtime add table notifications;
  alter publication supabase_realtime add table comments;
  ```
- Free planda 200 ta concurrent connection.

---

## 9. Email — Resend SMTP, transactional shablonlar

### Sozlash

`SETUP.md → Auth` bo‘limida to‘liq. Qisqacha:

1. **Resend → Domains → Add `siyoh.app`** → DNS yozuvlarini qo‘shing → tasdiqlang.
2. **Resend → API Keys → Create** → key olib oling.
3. **Supabase → Integrations → Resend** (yoki **Settings → Auth → SMTP**):
   ```
   Host:        smtp.resend.com
   Port:        465
   User:        resend
   Password:    <Resend API key>
   Sender:      Siyoh <team@siyoh.app>
   ```
4. **Authentication → Email Templates** — `supabase/email-templates/*.html`
   shablonlarini joylashtiring.

### Limit

- Supabase ichidagi SMTP: **30 email / soat / loyiha** (juda past — faqat dev).
- Resend free: 100/kun, 3000/oy. Domen tasdiqlangan bo‘lsa.
- Production’da **albatta** o‘zingizning SMTP (Resend, Postmark, SendGrid).

### Webhook (yetkazib berilganligini kuzatish)

Resend → **Webhooks** → endpoint URL:
```
https://siyoh.app/api/webhooks/resend
```
Event’lar: `email.delivered`, `email.bounced`, `email.complained`. Bu URL’ni
`src/app/api/webhooks/resend/route.ts` ga qo‘shib, `notifications` jadvalga
yozishingiz mumkin.

---

## 10. Server actions va API qatlam

Siyoh **API endpoint** yozmaydi. Ma‘lumotni o‘zgartirish — Server Actions orqali
(`src/lib/actions.ts`):

```ts
'use server';
export async function toggleLike(storyId: string, currentlyLiked: boolean) {
  const { sb, userId } = await requireUser();
  if (currentlyLiked) {
    await sb.from('likes').delete().eq('story_id', storyId).eq('user_id', userId);
  } else {
    await sb.from('likes').insert({ story_id: storyId, user_id: userId });
  }
  revalidatePath('/feed');
  return { ok: true, liked: !currentlyLiked };
}
```

Client tomondan:

```tsx
const [pending, start] = useTransition();
function onClick() {
  start(async () => {
    const r = await toggleLike(id, liked);
    if (!r.ok) push({ kind: 'error', title: r.error });
  });
}
```

Afzalliklari:
- API route yozish kerak emas
- Authentication cookie orqali avtomatik
- Type-safe (function signature client+server bir)
- Optimistic UI bilan birga ishlaydi

### Qachon API route kerak

- Tashqi tizimdan webhook (Resend, Stripe, Telegram bot)
- OG image, sitemap, robots — Next.js metadata API
- Cron job ichidan chaqiriladigan endpoint

`src/app/api/<name>/route.ts` faylida `GET`/`POST` export qiling.

---

## 11. Edge functions (zarur bo‘lganda)

Aksariyat ish Server Action’da hal bo‘lsa kerak emas. **Kerak bo‘lgan vaqt:**
- Stripe checkout (server-side secret bilan)
- AI moderatsiya (OpenAI key)
- 3rd-party API’lar uchun proxy
- Cron-based ishlar (har soatda email digest)

```bash
supabase functions new digest-weekly
# supabase/functions/digest-weekly/index.ts
supabase functions deploy digest-weekly
```

Cron triggers `pg_cron` orqali:
```sql
select cron.schedule(
  'weekly-digest',
  '0 9 * * 0',   -- yakshanba 09:00
  $$ select net.http_post(
       url:='https://<project>.functions.supabase.co/digest-weekly',
       headers:='{"Authorization":"Bearer <SERVICE_ROLE>"}'::jsonb
     );
  $$
);
```

---

## 12. Webhooks va database triggerlar

### Database webhook’lar

Dashboard → **Database → Webhooks** → yangi qoida:
- **Table:** `stories`
- **Events:** INSERT
- **HTTP method:** POST
- **URL:** `https://siyoh.app/api/webhooks/new-story`
- **Headers:** `Authorization: Bearer <internal-secret>`

Hikoya nashr qilinganida sizga POST keladi → Telegram kanaliga, Twitter’ga
yuborishingiz mumkin.

### Trigger function (DB ichida)

```sql
-- Yangi follower kelganda push notification
create or replace function public.notify_followed_user()
returns trigger language plpgsql as $$
begin
  insert into notifications (user_id, kind, payload)
  values (new.following_id, 'follow', jsonb_build_object('from', new.follower_id));
  return new;
end $$;

drop trigger if exists follows_notify on public.follows;
create trigger follows_notify after insert on public.follows
  for each row execute function public.notify_followed_user();
```

Sxema’da `actions.ts` notification’ni JS tomondan yozadi — siz bu vazifani
DB triggerga ko‘chirishingiz mumkin (transaktsion kafolat uchun).

---

## 13. Backup, restore, migratsiya

### Avtomatik backup

Supabase → **Database → Backups**:
- **Free:** kuniga, 7 kun ushlanadi
- **Pro:** kuniga, 14 kun
- **Pro + PITR:** point-in-time recovery, 7 kun

### Qo‘lda dump

```bash
supabase db dump -f backup.sql                    # full schema + data
supabase db dump --data-only -f data.sql          # faqat data
supabase db dump --schema-only -f schema.sql      # faqat schema
```

### Migratsiyalarni production’ga yuborish

```bash
supabase link --project-ref xxxxxxxx
supabase db push                                  # supabase/migrations/* ni qo‘llaydi
```

`schema.sql` ni o‘zgartirish o‘rniga **migratsiya** yozing — versiyalanadi va
qaytarib oluvchi (rollback) bo‘ladi.

---

## 14. Monitoring va loglar

### Supabase

- **Logs → Postgres** — slow query, error
- **Logs → Auth** — login attempt, signup, password reset
- **Logs → API** — PostgREST so‘rov logi
- **Reports → Database** — connection count, table size, index hit rate

### Vercel

- **Analytics** — sahifa view, web vitals
- **Logs** — Server Action xatolari, middleware
- **Speed Insights** — INP, LCP, CLS

### Sentry (tavsiya)

```bash
npm i @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

---

## 15. Xavfsizlik checklist

Production’ga oldin:

- [ ] **Hech qanday `.env.local` git’ga commit qilinmagan**
  ```bash
  git ls-files | grep -E "\.env\.local$"   # bo‘sh chiqsin
  ```
- [ ] **`SUPABASE_SERVICE_ROLE_KEY` faqat server kodida**
  ```bash
  grep -r "SERVICE_ROLE" src/ | grep -v "from.*supabase/server"   # bo‘sh chiqsin
  ```
- [ ] **Har bir public jadvalda `alter table ... enable row level security`**
- [ ] **`policy` har bir SELECT/INSERT/UPDATE/DELETE uchun yozilgan**
- [ ] **Resend API key faqat Supabase SMTP’da** (kodda yo‘q)
- [ ] **Email domen Resend’da tasdiqlangan** (DKIM/SPF passing)
- [ ] **Site URL + Redirect URLs faqat ishonchli domen** (lokal’dan tashqari)
- [ ] **Auth → Rate limit** to‘g‘ri sozlangan (signup spam himoya)
- [ ] **OAuth client secret** faqat Supabase ichida — kod’da yo‘q
- [ ] **Vercel env’lar production-only** (preview deploy’larga test loyihasi)
- [ ] **`X-Frame-Options`, `X-Content-Type-Options`** — `vercel.json` da bor
- [ ] **PostgreSQL `search_path`** — security definer funksiyalarda
  `set search_path = public` (CVE-2018-1058 himoya)
- [ ] **Backup test** — bir marta restore qilib ko‘ring

### Penetration sanity check

Anonymous so‘rov qilib ko‘ring (anon key bilan):

```bash
curl -H "apikey: $ANON_KEY" \
  "$URL/rest/v1/profiles?role=eq.admin&select=*"
# Bu so‘rov hech narsa qaytarmasligi kerak — RLS adminlarni yashirsin.
```

```bash
curl -X POST -H "apikey: $ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"author_id":"some-other-uuid","title":"hack"}' \
  "$URL/rest/v1/stories"
# Bu so‘rov 401 yoki 403 bo‘lishi kerak.
```

---

## Yordam

GitHub: [github.com/AzizX-coder/Siyoh-Web](https://github.com/AzizX-coder/Siyoh-Web)

> Sekinlashishga arziydigan hikoyalar.
