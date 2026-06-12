# Tier Maker

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Drizzle_ORM-000000?style=for-the-badge&logo=drizzle&logoColor=white" alt="Drizzle ORM" />
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Neon-000000?style=for-the-badge&logo=neon&logoColor=white" alt="Neon" />
  <img src="https://img.shields.io/badge/Better_Auth-000000?style=for-the-badge&logo=betterauth&logoColor=white" alt="Better Auth" />
  <img src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel" />
  <img src="https://img.shields.io/badge/pnpm-F69220?style=for-the-badge&logo=pnpm&logoColor=white" alt="pnpm" />
  <img src="https://img.shields.io/badge/Vitest-6E9F18?style=for-the-badge&logo=vitest&logoColor=white" alt="Vitest" />
  <img src="https://img.shields.io/badge/Zod-3E67B1?style=for-the-badge&logo=zod&logoColor=white" alt="Zod" />
</p>

A modern web platform for creating, customizing, and sharing tier lists. Rank anything — movies, games, music, anime, food — with a clean, drag-and-drop interface and no ads.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Database Setup](#database-setup)
- [Scripts](#scripts)
- [Project Structure](#project-structure)
- [Design System](#design-system)
- [Testing](#testing)
- [Contributing](#contributing)
- [License](#license)

---

## Features

- **Tier List Editor** — Drag-and-drop board with customizable S/A/B/C/D/F rows, editable labels, and color pickers
- **Image Upload** — Upload images via click, drag-drop onto the page, or clipboard paste (JPG, PNG, WEBP, GIF; max 5 MB per file, 30 items per list)
- **Image Labels** — Add text labels to each uploaded image for better identification
- **Category Presets** — 15 built-in category presets plus the ability to save custom ones per user
- **Export to Image** — Download completed tier lists as high-resolution PNG images, optimized for social sharing
- **Public Explore** — Browse, search, and filter public tier lists from the community with pagination and sorting
- **Likes System** — Like and bookmark public tier lists you enjoy
- **User Dashboard** — Stats overview, recent tier lists grid, and full tier list management with a collapsible sidebar
- **Authentication** — Email/password registration and login via Better Auth with session management
- **Dark/Light Themes** — Dark-first design with a circular-mask View Transition animation on toggle
- **Responsive Layout** — Desktop sidebar collapses to a mobile hamburger sheet
- **Animations** — Entrance animations, stagger effects, drag feedback, and page transitions powered by Motion

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| UI | React 19, Shadcn UI (base-nova), Tailwind CSS v4 |
| Animation | Motion (framer-motion successor) |
| Drag & Drop | @hello-pangea/dnd |
| State | Zustand |
| Forms | React Hook Form + Zod |
| Database | PostgreSQL (Neon Serverless) |
| ORM | Drizzle ORM |
| Auth | Better Auth |
| Image Storage | Vercel Blob |
| Notifications | Sonner (toast alerts) |
| Package Manager | pnpm |
| Testing | Vitest, Testing Library |
| Linting | ESLint, Prettier |
| Icons | Lucide React |

---

## Architecture

The application follows the Next.js App Router conventions with server components by default. Client components are explicitly marked with `"use client"` only where interactivity is required.

- **Server Actions** handle data mutations (tier list creation, image uploads, category preset management, likes)
- **Server Components** power the explore page with streaming, search, filtering, and pagination
- **Drizzle ORM** manages schema definitions, migrations, and type-safe queries against a Neon PostgreSQL database
- **Zustand** manages client-side state for the tier list editor and UI preferences
- **Better Auth** provides session-based authentication with a Drizzle adapter
- **IDB (IndexedDB)** persists unsaved tier list data locally for recovery
- **Server-side Caching** uses Next.js cache tags for invalidation of explore and dashboard data

---

## Getting Started

### Prerequisites

- Node.js >= 20
- pnpm = 11
- A Neon PostgreSQL database (or any PostgreSQL instance)
- A Vercel Blob storage token (for image uploads)
- Google OAuth credentials (optional, for Google login)

### Installation

```bash
git clone https://github.com/your-username/tier-maker.git
cd tier-maker
pnpm install
```

### Environment Variables

Create a `.env.local` file in the project root:

```env
# Database
DATABASE_URI=postgresql://user:password@host/dbname?sslmode=require

# Better Auth
BETTER_AUTH_SECRET=your-auth-secret
BETTER_AUTH_URL=http://localhost:3000

# Vercel Blob (image storage)
BLOB_STORE_ID=your-store-id
BLOB_READ_WRITE_TOKEN=your-vercel-blob-token

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> **⚠️ Security Notice:** Never commit `.env.local` to version control. It is already listed in `.gitignore`. Keep your secrets private.

### Database Setup

```bash
# Generate migration files from the schema
pnpm db:generate

# Apply migrations to the database
pnpm db:migrate
```

Then start the development server:

```bash
pnpm dev
```

The application will be available at `http://localhost:3000`.

---

## Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start the development server |
| `pnpm build` | Create a production build |
| `pnpm start` | Start the production server |
| `pnpm lint` | Run ESLint |
| `pnpm format` | Format code with Prettier |
| `pnpm typecheck` | Run TypeScript type checking |
| `pnpm test` | Run tests once |
| `pnpm test:watch` | Run tests in watch mode |
| `pnpm db:generate` | Generate Drizzle migration files |
| `pnpm db:migrate` | Run pending migrations |
| `pnpm db:studio` | Open Drizzle Studio |

---

## Project Structure

```
tier-maker/
├── app/
│   ├── layout.tsx                  # Root layout (fonts, providers, transitions)
│   ├── page.tsx                    # Landing page with bento grid
│   ├── (auth)/                     # Auth route group (login, register)
│   ├── api/auth/[...all]/          # Better Auth API handler
│   ├── explore/                    # Public explore page (browse community tier lists)
│   │   ├── page.tsx                # Search, filter, pagination
│   │   └── [id]/                   # View public tier list
│   └── dashboard/                  # Auth-guarded dashboard
│       ├── page.tsx                # Stats + recent tier lists
│       ├── explore/                # Explore from within dashboard
│       └── tier-lists/
│           ├── page.tsx            # All user tier lists
│           ├── new/                # Tier list creator
│           └── [id]/               # View tier list
│               └── edit/           # Edit/fill tier list
├── components/
│   ├── ui/                         # Shadcn UI primitives
│   ├── auth-form.tsx               # Login/register form
│   ├── bento-grid.tsx              # Bento layout system
│   ├── hero-demo.tsx               # Interactive landing demo
│   ├── like-button.tsx             # Like/heart button
│   └── sparkline.tsx               # Stats sparkline charts
├── lib/
│   ├── auth.ts                     # Better Auth server config
│   ├── auth-client.ts              # Better Auth React client
│   ├── db.ts                       # Neon + Drizzle connection
│   ├── db/schema/                  # Database schema definitions
│   ├── queries/                    # Reusable DB queries (likes, templates, presets)
│   ├── stores/                     # Zustand stores (editor, UI)
│   ├── validators/                 # Zod schemas
│   ├── motion-variants.ts          # Animation variant definitions
│   └── cache-tags.ts               # Next.js cache tag constants
├── hooks/                          # Custom React hooks
├── drizzle/                        # Generated migrations
├── drizzle.config.ts               # Drizzle Kit configuration
├── next.config.ts                  # Next.js configuration
├── vitest.config.ts                # Test configuration
└── DESIGN.md                       # Design system specification
```

---

## Design System

The application uses a dark-first design language inspired by modern developer tools.

- **Color space**: OKLCH for all custom properties
- **Primary**: Electric blue `oklch(0.62 0.22 250)`
- **Typography**: Cal Sans (headings), Geist (body), Geist Mono (code)
- **Base font size**: 13px
- **Spacing unit**: 8px
- **Depth**: Achieved through color steps (`#1A1A1A` > `#242424` > `#2E2E2E`) rather than shadows
- **Border radius**: 6px default

See [DESIGN.md](./DESIGN.md) for the full specification.

---

## Testing

Tests run with Vitest using jsdom and Testing Library:

```bash
# Run all tests
pnpm test

# Watch mode
pnpm test:watch
```

Test files are co-located with their source modules (e.g., `tier-editor.test.ts` alongside `tier-editor.ts`).

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines on how to contribute to this project.

---

## License

This project is licensed under the MIT License. See [LICENSE](./LICENSE) for details.
