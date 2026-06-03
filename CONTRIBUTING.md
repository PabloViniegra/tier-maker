# Contributing to Tier Maker

Thank you for your interest in contributing to Tier Maker. This document explains how to submit changes, report issues, and participate in the project.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How to Contribute](#how-to-contribute)
  - [Reporting Bugs](#reporting-bugs)
  - [Suggesting Features](#suggesting-features)
  - [Submitting Code](#submitting-code)
- [Development Workflow](#development-workflow)
  - [Fork and Clone](#fork-and-clone)
  - [Branch Naming](#branch-naming)
  - [Making Changes](#making-changes)
  - [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)
- [Style Guidelines](#style-guidelines)
- [Reporting Security Issues](#reporting-security-issues)

---

## Code of Conduct

Be respectful and constructive. Harassment, discrimination, and personal attacks are not tolerated. Focus on the work, not the person.

---

## How to Contribute

### Reporting Bugs

Before opening a bug report, search existing issues to avoid duplicates. When filing a new issue, include:

1. A clear, descriptive title
2. Steps to reproduce the problem
3. Expected behavior vs. actual behavior
4. Browser, OS, and relevant version numbers
5. Screenshots or screen recordings if applicable

### Suggesting Features

Feature requests are welcome. Please open an issue with:

1. A description of the problem it solves
2. Your proposed solution
3. Any alternatives you considered

### Submitting Code

All code contributions go through the fork-and-pull-request workflow described below.

---

## Development Workflow

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:

```bash
git clone https://github.com/<your-username>/tier-maker.git
cd tier-maker
```

3. Add the upstream remote:

```bash
git remote add upstream https://github.com/<original-owner>/tier-maker.git
```

4. Install dependencies:

```bash
pnpm install
```

5. Copy the environment file and configure it:

```bash
cp .env.example .env.local
```

6. Set up the database:

```bash
pnpm db:generate
pnpm db:migrate
```

7. Start the development server:

```bash
pnpm dev
```

### Branch Naming

Create a branch from `main` using a descriptive name:

| Type | Format | Example |
|---|---|---|
| Feature | `feat/<short-description>` | `feat/dark-mode-toggle` |
| Bug fix | `fix/<short-description>` | `fix/drag-drop-offset` |
| Docs | `docs/<short-description>` | `docs/update-readme` |
| Refactor | `refactor/<short-description>` | `refactor/extract-auth-module` |
| Test | `test/<short-description>` | `test/tier-editor-store` |

### Making Changes

1. Sync your fork with upstream before starting:

```bash
git fetch upstream
git checkout main
git merge upstream/main
```

2. Create your feature branch from `main`
3. Make your changes
4. Run checks before committing:

```bash
pnpm typecheck
pnpm lint
pnpm test
```

5. Push your branch to your fork:

```bash
git push origin feat/<short-description>
```

### Commit Messages

Write clear, concise commit messages. Use the imperative mood ("Add feature" not "Added feature").

Format:

```
<type>: <short summary>

<optional body>
```

Types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `style`

Examples:

```
feat: add category preset deletion from editor
fix: correct drag offset on mobile viewports
docs: add database setup instructions to README
```

---

## Pull Request Process

1. Open a pull request from your fork's branch to the `main` branch of the upstream repository
2. Fill in the PR template with:
   - A summary of what the PR does
   - The issue it addresses (use `Closes #123` to link)
   - Screenshots or recordings for UI changes
   - Testing steps
3. Ensure all CI checks pass (lint, typecheck, tests)
4. A maintainer will review your PR. Address any requested changes by pushing new commits to the same branch
5. Once approved, a maintainer will merge the PR

**Important:**

- Keep PRs focused on a single change. Split unrelated changes into separate PRs
- Do not force-push over review comments — add new commits instead
- Rebase or merge from `main` if there are conflicts

---

## Style Guidelines

- **TypeScript** — Strict mode is enabled. Avoid `any` types
- **Components** — Use server components by default. Add `"use client"` only when interactivity is required
- **Naming** — PascalCase for components, camelCase for functions and variables, kebab-case for file names
- **Imports** — Use the `@/` path alias for project imports
- **Formatting** — Prettier runs automatically (no semicolons, single quotes, Tailwind plugin)
- **CSS** — Use Tailwind utility classes. Custom CSS values belong in `globals.css` as CSS custom properties
- **Animation** — Use Motion (`motion/react`). All variants go in `lib/motion-variants.ts`. Never hardcode transition values inline
- **Testing** — Co-locate test files with their source modules. Use Testing Library for component tests

---

## Reporting Security Issues

If you discover a security vulnerability, please do **not** open a public issue. Instead, email the maintainers directly so the issue can be addressed before public disclosure.
