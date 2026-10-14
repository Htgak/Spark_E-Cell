# Product Requirements Document (PRD)
## Spark E-Cell Website: Blog with Admin Scheduling

| | |
|---|---|
| **Product** | Spark E-Cell Website |
| **Owner** | Spark E-Cell core team |
| **Version** | 1.0 (MVP) |
| **Date** | 10 October 2026 |
| **Status** | Draft |

---

## 1. Overview

Spark E-Cell (Entrepreneurship Cell) needs a public website to share stories, startup lessons and event updates. Admins must be able to write blog posts in advance and choose the date and time each post goes live, so content can be planned around events and campaigns without anyone publishing manually.

## 2. Problem Statement

- E-Cell content is currently scattered across social media and chat groups, with no single home.
- Posts are published ad hoc, so there is no way to prepare a content calendar in advance.
- Non-technical members need a simple way to publish without touching code.

## 3. Goals and Non-Goals

### Goals
1. Provide a public blog that visitors can read without signing in.
2. Let admins create, edit and delete posts through a protected panel.
3. Let admins set a **publish date and time** per post; the post appears publicly only when that time arrives.
4. Keep the system simple enough to host cheaply and maintain by student volunteers.

### Non-Goals (MVP)
- Multi-user roles and permissions (single shared admin login for MVP).
- Public comments, likes or user accounts.
- Image/media uploads (planned for v1.1).
- Email newsletters or social auto-posting.

## 4. Target Users

| Persona | Description | Needs |
|---|---|---|
| **Visitor** | Student, aspiring founder, mentor or sponsor | Read posts quickly on mobile or desktop |
| **Admin** | E-Cell core team member | Write posts ahead of time, schedule them, fix mistakes |

## 5. User Stories

**Visitor**
- As a visitor, I can see a list of published posts, newest first.
- As a visitor, I can open a post and read its full content.
- As a visitor, I never see posts scheduled for a future date.

**Admin**
- As an admin, I can log in with a password to reach the admin panel.
- As an admin, I can create a post with title, author, content and publish date/time.
- As an admin, I can see all posts with a status label: *Scheduled* or *Published*.
- As an admin, I can edit a post, including changing its publish date.
- As an admin, I can delete a post after confirming.
- As an admin, I can log out.

## 6. Functional Requirements

### 6.1 Public site
| ID | Requirement | Priority |
|---|---|---|
| FR-1 | Home page shows hero section and a grid of published posts, newest first | Must |
| FR-2 | Each card shows title, author, publish date and a short excerpt | Must |
| FR-3 | Post page shows full title, author, date and content | Must |
| FR-4 | Posts with `publishAt` in the future are excluded from all public pages and APIs | Must |
| FR-5 | Requesting an unpublished or missing post shows a friendly "not found" message | Must |
| FR-6 | Empty state message when no posts exist | Should |
| FR-6a | Frontend is a React single-page app with client-side routing (`/`, `/post/:id`, `/admin`); direct links and page refreshes work on every route | Must |
| FR-6b | Loading and error states shown while data is fetched | Should |

### 6.2 Admin panel
| ID | Requirement | Priority |
|---|---|---|
| FR-7 | Password login; wrong password shows an error | Must |
| FR-8 | All admin API routes reject requests without a valid session token (HTTP 401) | Must |
| FR-9 | Create-post form with title, author, publish date-time and content; title, content and date are required | Must |
| FR-10 | Post list shows title, publish date-time and a Scheduled/Published badge | Must |
| FR-11 | Edit existing post, including its publish date | Must |
| FR-12 | Delete post with confirmation dialog | Must |
| FR-13 | Publish date defaults to the current time on a new post | Should |
| FR-14 | Logout clears the session | Must |

### 6.3 Scheduling behaviour
- Each post stores a `publishAt` timestamp (UTC, ISO 8601).
- A post is **published** when `publishAt <= now` and **scheduled** otherwise.
- Status is computed at request time. No background job is needed.
- Admin enters time in their local timezone; the system stores it as UTC and displays it in the viewer's local timezone.

## 7. Non-Functional Requirements

| Area | Requirement |
|---|---|
| **Performance** | Public pages load in under 2 s on a typical mobile connection |
| **Security** | Admin password set via environment variable; no hard-coded production password; all user content HTML-escaped on render to prevent XSS; HTTPS in production |
| **Responsiveness** | Usable from 360 px wide phones to desktop |
| **Reliability** | Post data persists across server restarts |
| **Accessibility** | Readable contrast, semantic HTML, keyboard-operable forms |
| **Maintainability** | Small codebase, component-based React frontend (Vite), documented setup |
| **SEO / Sharing** | Each post has its own URL and page title; basic meta tags in v1.0, server-side rendering or pre-rendering considered in v1.2 |

## 8. Data Model

**Post**
| Field | Type | Notes |
|---|---|---|
| `id` | UUID | Primary key |
| `title` | string | Required |
| `author` | string | Defaults to "Spark E-Cell" |
| `content` | text | Required, plain text for MVP |
| `publishAt` | datetime (UTC) | Required; controls visibility |
| `createdAt` | datetime (UTC) | Set automatically |

## 9. API Summary

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| GET | `/api/posts` | Public | List published posts |
| GET | `/api/posts/:id` | Public | Get one published post |
| POST | `/api/login` | Public | Exchange password for token |
| GET | `/api/admin/posts` | Admin | List all posts with status |
| POST | `/api/admin/posts` | Admin | Create post |
| PUT | `/api/admin/posts/:id` | Admin | Update post |
| DELETE | `/api/admin/posts/:id` | Admin | Delete post |

## 10. Success Metrics

| Metric | Target (first 3 months) |
|---|---|
| Posts published | At least 2 per month |
| Scheduling reliability | 100% of posts appear at or after their set time and never before |
| Admin task time | A new post can be created and scheduled in under 3 minutes |
| Monthly visitors | Baseline measured; growth target set after month 1 |

## 11. Assumptions and Risks

| Risk / Assumption | Mitigation |
|---|---|
| JSON file storage will not scale or handle concurrent writes well | Acceptable for MVP; migrate to SQLite/PostgreSQL in v1.1 |
| Single shared password is weak and gives no audit trail | Move to per-admin accounts with hashed passwords in v1.1 |
| Sessions are held in memory and reset on restart | Acceptable for MVP; use signed tokens or a session store later |
| Plain-text content limits formatting | Add Markdown or rich-text support in v1.1 |
| A client-rendered React app is weaker for search engines and link previews | Set page titles and meta tags per post in v1.0; evaluate Next.js or pre-rendering in v1.2 |
| Free hosting may sleep or wipe local files | Use a host with persistent disk, or move to a managed database |

## 12. Release Plan

| Release | Scope |
|---|---|
| **MVP (v1.0)** | Public blog, admin login, create/edit/delete, scheduled publishing |
| **v1.1** | Database, per-admin accounts, Markdown, image upload, drafts |
| **v1.2** | Categories/tags, search, RSS, events page, SEO metadata, analytics |

## 13. Open Questions

1. Does the team want a single admin password or individual accounts from launch?
2. What domain and hosting will be used?
3. Should the site include other pages (About, Team, Events, Contact) in the first release?
4. Is branding (logo, colours) already defined?
