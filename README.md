# Implement From Scratch Website

A Next.js application that displays implementation guides from all repositories in the `implement-from-scratch` organization that follow the template structure.

## Features

- Dynamic repository listing from GitHub organization
- Guide overview pages with interactive flow diagrams
- Chapter pages for individual guide chapters
- Dark/light theme toggle
- Responsive design
- Syntax highlighting for code blocks (C, C++, Rust, and more)
- Incremental Static Regeneration (ISR) with 1-hour revalidation
- Search and filter functionality on homepage

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Octokit (GitHub API)
- next-mdx-remote (MDX rendering)
- rehype-highlight (syntax highlighting)

## Configuration

Repositories to display are configured in `config/repos.ts`. Add repository names to the array to include them in the website.

## Project Structure

```
website/
├── app/
│   ├── [repo]/
│   │   ├── [chapter]/
│   │   │   └── page.tsx
│   │   └── page.tsx
│   ├── globals.css
│   ├── layout.tsx
│   ├── not-found.tsx
│   ├── page.tsx
│   └── page-client.tsx
├── components/
│   ├── FlowDiagram.tsx
│   ├── Footer.tsx
│   ├── GuideCard.tsx
│   ├── Header.tsx
│   ├── MDXClient.tsx
│   ├── MarkdownRenderer.tsx
│   ├── TOC.tsx
│   └── ThemeProvider.tsx
├── config/
│   └── repos.ts
├── lib/
│   └── github.ts
└── public/
```

## How It Works

1. The homepage fetches repositories from the GitHub organization
2. Filters repositories listed in `config/repos.ts` that have a `docs` folder
3. Displays them as cards with search and filter functionality
4. Each guide page (`/[repo]`) shows an interactive flow diagram of all chapters
5. Chapter pages (`/[repo]/[chapter]`) display individual chapter markdown files with prev/next navigation
6. All pages use ISR with a 1-hour revalidation interval
