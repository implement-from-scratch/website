# AGENTS.md - Development Guidelines

## Build, Lint, and Test Commands

```bash
# Development server (with hot reload)
npm run dev

# Production build (suppresses known Next.js/ESLint circular structure warnings)
npm run build

# Clean production build (full output)
npm run build:clean

# Start production server
npm start

# Run ESLint
npm run lint
```

**Note:** This project has no test framework configured. Do not write tests unless explicitly requested.

## Code Style Guidelines

### TypeScript
- Use TypeScript for all new code with strict mode enabled
- Define interfaces for all data structures (see `lib/github.ts` for examples)
- Use `any` sparingly; prefer specific types or `unknown` with type guards
- Enable explicit return types for exported functions

### React Components
- Use `'use client'` directive only for components that need client-side hooks
- Default exports for all components
- Prefer functional components with hooks over class components
- Use TypeScript interfaces for props:

```typescript
interface ComponentProps {
  requiredProp: string;
  optionalProp?: number;
}
```

### File Organization
```
app/           - Next.js App Router pages and layouts
components/    - Reusable React components (default exports)
lib/           - Utility functions and API clients
config/        - Static configuration
```

### Imports
- Use absolute imports with `@/` prefix (configured in `tsconfig.json`)
- Group imports: React/Next.js imports first, then third-party, then local
- Use named imports for multiple items from same package:

```typescript
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { octokit } from '@/lib/github';
```

### Naming Conventions
- **Components**: PascalCase (`Header.tsx`, `MarkdownRenderer.tsx`)
- **Variables/functions**: camelCase (`getRepositories`, `repoContents`)
- **Constants**: SCREAMING_SNAKE_CASE for config values
- **Interfaces**: PascalCase with `Props` suffix for component props
- **Types**: Prefer interfaces over type aliases for object shapes

### Error Handling
- Wrap async operations in try/catch blocks
- Log errors with context using `console.error()`
- Return fallback values or empty arrays on error (see `lib/github.ts`)
- Display user-friendly error states in UI components

### Styling
- Use Tailwind CSS for all styling
- Follow color conventions from `tailwind.config.js`:
  - Background: `bg-light`/`bg-dark` or `white`/`#0a0a0a`
  - Text: `text-light`/`text-dark` or `gray-900`/`gray-400`
  - Borders: `border-light`/`border-dark` or `gray-200`/`#262626`
- Use `dark:` variant for dark mode styles
- Responsive classes: `sm:`, `md:`, `lg:`, `xl:`

### Mobile-First Responsive Design

This project follows a mobile-first approach. Styles are defined for mobile first, then enhanced for larger screens.

**Breakpoint Strategy:**
```
Mobile:     320px - 639px   (default, no prefix)
Small:      640px - 767px   (sm:)
Medium:     768px - 1023px  (md:)
Large:      1024px - 1279px (lg:)
X-Large:    1280px+         (xl:)
```

**Mobile-First Guidelines:**
- Write base styles for mobile without breakpoint prefixes
- Use `sm:` for small tablets and large phones (640px+)
- Use `md:` for tablets and small laptops (768px+)
- Use `lg:` for laptops and desktops (1024px+)
- Use `xl:` for large screens (1280px+)

**Touch Targets:**
- Minimum touch target size: 44x44px (`touch-manipulation` class)
- Use `min-height` and `min-width` for interactive elements
- Spacing: Increase padding on mobile for comfortable tapping

**Mobile Navigation:**
- Hamburger menu for mobile (hidden on md+)
- Full-screen overlay with centered menu items
- Body scroll lock when mobile menu is open

**Responsive Grids:**
- Homepage guides: `grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3`
- Roadmap desktop: Horizontal scroll with snap (lg:)
- Roadmap tablet: 2-column grid (md:hidden lg:block)
- Roadmap mobile: Vertical stack (md:hidden)

**Content Prioritization:**
- Most important content visible on mobile
- Secondary navigation hidden behind menu on mobile
- Truncate long text with `truncate` class on mobile
- Stack navigation buttons vertically on mobile

**Common Responsive Patterns:**
- Header: Mobile hamburger menu, visible nav on md+
- Grid cards: 1 column mobile, 2 column tablet, 3 column desktop
- Navigation buttons: Stacked on mobile, inline on desktop
- Tables: Horizontal scroll or transform to cards on mobile

### Accessibility
- Include `aria-label` on icon buttons
- Use semantic HTML (`<header>`, `<nav>`, `<main>`, `<footer>`)
- Implement skip links for keyboard navigation

### Performance
- Use `dynamic` imports with `{ ssr: false }` for client-only components
- Leverage Next.js ISR with `revalidate` option for data fetching
- Lazy load heavy components (React Flow, Mermaid)

### Next.js App Router Conventions
- Server Components by default (no `'use client'` unless needed)
- Async/await in page components for data fetching
- Use `generateStaticParams` for static page generation
- Implement `not-found()` for 404 handling
