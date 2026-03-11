# Kreditor.az

A centralized loan application platform for the Azerbaijan market. Customers fill out a single form and submit loan applications to multiple banks simultaneously. Each bank has its own admin panel with per-application status management and analytics.

---

## Features

- Single application submitted to multiple banks at once
- 22 licensed Azerbaijani banks (ABA official list)
- Per-bank admin dashboards with analytics
- Application status tracking: pending, reviewing, approved, rejected
- Anti-spam protection: per-phone (3/day) and per-IP (10/hour) rate limiting
- Full applicant logging: IP, device type, browser, OS, language, referer
- Azerbaijan phone number validation (prefixes: 10, 50, 51, 55, 60, 70, 77, 99)
- FIN code validation (7-char alphanumeric)
- PWA — installable as a desktop app from the browser
- Azerbaijani UI

---

## Screenshots

### Customer Application Form
![Apply Page](screens/apply%20page.png)

### Admin Panel Login
![Admin Login](screens/admin%20panel%20login%20page.png)

### Super Admin Dashboard
![Admin Dashboard](screens/admin%20dashboard.png)

### Banks Management
![Banks Page](screens/banks%20page.png)

### Applicants List
![Applicants List](screens/applicants%20list.png)

### Analytics
![Analytics Page](screens/analytics%20page.png)

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Database | NeonTech PostgreSQL (serverless) |
| ORM | Drizzle ORM |
| Auth | JWT via `jose`, HTTP-only cookie |
| Object Storage | Cloudflare R2 |
| Hosting | Vercel |

---

## Admin Panel Access

### Super Admin

Manages all banks, admins, and applications across the platform.

| Field | Value |
|-------|-------|
| URL | `/admin/login` |
| Email | `admin@kreditor.az` |
| Password | `Admin@1234` |

### Bank Admins

Each bank has its own isolated admin panel at `/admin/bank/[slug]/login`.

Default credentials for all seeded banks: password is `Bank@1234`, email is `admin@[slug].kreditor.az`.

| Bank | Login URL | Email | Password |
|------|-----------|-------|----------|
| ABB ASC | `/admin/bank/abb/login` | `admin@abb.kreditor.az` | `Bank@1234` |
| AccessBank | `/admin/bank/accessbank/login` | `admin@accessbank.kreditor.az` | `Bank@1234` |
| AFB Bank | `/admin/bank/afb-bank/login` | `admin@afb-bank.kreditor.az` | `Bank@1234` |
| Azər Türk Bank | `/admin/bank/azer-turk-bank/login` | `admin@azer-turk-bank.kreditor.az` | `Bank@1234` |
| Azərbaycan Sənaye Bankı | `/admin/bank/senaye-bank/login` | `admin@senaye-bank.kreditor.az` | `Bank@1234` |
| Bank Avrasiya | `/admin/bank/bank-avrasiya/login` | `admin@bank-avrasiya.kreditor.az` | `Bank@1234` |
| Bank BTB | `/admin/bank/bank-btb/login` | `admin@bank-btb.kreditor.az` | `Bank@1234` |
| Bank Melli İran | `/admin/bank/bank-melli-iran/login` | `admin@bank-melli-iran.kreditor.az` | `Bank@1234` |
| Bank of Baku | `/admin/bank/bank-of-baku/login` | `admin@bank-of-baku.kreditor.az` | `Bank@1234` |
| Bank Respublika | `/admin/bank/bank-respublika/login` | `admin@bank-respublika.kreditor.az` | `Bank@1234` |
| Bank VTB | `/admin/bank/bank-vtb/login` | `admin@bank-vtb.kreditor.az` | `Bank@1234` |
| Expressbank | `/admin/bank/expressbank/login` | `admin@expressbank.kreditor.az` | `Bank@1234` |
| Xalq Bank | `/admin/bank/xalq-bank/login` | `admin@xalq-bank.kreditor.az` | `Bank@1234` |
| Kapital Bank | `/admin/bank/kapital-bank/login` | `admin@kapital-bank.kreditor.az` | `Bank@1234` |
| PAŞA Bank | `/admin/bank/pasa-bank/login` | `admin@pasa-bank.kreditor.az` | `Bank@1234` |
| Premium Bank | `/admin/bank/premium-bank/login` | `admin@premium-bank.kreditor.az` | `Bank@1234` |
| Rabitəbank | `/admin/bank/rabitabank/login` | `admin@rabitabank.kreditor.az` | `Bank@1234` |
| TuranBank | `/admin/bank/turanbank/login` | `admin@turanbank.kreditor.az` | `Bank@1234` |
| Unibank | `/admin/bank/unibank/login` | `admin@unibank.kreditor.az` | `Bank@1234` |
| Yapı Kredi Bank | `/admin/bank/yapi-kredi-bank/login` | `admin@yapi-kredi-bank.kreditor.az` | `Bank@1234` |
| Yelo Bank | `/admin/bank/yelo-bank/login` | `admin@yelo-bank.kreditor.az` | `Bank@1234` |
| Ziraat Bank | `/admin/bank/ziraat-bank/login` | `admin@ziraat-bank.kreditor.az` | `Bank@1234` |
| **X-Bank (demo)** | `/admin/bank/x-bank/login` | `admin@x-bank.kreditor.az` | `Demo@1234` |

