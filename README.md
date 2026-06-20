# SalesFlow — Sales & Distribution App

A mobile-first web application for managing a B2B sales / distribution business with
three roles: **Admin**, **Salesman**, and **Deliveryman**. Built per the requirement
document, plus product **Categories** (create/delete with live product counts).

**Stack:** Next.js 14 (App Router) + TypeScript + Tailwind CSS, with a real
**Vercel Postgres** database. Fully responsive — designed like a mobile app, and on
desktop it centers into a clean app shell.

- **No dummy data** — the app starts empty. The admin adds the real products, staff and
  categories; everything is saved to Postgres.
- **Dynamic** — all data is read from the database at runtime (`/api/bootstrap`) and every
  change is written back through `/api/mutate`. Nothing is hardcoded.

---

## ▲ Deploy to Vercel (with database) — step by step

1. Push this folder to a GitHub repository.
2. On [vercel.com](https://vercel.com): **Add New → Project** → import the repo →
   **Deploy** (Next.js is auto-detected).
3. Open the project → **Storage** tab → **Create Database → Postgres** → create it, then
   **Connect** it to this project. Vercel automatically adds the `POSTGRES_URL` env vars.
4. Go to **Deployments → ⋯ → Redeploy** once (so the running app picks up the database).
5. Open the site and log in as **admin / admin123**. The database tables are created
   **automatically** on first load — no SQL or manual setup needed.

That's it. ✅

---

## 🔑 First login

| Role  | Login ID | Password   |
|-------|----------|------------|
| Admin | `admin`  | `admin123` |

Only the admin account exists at the start. After logging in:

1. **Profile → Change Password** — change the admin password.
2. **Products** — create categories and add products.
3. **Team** — create Salesman and Deliveryman accounts (they log in with the IDs/passwords
   you set; they cannot self-register).

Salesmen then create orders, and deliverymen deliver & collect payment — all saved to the
database in real time.

---

## ✨ Features

**🛡️ Admin** — dashboard (live counts & collection totals), Products with **Categories**
(filter chips show product counts; create/delete categories), Team management (add/edit/
delete, activate/deactivate, reset password), Orders (view/reassign/cancel), online-payment
**QR Code** management, Reports (sales by salesman/deliveryman/product, cash & online), and
Profile/password.

**🧑‍💼 Salesman** — dashboard, **5-step order wizard** (Shop → GPS location → Products →
Deliveryman → Review), My Orders with filters, Profile/password.

**🛵 Deliveryman** — dashboard with collection totals, today's deliveries, **Open in Map** +
**Call shop**, item checklist, delivery flow → **Cash** or **Online (QR)** payment with
transaction ID/screenshot, delivery history, Profile/password.

---

## 🧱 How data works

- All business data lives in **one Postgres table** (`app_kv`), one row per collection
  (products, salesmen, deliverymen, orders, categories, qr, admin). The tables and the
  initial admin row are created automatically by `lib/db.ts` on first request.
- The browser loads everything once via `GET /api/bootstrap`, and every create/update/
  delete is persisted via `POST /api/mutate`. The UI updates instantly (optimistic) and
  saves in the background.
- Only the **login session** is kept in the browser; all real data is in the database, so
  it is shared across devices and users.

> If you open the app and see a "Could not reach the database" warning, the Postgres
> database isn't connected yet — follow the deploy steps above (step 3).

---

## 💻 Run locally

```bash
npm install
# To use a database locally, copy .env.example to .env.local and add your POSTGRES_URL
npm run dev      # http://localhost:3000
```

Without a `POSTGRES_URL`, the UI still runs (admin / admin123) but changes won't be saved —
connect a database to enable persistence.

Production build:

```bash
npm run build && npm start
```

---

## 📁 Project structure

```
app/
  api/bootstrap/      # GET — load all data from Postgres
  api/mutate/         # POST — persist a change to Postgres
  login/              # Login screen
  admin/              # Admin module
  salesman/           # Salesman module (incl. new-order wizard)
  deliveryman/        # Deliveryman module (incl. delivery + payment flow)
components/           # Shared UI kit, app shell (nav/guards/bootstrap), order detail view
lib/
  db.ts               # Postgres key/value data layer + schema auto-init
  store.ts            # Client store: loads from DB, persists every change via the API
  types.ts            # Domain types
  format.ts           # Currency / date / status helpers
```
