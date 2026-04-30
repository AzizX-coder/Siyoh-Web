# Siyoh — O‘rnatish va ishga tushirish

To‘liq ishlab chiqarishga tayyor sozlash bo‘yicha qadamlar.

## Tarkib

1. [Talablar](#talablar)
2. [Lokal ishga tushirish](#lokal-ishga-tushirish)
3. [Supabase bilan ulash](#supabase-bilan-ulash)
4. [Auth — Siyoh provider, Resend SMTP, email shablonlar](#auth--siyoh-provider-resend-smtp-email-shablonlar)
5. [Vercel’ga deploy qilish](#vercelga-deploy-qilish)
6. [SEO — sitemap, robots, meta, ijtimoiy ulashish](#seo--sitemap-robots-meta-ijtimoiy-ulashish)
7. [Qidiruv tizimlarida ro‘yxatga olish](#qidiruv-tizimlarida-royxatga-olish)
8. [Admin ruxsati](#admin-ruxsati)
9. [Xavfsizlik](#xavfsizlik)
10. [Doimiy texnik xizmat](#doimiy-texnik-xizmat)

---

## Talablar

- **Node.js 18.17+** (`node --version`)
- **npm**
- **Supabase** akkaunti — [supabase.com](https://supabase.com) (bepul)
- **Vercel** akkaunti — [vercel.com](https://vercel.com)
- **Resend** akkaunti — [resend.com](https://resend.com) (email yuborish uchun)

---

## Lokal ishga tushirish

```bash
git clone https://github.com/AzizX-coder/Siyoh-Web.git siyoh-web
cd siyoh-web
npm install
cp .env.local.example .env.local    # keyin keylarni qo‘shasiz
npm run dev
```

`http://localhost:3000` ochiladi. **`.env.local`** sozlanmasa, ilova **demo
rejimda** ishlaydi — sahifalar bo‘sh-holatlarni ko‘rsatadi, lekin barcha sahifa
o‘tishlari ishlaydi.

---

## Supabase bilan ulash

### 1) Loyiha yarating

1. [supabase.com/dashboard](https://supabase.com/dashboard) → **New project**
2. Region: foydalanuvchilaringizga yaqin (masalan `eu-central-1`)
3. **Database password** ni xavfsiz joyda saqlab oling

### 2) Sxemani o‘rnating

1. **SQL Editor** → **New query**
2. `supabase/schema.sql` faylini to‘liq nusxalang va **Run** bosing

Bu yarataladi:
- Jadvallar: `profiles`, `stories`, `comments`, `likes`, `bookmarks`, `follows`, `contests`, `notifications`, `reports`
- ENUM turlari, indekslar (jumladan teglar uchun GIN)
- **RLS** siyosatlari har bir jadvalda
- Triggerlar:
  - `auth.users` &rarr; `profiles` avtomatik (yangi signup yangi profil)
  - Like &rarr; `stories.likes` counteri yangilanishi
  - `updated_at` avtomatik
- Storage buckets: `covers` va `audio` (public read, foydalanuvchi nomli papkalar)

> Seed yo‘q — platforma bo‘sh holatda ishga tushadi.

### 3) Environment variables

**Project Settings** → **API** dan oling:
- `Project URL` &rarr; `NEXT_PUBLIC_SUPABASE_URL`
- `anon public` &rarr; `NEXT_PUBLIC_SUPABASE_ANON_KEY`

`.env.local` ga yozing:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
```

> ⚠️ **`SUPABASE_SERVICE_ROLE_KEY` ni hech qachon clientga (browserga) chiqarmang.**
> Faqat server-side kodda kerak bo‘lsa qo‘shing.

`npm run dev` ni qayta ishga tushiring.

---

## Auth — Siyoh provider, Resend SMTP, email shablonlar

### Site URL va redirect URLs

**Authentication** → **URL Configuration**

- **Site URL**: production domeningiz, masalan `https://siyoh-web.vercel.app`
  yoki `https://siyoh.app`
- **Redirect URLs** (har biri alohida qatorda):
  ```
  http://localhost:3000/auth/callback
  https://siyoh-web.vercel.app/auth/callback
  https://*.vercel.app/auth/callback
  ```

### Resend orqali SMTP (Supabase Marketplace integratsiyasi — eng oson yo‘l)

1. **Integrations** → **Resend** &rarr; **Install**
2. Loyihani tanlang &rarr; API key yarating &rarr; SMTP ni sozlang:
   - **Sender name:** `Siyoh`
   - **Sender email:** `team@siyoh.app` (yoki sizning domen)
   - **Host:** `smtp.resend.com`
   - **Port:** `465`
   - **Username:** `resend`
   - **Password:** Resend API key (siz yaratgan)

> Domeningizni Resend’da tasdiqlashni unutmang (`Resend → Domains → Add`).
> Tasdiqlanmagan domendan email yuborilmaydi.

### Email shablonlarini o‘rnatish

**Authentication** → **Email Templates**

Har birining mazmunini `supabase/email-templates/` papkasidan ko‘chiring:

| Supabase shablon | Fayl | Mavzu (Subject) tavsiyasi |
|---|---|---|
| Confirm signup | `confirm-signup.html` | Siyohga xush kelibsiz — emailingizni tasdiqlang |
| Magic Link | `magic-link.html` | Siyoh — bir bosishda kiring |
| Change Email Address | `change-email.html` | Siyoh — yangi email manzilini tasdiqlang |
| Reset Password | `recovery.html` | Siyoh — parolni tiklash |
| Invite user | `invite.html` | Sizni Siyohga taklif qilishdi |

### OAuth providerlar — Google va GitHub

**Authentication** → **Providers**:

#### Google
1. [Google Cloud Console](https://console.cloud.google.com/) → **APIs & Services** → **Credentials**
2. **Create OAuth client ID** → Web application
3. **Authorized redirect URIs**: `https://<project>.supabase.co/auth/v1/callback`
4. Client ID + Client Secret ni Supabase ga joylashtiring &rarr; **Enable**

#### GitHub
1. [GitHub Developer Settings](https://github.com/settings/developers) → **New OAuth App**
2. **Homepage**: sizning domeningiz
3. **Authorization callback URL**: `https://<project>.supabase.co/auth/v1/callback`
4. Client ID + Client Secret ni Supabase ga joylashtiring &rarr; **Enable**

---

## Vercel’ga deploy qilish

### GitHub orqali (tavsiya)

1. [vercel.com/new](https://vercel.com/new) → Import `AzizX-coder/Siyoh-Web`
2. **Root Directory**: agar repo ichida `siyoh-web/` papkasi bo‘lsa, uni tanlang
3. **Environment Variables**:
   ```
   NEXT_PUBLIC_SUPABASE_URL = https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJ...
   NEXT_PUBLIC_SITE_URL = https://siyoh-web.vercel.app
   ```
4. **Deploy**

### CLI

```bash
npm i -g vercel
cd siyoh-web
vercel
vercel --prod
```

### Custom domen

1. Vercel &rarr; **Settings** &rarr; **Domains** &rarr; sizning domenni qo‘shing
2. DNS yozuvlarini Vercel ko‘rsatgan tarzda yangilang
3. Supabase **Site URL** va **Redirect URLs** ga yangi domenni qo‘shing
4. `NEXT_PUBLIC_SITE_URL` env ni yangi domenga yangilang

---

## SEO — sitemap, robots, meta, ijtimoiy ulashish

Loyiha quyidagilarni avtomatik yaratadi:

| URL | Maqsad |
|---|---|
| `/sitemap.xml` | Statik sahifalar + barcha hikoyalar + profillar (1 soatda yangilanadi) |
| `/robots.txt` | Crawler ruxsatlari (xususiy yo‘nalishlar bloklangan) |
| `/manifest.webmanifest` | PWA manifesti (ilovaga o‘rnatish uchun) |
| `/icon.svg`, `/apple-icon` | Favicon va iOS ikonkasi |
| `/opengraph-image` | Ijtimoiy ulashish uchun 1200×630 OG kartochkasi |

Har bir sahifada:
- To‘liq Open Graph + Twitter Card meta teglari
- JSON-LD strukturali ma‘lumotlar (Organization, WebSite, Article)
- Canonical URL
- `lang="uz"`, `theme-color`, `viewport`

**Hikoya sahifalari** alohida `Article`/`AudioObject` JSON-LD ishlab chiqaradi
&mdash; Google’da hikoya kartochkalari (rich results) chiqishi uchun.

### Site URL ni sozlash

`.env.local` (lokal) yoki Vercel env (production):
```
NEXT_PUBLIC_SITE_URL=https://siyoh.app
```

Bu URL sitemap, robots, OG, canonical havolalarda ishlatiladi.

---

## Qidiruv tizimlarida ro‘yxatga olish

### Google Search Console

1. [search.google.com/search-console](https://search.google.com/search-console) ga kiring
2. **Add property** &rarr; **URL prefix** &rarr; `https://siyoh.app`
3. **Verification**: HTML meta tag usulini tanlang
4. Vercel’ga env qo‘shing:
   ```
   NEXT_PUBLIC_GOOGLE_VERIFICATION=<copy-the-token-from-google>
   ```
5. Re-deploy &rarr; Search Console’da **Verify**
6. Sitemap qo‘shing: **Sitemaps** &rarr; `https://siyoh.app/sitemap.xml`

### Bing Webmaster Tools

1. [bing.com/webmasters](https://www.bing.com/webmasters) ga kiring
2. Site URL’ni qo‘shing
3. **Verification** &rarr; **Add a meta tag**
4. Vercel env:
   ```
   NEXT_PUBLIC_BING_VERIFICATION=<copy-the-token-from-bing>
   ```
5. Re-deploy &rarr; Bing’da **Verify**
6. Sitemap qo‘shing: `https://siyoh.app/sitemap.xml`

> **Tip**: Google Search Console’dan import qilish ham mumkin (eng oson yo‘l).

### Yandex (CIS auditoriyasi uchun muhim)

1. [webmaster.yandex.com](https://webmaster.yandex.com)
2. Sayt qo‘shing
3. Meta-tag verification
4. Vercel env:
   ```
   NEXT_PUBLIC_YANDEX_VERIFICATION=<copy-the-token-from-yandex>
   ```
5. Re-deploy &rarr; Yandex Webmaster’da **Verify**
6. Sitemap: `https://siyoh.app/sitemap.xml`

### Indekslashni tezlashtirish

- Google: Search Console &rarr; **URL Inspection** &rarr; **Request Indexing**
- Bing: **URL Submission** &rarr; bir necha URL’ni qo‘lda yuborish
- Backlinks: GitHub README, Reddit (r/uzbekistan), Telegram kanallar va Twitter
  orqali eslab o‘tish — qidiruv bot’lari avval shu havolalardan keladi.

---

## Admin ruxsati

Admin paneliga (`/admin/*`) faqat `profiles.role = 'admin'` bo‘lgan
foydalanuvchi kira oladi (middleware bu tekshiruvni bajaradi).

Birinchi adminni qo‘yish:

```sql
update public.profiles
set role = 'admin'
where username = 'sizning_username';
```

---

## Xavfsizlik

- **Hech qachon `SUPABASE_SERVICE_ROLE_KEY` ni clientga chiqarmang.** U RLS’ni
  chetlab o‘tadi — hisobotda chiqib qolsa, butun bazani ochib qo‘yadi.
- `.env.local.example` &rarr; faqat **bo‘sh placeholder**lar. Real qiymatlar
  faqat `.env.local` (gitignored) yoki Vercel env’da bo‘lishi kerak.
- Kalit chiqib ketsa: Supabase Dashboard &rarr; **Settings** &rarr; **API** &rarr;
  **Rotate keys**. Loyiha env’larini yangilang.
- Resend API key: chiqib ketsa Resend dashboard’dan revoke qiling.

---

## Doimiy texnik xizmat

### Loglar
- **Vercel** &rarr; loyiha &rarr; **Logs**
- **Supabase** &rarr; **Logs** (auth, database, edge)

### Yangilanish
```bash
git pull
npm install
npm run build
git push    # Vercel avtomatik deploy qiladi
```

### Backup
Supabase **Project Settings** &rarr; **Database** &rarr; **Backups** — Free
planda 7 kun ushlanadi.

---

## Yordam

- GitHub: [AzizX-coder/Siyoh-Web](https://github.com/AzizX-coder/Siyoh-Web)
- Issues: [github.com/AzizX-coder/Siyoh-Web/issues](https://github.com/AzizX-coder/Siyoh-Web/issues)

> **Sekinlashishga arziydigan hikoyalar.**
