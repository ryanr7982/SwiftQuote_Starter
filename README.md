# SwiftQuote 🚀

**SwiftQuote** is a modern SaaS starter that lets freelancers and small service businesses **create, send, and manage quotes** in minutes. Built with **Next.js 15 App Router**, **Supabase**, **Tailwind CSS**, and **Stripe**.

---

## ✨ Features

| Feature | Free | Pro |
|---------|------|-----|
| Unlimited clients | ✅ | ✅ |
| Quotes per month | 3 | Unlimited |
| CSV/PDF export | ✅ | ✅ |
| Custom branding | ❌ | ✅ |
| AI‑powered summary | ❌ | ✅ |

---

## 🖥️ Demo

![Dashboard screenshot](docs/dashboard.png)

### Live demo  
[https://swiftquote.vercel.app](https://swiftquote.vercel.app)

---

## ⚡ Quick start

```bash
git clone https://github.com/YOURUSERNAME/SwiftQuote.git
cd SwiftQuote
cp .env.example .env.local     # fill in keys
npm install
npm run dev
```

Open <http://localhost:3000> and create your first quote!

---

## 📦 One‑click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOURUSERNAME/SwiftQuote&env=NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY,SUPABASE_SERVICE_ROLE_KEY,STRIPE_SECRET_KEY,STRIPE_WEBHOOK_SECRET,STRIPE_PRICE_PRO_ID,NEXT_PUBLIC_APP_URL&envDescription=Add%20your%20keys&redirect-url=/dashboard)

---

## 🛠️ Tech stack

- **Next.js 15 (App Router, React Server Components)**  
- **Supabase**: database, auth, storage  
- **Stripe**: subscription payments  
- **Tailwind CSS + shadcn/ui** for styling  
- **TypeScript** everywhere

---

## 📑 Schema

The SQL to recreate the database (tables `users`, `clients`, `quotes`, `quote_items`, `subscriptions`) is in [`sql/schema.sql`](sql/schema.sql).  
Row‑level security (RLS) policies are documented in [`docs/RLS.md`](docs/RLS.md).

---

## 🙏 License

Released under the MIT License – see [`LICENSE`](LICENSE) for details.
