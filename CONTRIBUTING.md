# Contributing to Siyoh

Hissangiz uchun rahmat! Quyida ish jarayonini tushuntiramiz.

## Tezkor sozlash

```bash
git clone https://github.com/AzizX-coder/Siyoh-Web.git
cd Siyoh-Web
npm install
cp .env.local.example .env.local   # demo rejim uchun bo'sh qoldirish ham mumkin
npm run dev
```

`http://localhost:3000` ochiladi. To'liq sozlash — [SETUP.md](./SETUP.md).

## Loyiha tuzilmasi

```
src/
├─ app/                  Next.js App Router (sahifalar va route handlerlar)
│  ├─ admin/             Admin panel (role='admin' middleware bilan himoyalangan)
│  ├─ auth/              Login, signup, verify, reset, callback
│  ├─ feed/ books/ ...   Asosiy sahifalar
│  ├─ layout.tsx         Metadata, JSON-LD, theme bootstrap
│  ├─ sitemap.ts         /sitemap.xml
│  ├─ robots.ts          /robots.txt
│  ├─ manifest.ts        PWA manifest
│  ├─ icon.svg           Favicon
│  └─ opengraph-image.tsx Ijtimoiy ulashish kartochkasi
├─ components/           Qayta ishlatiladigan UI
│  ├─ social/            Like, Bookmark, Follow, Share, CommentThread
│  └─ ...                AppShell, Sidebar, RightRail, Toast, ...
├─ lib/
│  ├─ actions.ts         Server actions (mutations)
│  ├─ queries.ts         Read funksiyalari (Supabase yoki bo'sh)
│  ├─ auth.ts            getCurrentUser()
│  ├─ supabase/          Client va server helperlar
│  ├─ tokens.ts          Dizayn tokenlari
│  ├─ types.ts           TypeScript turlari
│  └─ site.ts            Site URL va meta
└─ middleware.ts         Auth gate, /admin role check

supabase/
├─ schema.sql            To'liq DB schema (RLS, triggerlar, storage)
└─ email-templates/      5 ta brendlangan email shabloni
```

## Ko'rsatmalar

### Style va konventsiyalar

- **Komponent fayllari:** PascalCase, har bir fayl bitta default export
  bo'lmasa, named exports.
- **Server kod fayllari:** `'use server'` direktivasi server actions uchun.
- **Client kod fayllari:** `'use client'` direktivasi.
- **Server Components** default — interaktivlik kerak bo'lganda client.
- **Strings:** o'zbek tilida (UI). Texnik atamalar (SQL, API, comment lar) — ingliz.
- **Narsalar nomlanishi:** o'zbekcha (lekin URL/identifier'lar `username`,
  `slug` kabi qoladi).

### TypeScript

- `npm run typecheck` toza chiqishi kerak.
- `any` ni iloji boricha ishlatmang. `unknown` + type narrowing afzal.
- Supabase'dan kelgan rowlarni `lib/types.ts` da tip qilib qo'ying.

### Animatsiyalar

`globals.css` da @keyframes va `.anim-*` utility'lar. Yangi animatsiya
qo'shsangiz:
- O'rnashish vaqti 0.6-0.9s
- `cubic-bezier(0.16,1,0.3,1)` (smooth ease-out)
- `@media (prefers-reduced-motion: reduce)` honor qilinadi

### Yangi sahifa qo'shish

1. `src/app/<route>/page.tsx` yarating.
2. AppShell ichiga o'rang:
   ```tsx
   import { AppShell } from '@/components/AppShell';
   export default async function Page() {
     return <AppShell hideRail><MyView /></AppShell>;
   }
   ```
3. Agar auth kerak bo'lsa: `middleware.ts` dagi `PROTECTED` ro'yxatga qo'shing.
4. Sitemap'ga qo'shilishi uchun: `src/app/sitemap.ts` da `staticRoutes` ga
   qator qo'shing.
5. Sidebar nav'ga ko'rsatish kerak bo'lsa: `src/components/Sidebar.tsx` ichidagi
   `NAV_BASE` ga qator qo'shing.

### Yangi server action qo'shish

`src/lib/actions.ts` ichida:
```ts
export async function myAction(input: MyInput) {
  try {
    const { sb, userId } = await requireUser();
    // ... DB ish
    revalidatePath('/...');
    return { ok: true, /* ... */ };
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
}
```

Client tomondan `useTransition` bilan optimistic UI qiling.

### Yangi DB jadvali qo'shish

1. `supabase/schema.sql` ga jadval, indeks, RLS, triggerni qo'shing.
2. **Hech qachon RLS'siz qoldirmang.** Har INSERT/UPDATE/DELETE/SELECT uchun
   policy yozing.
3. Loyihada migration paket'i bo'lsa, yangi migration yozing:
   ```bash
   supabase migration new add_<feature>
   ```

### Yangi email shabloni

`supabase/email-templates/<name>.html` — Poppins + brending. Variables
Supabase tomonidan replace qilinadi (`{{ .ConfirmationURL }}` va h.k.).

## Pull request ish jarayoni

1. Fork qiling, branch yarating: `git checkout -b feat/your-feature`
2. **Yozish oldidan:** `npm run build` toza chiqishini tekshiring.
3. Commit message konventsiyasi (Conventional Commits):
   ```
   feat: add story bookmarks page
   fix(auth): handle expired magic link
   docs: update SETUP for Resend domain verification
   chore: bump next to 14.2.16
   refactor(admin): extract chart helpers
   ```
4. PR ochishdan oldin:
   - [ ] `npm run typecheck` toza
   - [ ] `npm run build` toza
   - [ ] Yangi sahifa qo'shilgan bo'lsa screenshot biriktiring
   - [ ] DB schema o'zgargan bo'lsa migration faylini ko'rsating
5. PR description: nima o'zgardi, qaysi muammoni hal qiladi, qanday sinab
   ko'rish.

## Maxsus mavzular

### O'zbek lokalizatsiya

UI string'lari o'zbek tilida. Variantlar:
- **Buyruq formasi:** "O'qish", "Yozish" (sahifa nomlari)
- **Hurmat shakli:** "Kiring", "Saqlang" (foydalanuvchi harakati)
- **Holat:** "Saqlandi", "Yuborilmoqda" (toast)

Yangi tarjima qo'shganda mavjud sahifalardagi tonni saqlang.

### Diqqat va sezgirlik

Brand "sekin va ataylab" — animatsiyalar yumshoq, fontlar Poppins, ranglar
issiq apelsin. Hech qachon shou-off, mehrli va sodda.

## Yordam kerakmi?

GitHub Issues: [github.com/AzizX-coder/Siyoh-Web/issues](https://github.com/AzizX-coder/Siyoh-Web/issues)

> Sekinlashishga arziydigan hikoyalar.
