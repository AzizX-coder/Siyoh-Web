# Siyoh — O‘rnatish va ishga tushirish

To‘liq ishlab chiqarishga tayyor sozlash bo‘yicha qadamlar. Hammasi 15-20 daqiqa.

## Tarkib

1. [Talablar](#talablar)
2. [Lokal ishga tushirish](#lokal-ishga-tushirish)
3. [Supabase bilan ulash](#supabase-bilan-ulash)
4. [Auth — `siyoh` provider va email shablonlari](#auth--siyoh-provider-va-email-shablonlari)
5. [Vercel’ga deploy qilish](#vercelga-deploy-qilish)
6. [Admin ruxsati](#admin-ruxsati)
7. [Doimiy texnik xizmat](#doimiy-texnik-xizmat)

---

## Talablar

- **Node.js 18.17+** (`node --version`)
- **npm** yoki **pnpm** yoki **bun**
- **Supabase** akkaunti — [supabase.com](https://supabase.com) (bepul)
- **Vercel** akkaunti — [vercel.com](https://vercel.com) (bepul, GitHub orqali kirish)
- **GitHub** repo (Vercel git push deploy uchun)

---

## Lokal ishga tushirish

```bash
git clone https://github.com/AzizX-coder/Siyoh.git
cd Siyoh/siyoh-web      # yoki sizning papka tuzilmangiz
npm install
cp .env.local.example .env.local
npm run dev
```

`http://localhost:3000` ochiladi. **`.env.local`** sozlanmasa, ilova **demo rejimda** ishlaydi
— hech qanday ma‘lumot yo‘q, lekin barcha sahifalar (lenta, kashf etish,
profil, sozlamalar, auth) ishlaydi.

---

## Supabase bilan ulash

### 1) Loyiha yarating

1. [supabase.com/dashboard](https://supabase.com/dashboard) → **New project**
2. Region: foydalanuvchilaringizga yaqin (masalan `eu-central-1`)
3. **Database password** ni saqlab oling (faqat o‘zingizga)

### 2) Sxemani o‘rnating

1. **SQL Editor** (chap menyu) → **New query**
2. `supabase/schema.sql` faylini to‘liq nusxalang va **Run** bosing

Bu yarataladi:
- `profiles`, `stories`, `comments`, `likes`, `bookmarks`, `follows`, `contests`, `notifications`, `reports` jadvallari
- ENUM turlari (story_type, story_status, user_role, contest_status)
- Indekslar va GIN tegi indeksi
- **RLS** (Row-Level Security) — har bir jadval uchun siyosatlar
- Triggerlar:
  - `auth.users` ga signup &rarr; `profiles` avtomatik yaratiladi
  - Like qo‘shilsa/o‘chirilsa — `stories.likes` counteri yangilanadi
  - `updated_at` avtomatik yangilanadi
- Storage buckets: `covers` va `audio` (public read, foydalanuvchi nomli papkalar)

> Seed fayli yo‘q — platforma toza holatda ishga tushadi va birinchi yozuvchi
> sizdan boshlanadi.

### 3) Environment variables

Loyiha sozlamalaridan oling:
- **Project Settings** → **API**
  - `Project URL` &rarr; `NEXT_PUBLIC_SUPABASE_URL`
  - `anon public` &rarr; `NEXT_PUBLIC_SUPABASE_ANON_KEY`

`.env.local` ga yozing:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
```

`npm run dev` ni qayta ishga tushiring. Endi ilova haqiqiy Supabase bilan
ishlaydi.

---

## Auth — `siyoh` provider va email shablonlari

Siyoh standart Supabase auth’dan foydalanadi, **lekin email shablonlari va
brending Siyoh’ga moslashtirilgan**. Foydalanuvchi nuqtai nazaridan bu
yagona “Siyoh” provideri.

### Yo‘nalishlarni sozlash

1. **Authentication** → **URL Configuration**
2. **Site URL**: ishlab chiqarish domeningiz (masalan `https://siyoh.app`)
3. **Redirect URLs** (har bir URL alohida qatorga):
   ```
   http://localhost:3000/auth/callback
   https://siyoh.app/auth/callback
   https://*.vercel.app/auth/callback
   ```

### Email shablonlarini o‘rnatish

**Authentication** → **Email Templates**

Har biri uchun matnni `supabase/email-templates/` papkasidagi tegishli
fayldan ko‘chirib o‘tkazing:

| Supabase shablon | Fayl |
|---|---|
| **Confirm signup** | `confirm-signup.html` |
| **Magic Link** | `magic-link.html` |
| **Change Email Address** | `change-email.html` |
| **Reset Password** | `recovery.html` |
| **Invite user** | `invite.html` |

Mavzu (Subject) qatorlari (tavsiya):
- Confirm signup: `Siyohga xush kelibsiz — emailingizni tasdiqlang`
- Magic Link: `Siyoh — bir bosishda kiring`
- Change Email: `Siyoh — yangi email manzilini tasdiqlang`
- Reset Password: `Siyoh — parolni tiklash`
- Invite user: `Sizni Siyohga taklif qilishdi`

### Jo‘natuvchi nomi (sender)

**Project Settings** → **Auth** → **SMTP Settings** (yoki **Email**) →
- **Sender name**: `Siyoh`
- **Sender email**: `noreply@siyoh.app` (yoki vaqtinchalik `noreply@yourdomain.com`)

> **Production:** Supabase ning standart pochta serveri kuniga 30 ta xabar bilan
> cheklangan. Ko‘proq trafik uchun **Custom SMTP** ni yoqing — Resend, Postmark
> yoki Sendgrid tavsiya qilinadi.

### OAuth providerlar (ixtiyoriy)

**Authentication** → **Providers**:
- **Google**: client ID + secret yarating ([Google Cloud Console](https://console.cloud.google.com/))
- **GitHub**: [GitHub Developer Settings](https://github.com/settings/developers) da OAuth App yarating

Ikkalasi uchun ham **Authorized redirect URI**:
```
https://<project>.supabase.co/auth/v1/callback
```

---

## Vercel’ga deploy qilish

### 1-yo‘l: GitHub orqali (tavsiya)

1. Repoyangizni GitHub’ga push qiling.
2. [vercel.com/new](https://vercel.com/new) → Import.
3. **Root Directory**: agar repo ichida `siyoh-web/` bo‘lsa, uni tanlang.
4. **Framework**: avtomatik aniqlanadi (Next.js).
5. **Environment Variables** (Build & Production):
   ```
   NEXT_PUBLIC_SUPABASE_URL = https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJ...
   ```
6. **Deploy** ni bosing.

### 2-yo‘l: Vercel CLI

```bash
npm i -g vercel
cd siyoh-web
vercel               # birinchi marta — link qiladi
vercel --prod        # production build
```

CLI sizdan env variables so‘raydi yoki `.env.local` faylini ko‘chiradi.

### Domen

1. Vercel loyiha → **Settings** → **Domains** → kerakli domeningizni qo‘shing.
2. Supabase **Site URL** va **Redirect URLs**ga ham yangi domenni qo‘shing.

---

## Admin ruxsati

Admin paneliga (`/admin/*`) faqat `profiles.role = 'admin'` bo‘lgan
foydalanuvchi kira oladi (middleware shu tekshiruvni bajaradi).

Birinchi adminni qo‘yish:

```sql
-- Supabase SQL Editor
update public.profiles
set role = 'admin'
where username = 'sizning_username';
```

---

## Doimiy texnik xizmat

### Loglarni ko‘rish

- **Vercel** &rarr; loyiha &rarr; **Logs**
- **Supabase** &rarr; **Logs** (auth, database, edge)

### Yangilanish

```bash
git pull
npm install
npm run build         # local sinov
git push              # Vercel avtomatik deploy qiladi
```

### Backup

Supabase `Project Settings` &rarr; `Database` &rarr; `Backups` bo‘limidan
har kuni avtomatik snapshot olinadi (Free planda 7 kun).

### Storage tozalash

Foydalanuvchi o‘chirilsa (`profiles` ga CASCADE), unga tegishli `covers/{user_id}/*`
va `audio/{user_id}/*` fayllari avtomatik o‘chmaydi. Periodically:

```sql
-- Misol: 30 kundan ortiq orphan fayllarni topish
-- (manual yoki cron orqali ishga tushiring)
```

---

## Yordam

Savollar bo‘lsa: [GitHub Issues](https://github.com/AzizX-coder/Siyoh/issues)

> **Sekinlashishga arziydigan hikoyalar.**
