# Implementation Plan
## Spark E-Cell Website: Blog with Admin Scheduling (React)

| | |
|---|---|
| **Related document** | PRD.md |
| **Version** | 1.0 (MVP) |
| **Date** | 10 October 2026 |

---

## 1. Technical Approach

A React single-page app (built with Vite) talking to a small Node.js API:

- **Frontend:** React 18 with React Router, built and bundled by Vite. Plain CSS (one global stylesheet) for the MVP.
- **Backend:** Node.js + Express serving a JSON API, plus the built React files in production.
- **Storage (MVP):** A single JSON file on disk (`server/data/posts.json`).
- **Auth:** One admin password from an environment variable, exchanged for a random bearer token kept in server memory. The React app keeps the token in `sessionStorage` and sends it in the `Authorization` header.
- **Scheduling:** Each post has a `publishAt` timestamp. Public endpoints return only posts where `publishAt <= now`. There is no cron job or queue.

### Why this stack
React gives a component-based UI that is easy to extend (new pages, filters, editors) and is a common skill among student developers. Vite keeps local development fast. The Express API stays small, and storage and auth sit behind small functions so each can be swapped later without touching the React code.

### Development vs production
- **Development:** Vite dev server (port 5173) with a proxy forwarding `/api` to Express (port 3000). Hot reload on the frontend.
- **Production:** `vite build` outputs static files to `client/dist`. Express serves them and returns `index.html` for any non-API route so refreshes on `/post/:id` and `/admin` work.

## 2. Architecture

```
Browser (React SPA)
  ├─ /            Home            ──► GET /api/posts
  ├─ /post/:id    PostPage        ──► GET /api/posts/:id
  └─ /admin       Admin           ──► POST /api/login
                                     └─► /api/admin/posts (Bearer token)
                                  │
                           Express server (server/server.js)
                            ├─ static files from client/dist (production)
                            ├─ SPA fallback → index.html
                            ├─ auth middleware (token check)
                            ├─ validation (clean())
                            └─ load()/save() ──► server/data/posts.json
```

## 3. Project Structure

```
spark-ecell/
├── package.json            # root scripts (dev, build, start) and server dependencies
├── README.md
├── server/
│   ├── server.js           # Express app, routes, auth, storage helpers, SPA fallback
│   └── data/
│       └── posts.json      # created at first save
└── client/
    ├── package.json
    ├── vite.config.js      # dev proxy: /api → http://localhost:3000
    ├── index.html
    └── src/
        ├── main.jsx        # React entry, BrowserRouter
        ├── App.jsx         # route definitions
        ├── api.js          # fetch wrapper, token helpers
        ├── styles.css
        ├── components/
        │   ├── Layout.jsx      # header, nav, footer, <Outlet />
        │   ├── PostCard.jsx
        │   ├── PostForm.jsx    # create/edit form with date-time picker
        │   └── PostList.jsx    # admin list with status badges
        └── pages/
            ├── Home.jsx
            ├── PostPage.jsx
            ├── Admin.jsx       # login gate + dashboard
            └── NotFound.jsx
```

## 4. Phased Delivery

### Phase 1: Foundation (Day 1)
- [ ] Initialise root Node project and install Express
- [ ] Scaffold React app in `client/` with Vite; add React Router
- [ ] Configure the Vite proxy for `/api`
- [ ] Implement `load()` / `save()` for `server/data/posts.json`
- [ ] Define post schema and `clean()` validation

**Exit criteria:** Express and the Vite dev server both start, and the React page can call a test API route.

### Phase 2: Public API (Day 1)
- [ ] `GET /api/posts` returns published posts, newest first
- [ ] `GET /api/posts/:id` returns one published post or 404

**Exit criteria:** A future-dated post never appears in any public API response.

### Phase 3: Public React pages (Day 2)
- [ ] `Layout` with header, navigation and footer
- [ ] `Home` with hero section and `PostCard` grid
- [ ] Loading, empty and error states
- [ ] `PostPage` at `/post/:id` with not-found handling
- [ ] Set `document.title` per page
- [ ] Rely on React's default escaping; never use `dangerouslySetInnerHTML` for post content

**Exit criteria:** Visitors can browse the list and open posts, and a future post's URL shows "not found".

### Phase 4: Admin auth and API (Day 2–3)
- [ ] `POST /api/login` compares password to `ADMIN_PASSWORD` and issues a token
- [ ] Auth middleware protects `/api/admin/*`
- [ ] `GET/POST/PUT/DELETE /api/admin/posts` with validation and a computed status field
- [ ] `api.js` helper attaches the token and clears it on any 401 response

**Exit criteria:** Admin routes return 401 without a valid token and work with one.

### Phase 5: Admin React UI (Day 3–4)
- [ ] Login form and logout
- [ ] `PostForm` with title, author, content and a `datetime-local` input defaulting to now
- [ ] `PostList` with Scheduled/Published badges
- [ ] Edit (pre-fills the form) and delete (with confirm) actions
- [ ] Return to the login screen when the token expires or is rejected
- [ ] Convert local input time to UTC ISO string before sending; convert back for editing

**Exit criteria:** An admin can complete the full create → schedule → edit → delete flow in the browser.

### Phase 6: Production wiring (Day 4)
- [ ] Root `build` script runs `vite build` in `client/`
- [ ] Express serves `client/dist` and returns `index.html` for non-API routes
- [ ] Root `start` script runs the server only

