# /AXION — Spark E-Cell Website & Editorial Scheduling Platform

A high-performance modern web application built for **Spark E-Cell (Entrepreneurship Cell)** featuring autonomous freight/logistics visual design inspired by the `/AXION` design system, combined with a dynamic content management and time-based scheduling engine.

---

## 🌟 Highlights & Visual Design System

The application faithfully implements the aesthetics, typography, components, and layout from the design specification:
- **Typography:** Modern geometric grotesque font (`Plus Jakarta Sans`) with tight letter-spacing (`-0.035em`), bold section markers (`/INDUSTRIES WE SERVE`, `/TECHNOLOGY`, `/AXION`), and clean editorial proportions.
- **Color Palette & Atmosphere:** Deep sage canvas (`#8C9288`), crisp rounded card surfaces (`border-radius: 28px - 32px`), dark charcoal active components (`#27292B`), and high-contrast typography.
- **Component System:**
  - **Hero Section:** Display headline *"Let's Move Your Business Forward"*, editorial lead, solid black pill button, and container yard graphics with cargo telemetry stencils and `/AXION` branding.
  - **Logistics Solutions (Bento Grid):** 5-card responsive grid showcasing International Shipping, Warehousing & Distribution, Last-Mile Delivery, Supply Chain Optimization, and Customs Clearance with overlay cards and imagery.
  - **Industries We Serve:** Interactive carousel and 4 rounded industry cards (Retail, Manufacturing with dark charcoal contrast card, Healthcare, and Tech & Electronics) with interactive `(←) (→)` controls.
  - **Technology & Innovation:** Split layout with automated container hardware telemetry visual card and 2x2 modular features grid with `Learn More (→)` action buttons.
  - **Stories & Venture Dispatches (PRD Core):** Real-time publish clock, cards with title, author, publish date, category, and excerpt, linking to deep-dive article reading views.
  - **Admin Scheduling Portal (`/admin`):** Password-authenticated dashboard with real-time status badges (*Scheduled* vs *Published*), local-to-UTC date-time picker, creation, instant editing, and deletion with confirmation modal.

---

## 🏗️ Architecture

```
Browser (React 18 SPA + React Router)
  ├─ /            Home (Hero, Solutions, Industries, Tech, Blog Feed)
  ├─ /post/:id    PostPage (Single article reader with safe text rendering)
  └─ /admin       Admin (Password gate, Create/Edit forms, Post table, Metrics)
       │
       ▼ (Proxy /api in dev, direct in prod)
Node.js + Express API (server/server.js)
  ├─ Static Files & SPA Fallback (serves client/dist/index.html)
  ├─ Auth Middleware (Bearer Token verified against memory cache)
  ├─ Clean & Validation Helpers
  └─ Load / Save JSON Storage (server/data/posts.json)
```

### Firebase setup

1. Create a Firebase project, enable Firestore and Cloud Storage, and create a service account for the server.
2. Set `FIREBASE_SERVICE_ACCOUNT_JSON` (the complete service account JSON) or `FIREBASE_SERVICE_ACCOUNT_PATH` (a private file path) in the server environment. Set `FIREBASE_STORAGE_BUCKET` to the bucket name shown in Firebase Storage.
3. Deploy the server with `ADMIN_PASSWORD` set to a strong secret. Keep Firebase credentials on the server; do not put them in `VITE_*` variables.
4. For the first deploy, set `FIREBASE_MIGRATE_LOCAL_DATA=true` to copy existing `server/data/posts.json` and `gallery.json` records into Firestore. Turn it off afterward. The source JSON files remain untouched.
5. Ensure the service account has Firestore access and permission to write and make uploaded objects public in the configured Storage bucket.

Without Firebase credentials, data endpoints return a configuration error and never create empty files that could replace content.

---

## ⚙️ Scheduling Logic (PRD 6.3)

1. Each post stores a `publishAt` ISO timestamp in UTC.
2. Admins input publication times in their **local timezone** via `<input type="datetime-local">`, which is automatically converted to UTC ISO strings before sending to the API.
3. Visitors view publication times formatted into their **local browser timezone**.
4. Visibility is computed **at request time**:
   - `publishAt <= now`: Post is considered **Published** and appears in public feeds.
   - `publishAt > now`: Post is considered **Scheduled** and is excluded from all public endpoints (`/api/posts` and `/api/posts/:id` return 404).
5. No complex cron jobs or background queue workers are required; the status updates instantaneously when the clock passes the scheduled time.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### Installation
```bash
# Install root (server) dependencies
npm install

# Install client dependencies
npm --prefix client install
```

### Local Development
To run both backend and frontend concurrently:

1. **Terminal 1 (Backend API on `:3000`):**
   ```bash
   npm run dev:server
   ```

2. **Terminal 2 (Vite Frontend on `:5173` with `/api` proxy):**
   ```bash
   npm run dev:client
   ```

Open your browser at `http://localhost:5173`.

---

## 📦 Production Build & Run

To build the client and serve everything from a single Express server:

```bash
# Build client assets to client/dist
npm run build

# Start production server
ADMIN_PASSWORD=spark-admin npm start
```

Open `http://localhost:3000`.

---

## 🔐 Admin Credentials

| Setting | Value | Description |
|---|---|---|
| **Default Password** | `spark-admin` | Configurable via `ADMIN_PASSWORD` environment variable |
| **Admin Route** | `/admin` | Login gate and scheduling control center |

---

## 🧪 Verification & Test Checklist

- [x] **Scheduled Post Protection:** Posts dated in the future never appear in `/api/posts` or on the homepage.
- [x] **Direct Link 404:** Opening `/post/<scheduled-id>` directly displays a friendly not-found screen.
- [x] **Admin Badges:** Admin dashboard clearly displays amber *Scheduled* and emerald *Published* badges.
- [x] **Timezone Handling:** Datetime picker uses local time, stores in UTC ISO format, and renders in local time for viewers.
- [x] **Delete Confirmation:** Deleting a post triggers a safety confirmation modal before execution.
- [x] **SPA Direct Refresh:** Refreshing direct URLs like `/admin` and `/post/:id` works smoothly with Express SPA fallback.

