# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Casual fans ranking things for fun — movies, games, music, anime, food. They build a tier list of their favorite stuff and share the result socially. Secondary audience: the broader community that browses, likes, and bookmarks public tier lists on the Explore page.

## Product Purpose

A modern web platform for creating, customizing, and sharing tier lists. It exists because incumbent tier-list tools are ad-cluttered and dated; this product wins on a radically clean, ad-free UX with fluid drag & drop and one-click high-resolution PNG export optimized for social sharing. Success: users finish and export a tier list without friction, and return to browse others'.

## Positioning

Ad-free, minimalist tier-list creation with buttery drag & drop (Zustand local state, no server round-trips while editing) and clean PNG export that automatically strips editing chrome — the export shows only the aesthetic grid. A competitor could copy features but not this UX-first standard.

## Operating Context

- Individual creation sessions: upload images (click, drag-drop, or clipboard paste), arrange into rows, label, export.
- Community surface: browse/search/filter/sort public tier lists, like and bookmark.
- Account surface: dashboard with stats, recent lists, and list management.
- Unsaved work persists locally in IndexedDB for recovery.

## Capabilities and Constraints

- Tier list editor: customizable rows (S/A/B/C/D/F default), editable labels, per-row color pickers.
- Image upload: JPG, PNG, WEBP, GIF; max 5 MB per file; max 30 items per list; optional text labels per image.
- 15 built-in category presets plus user-saved custom presets.
- Export: client-side HTML→PNG rendering, high resolution, editing chrome omitted.
- Auth: email/password via Better Auth (Google OAuth was in the original PRD; only credentials flow is confirmed in the current implementation).
- Storage: Vercel Blob for images; Neon PostgreSQL via Drizzle ORM.
- Notifications: toast alerts (Sonner).
- Drag & drop must stay smooth — target stable 60 FPS transitions.
- All mutation APIs validate the session and Zod schemas before touching the database.

## Brand Commitments

- Product name: **Tier Maker** (confirmed binding; "TierVerse"/"OwnTierMaker" in the PRD are legacy artifacts).
- Dark-first design with light mode secondary (hotkey `D` toggle), per DESIGN.md.

## Evidence on Hand

- No testimonials, press, case studies, or usage data exist. Future work must not fabricate any.

## Product Principles

1. Zero-friction creation: the path from images to exported tier list is the core job; nothing may interrupt it.
2. Clean beats cluttered: the anti-ad, anti-cruft stance is the product's reason to exist — never add monetization UI or promotional surfaces.
3. Local-first interactivity: editing feels instant because state lives client-side; the server is for persistence and sharing, not the editing loop.
4. Share-worthy output: the exported image is the product's public face — it must look good without any editing chrome.
