# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Sylph** - A minimal Next.js 15 portfolio/blog template with authentication and real-time features.

**Tech Stack:**

- Next.js 15.3.3 (App Router) + TypeScript + React 19
- Convex (real-time database + authentication)
- Tailwind CSS + Radix UI themes
- MDX for blog content
- next-intl for internationalization

## Common Commands

```bash
# Development
pnpm dev                    # Start development server
pnpm build                  # Production build (includes linting + timestamps)
pnpm start                  # Production server

# Linting and formatting
pnpm lint                   # Run style linting + prettier formatting
pnpm lint:style             # CSS linting only
pnpm lint:prettier          # Prettier formatting only

# Content management
pnpm mdx:timestamps         # Update MDX file timestamps
pnpm postbuild             # Generate sitemap (runs after build)

# Internationalization
pnpm i18n-coverage         # Check translation coverage
pnpm i18n-sync             # Sync translation files
pnpm i18n-sync:check       # Check translation sync status
```

## Architecture

### Directory Structure

- `app/` - Next.js App Router pages and API routes
  - `(posts)/blog/` - Blog route group with MDX content in `posts/` subdirectory
  - `api/og/` - Dynamic OpenGraph image generation
  - `dashboard/` - Protected user dashboard
  - `messages/` - Real-time messaging feature
- `components/` - React components organized by feature/type
- `convex/` - Convex backend (schema, auth config, API functions)
- `lib/` - Utilities including MDX processing and i18n
- `messages/` - Translation files for next-intl
- `types/` - TypeScript type definitions

### Key Patterns

**Provider Hierarchy:**
Root layout wraps content in: ConvexAuthProvider → NextIntlClientProvider → ViewTransitions → AppThemeProvider → Radix Theme

**MDX Blog System:**

- Blog posts live in `app/(posts)/blog/posts/` as `.mdx` files
- Posts use gray-matter frontmatter for metadata
- Processing handled by `lib/mdx/index.ts` with `getPosts()` and `getPostsByTag()`
- Dynamic routes: `[slug]/page.tsx` for individual posts, `tags/[tag]/page.tsx` for tag filtering

**Convex Backend:**

- Schema defined in `convex/schema.ts` with auth tables + messages/notes
- Authentication via `@convex-dev/auth` with user sessions
- Real-time data with automatic subscriptions

**Styling:**

- Tailwind CSS with Radix Colors integration
- Radix UI themes for consistent design system
- Dark/light mode via next-themes
- Typography handled by `@tailwindcss/typography`

### Environment Variables Required

```
NEXT_PUBLIC_CONVEX_URL=     # Convex backend URL
CONVEX_SITE_URL=           # Site URL for auth redirects
NEXT_PUBLIC_SITE_URL=      # Public site URL for OG images
```

### Build Process

1. Linting (CSS + Prettier)
2. MDX timestamp updates
3. Next.js build
4. Sitemap generation

### Development Notes

- Uses pnpm with React 19 type overrides
- Internationalization with next-intl (locale detection + message loading)
- Custom fonts loaded via `styles/fonts.ts`
- OpenGraph metadata centralized in `lib/og.ts`
- Component composition with clear separation of concerns