**Exit criteria:** `npm run build && npm start` serves the full site from a single port, including direct visits to `/post/:id` and `/admin`.

### Phase 7: Testing and hardening (Day 5)
- [ ] Manual test pass against the checklist in section 5
- [ ] Verify timezone handling (enter local time, stored as UTC, displayed local)
- [ ] Set production `ADMIN_PASSWORD`; confirm default is not used
- [ ] Add basic rate limiting on `/api/login`
- [ ] Review responsive layout on a phone
- [ ] Run a Lighthouse check for performance and accessibility

**Exit criteria:** All checklist items pass.

### Phase 8: Deployment (Day 6)
- [ ] Choose a host with a persistent disk and Node support (Render, Railway, Fly.io or a VPS)
- [ ] Set build command `npm run build` and start command `npm start`
- [ ] Set environment variables (`ADMIN_PASSWORD`, `PORT`)
- [ ] Enable HTTPS and attach the domain
- [ ] Schedule backups of `server/data/posts.json`
- [ ] Hand over admin instructions to the core team

**Exit criteria:** Live site reachable over HTTPS with a working admin login.

## 5. Test Checklist

| # | Test | Expected result |
|---|---|---|
| 1 | Create a post dated in the past | Appears on home page immediately |
| 2 | Create a post dated in the future | Hidden publicly; badge shows *Scheduled* in admin |
| 3 | Open a future post's URL directly | "Not found" message |
| 4 | Edit a scheduled post to a past date | Becomes visible publicly |
| 5 | Edit a published post to a future date | Disappears from public site |
| 6 | Wait for a scheduled time to pass, then refresh | Post appears with no manual action |
| 7 | Call an admin endpoint with no token | 401 |
| 8 | Log in with a wrong password | Error message, no token stored |
| 9 | Submit the form with an empty title or content | Validation error shown |
| 10 | Enter `<script>` in a title or content | Rendered as text, not executed |
| 11 | Restart the server | Posts persist; admin must log in again |
| 12 | View on a 360 px wide screen | Layout usable, no horizontal scroll |
| 13 | Delete a post | Confirmation shown; post removed |
| 14 | Refresh the browser on `/post/:id` and `/admin` in production | Page loads correctly (SPA fallback works) |
| 15 | Use browser back/forward between pages | Navigation works without full reloads |
| 16 | Token rejected mid-session | Admin returns to the login screen |

## 6. Deployment and Configuration

| Variable | Purpose | Default |
|---|---|---|
| `ADMIN_PASSWORD` | Admin login password | `spark-admin` (**must change in production**) |
| `PORT` | Server port | `3000` |

**Local development**
```
npm install
npm --prefix client install
npm run dev:server        # terminal 1: API on :3000
npm run dev:client        # terminal 2: React on :5173
```

**Production**
```
npm install
npm run build
ADMIN_PASSWORD=<strong-password> npm start
```

**Operations notes**
- Back up `server/data/posts.json` regularly (a daily copy is enough for MVP).
- Use a process manager (PM2 or the host's own) to restart on crash.
- Serve over HTTPS only.

## 7. Known Limitations (MVP)

| Limitation | Impact | Planned fix |
|---|---|---|
| JSON file storage | Risk of data loss on concurrent writes or ephemeral disks | Move to SQLite or PostgreSQL |
| In-memory sessions | Admin logged out on restart; won't work across multiple instances | Signed tokens (JWT) or a session store |
| Single shared password | No individual accountability | Per-admin accounts with hashed passwords |
| Plain-text content only | No headings, links or images in posts | Markdown rendering plus a sanitiser |
| No drafts | A post is either scheduled or published | Add a `status: draft` field |
| Client-side rendering | Weaker SEO and link previews for posts | Pre-rendering or migrate to Next.js |

## 8. Post-MVP Roadmap

**v1.1: Production readiness**
1. Replace JSON file with SQLite (or PostgreSQL) behind the same `load/save` interface.
2. Per-admin accounts with bcrypt-hashed passwords and JWT sessions.
3. Markdown support with sanitisation (for example `react-markdown`).
4. Image upload for a cover image per post.
5. Draft status.
6. Move API calls to a data-fetching library (React Query) for caching and retries.

**v1.2: Growth features**
1. Categories and tags, plus search.
2. RSS feed and SEO improvements (per-post meta tags via React Helmet, Open Graph, pre-rendering or Next.js).
3. Events page and an About/Team page.
4. Analytics and a "scheduled posts" calendar view for admins.
5. TypeScript migration and automated tests (Vitest and React Testing Library).

## 9. Effort Estimate

| Phase | Estimate |
|---|---|
| 1. Foundation | 0.5 day |
| 2. Public API | 0.5 day |
| 3. Public React pages | 1 day |
| 4. Admin auth and API | 0.5 day |
| 5. Admin React UI | 1.5 days |
| 6. Production wiring | 0.5 day |
| 7. Testing and hardening | 1 day |
| 8. Deployment | 1 day |
| **Total** | **~6 working days** (one developer) |

## 10. Definition of Done

- All PRD "Must" requirements are implemented.
- Every test in section 5 passes.
- Production password set and HTTPS enabled.
- Backup process in place.
- README explains local setup, build, admin usage and how to change the password.