---

## Demo Bank — X-Bank

X-Bank is a pre-seeded demo bank for platform testing. It comes with 8 sample applications in all possible statuses:

| Status | Count |
|--------|-------|
| Gözləmədə (Pending) | 3 |
| Baxılır (Reviewing) | 2 |
| Təsdiq edildi (Approved) | 2 |
| Rədd edildi (Rejected) | 1 |

Run the demo seed:

```bash
npm run db:seed:demo
```

---

## Routes Overview

| Route | Description |
|-------|-------------|
| `/` | Customer-facing loan application form |
| `/admin/login` | Super admin login |
| `/admin/dashboard` | Super admin dashboard (stats, recent apps) |
| `/admin/banks` | Manage all banks |
| `/admin/banks/new` | Create a new bank |
| `/admin/banks/[slug]` | Edit bank details |
| `/admin/banks/[slug]/admins` | Manage bank admin users |
| `/admin/applications` | View all applications across all banks |
| `/admin/bank/[slug]/login` | Bank admin login |
| `/admin/bank/[slug]` | Bank dashboard (per-bank stats) |
| `/admin/bank/[slug]/applications` | Bank's application list with status controls |
| `/admin/bank/[slug]/settings` | Bank profile settings |

---

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Environment variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

```env
DATABASE_URL="postgresql://..."

SUPER_ADMIN_EMAIL="admin@kreditor.az"
SUPER_ADMIN_PASSWORD="Admin@1234"

NEXTAUTH_SECRET="your-secret-here"
```

### 3. Database

```bash
# Generate migration files
npm run db:generate

# Apply migrations
npm run db:migrate

# Seed all 22 ABA banks + default admin accounts
npm run db:seed

# Seed X-Bank demo data (8 sample applications)
npm run db:seed:demo
```

### 4. Run dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Database Schema

All tables live under the `kreditor` PostgreSQL schema.

```
kreditor.banks               — bank profiles (name, slug, contact info, logo)
kreditor.bank_admins         — per-bank admin users (email, bcrypt password, role)
kreditor.loan_applications   — customer applications (phone, FIN, IP, device, UA)
kreditor.application_banks   — many-to-many: application ↔ bank with per-bank status
```

```bash
# Open Drizzle Studio (visual DB browser)
npm run db:studio
```

---

## API

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/banks` | List all active banks |
| `POST` | `/api/apply` | Submit a loan application |

### POST /api/apply

```json
{
  "phoneNumber": "+994501234567",
  "finCode": "AA1B2C3",
  "bankIds": ["uuid-1", "uuid-2"]
}
```

Rate limits: 3 submissions per phone per 24h, 10 per IP per hour.

---

## Project Structure

```
src/
  app/
    page.tsx                          # Customer application form
    admin/
      (auth)/login/                   # Super admin login
      (protected)/
        dashboard/                    # Super admin dashboard
        banks/                        # Bank management
        applications/                 # All applications view
      bank/[slug]/
        (auth)/login/                 # Bank admin login
        (protected)/
          page.tsx                    # Bank dashboard
          applications/               # Per-bank applications + status
          settings/                   # Bank settings
    api/
      apply/route.ts                  # Application submission
      banks/route.ts                  # Active banks list
  db/
    schema.ts                         # Drizzle schema
    queries.ts                        # Reusable DB queries
    seed.ts                           # 22 ABA banks seed
    seed-demo.ts                      # X-Bank demo seed
  lib/
    auth.ts                           # JWT sign/verify, session
    phone.ts                          # AZ phone + FIN validation
    ua.ts                             # User-agent parser
    actions/                          # Next.js Server Actions
  components/
    admin/                            # AdminSidebar, StatusBadge
    InstallPWA.tsx                    # PWA install prompt
  middleware.ts                       # Edge auth guard
```

---

## License

Copyright (c) 2025 Kreditor.az. All rights reserved.

This is proprietary software. Copying, modifying, distributing, sublicensing, or selling
any part of this codebase is strictly prohibited. See [LICENSE](./LICENSE) for full terms.
