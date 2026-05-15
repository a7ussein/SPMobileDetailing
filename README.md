# Client Template

Astro 5 + Tailwind v4 + React islands. The starter every new client site
copies from.

## Using it for a new client

```bash
cp -r G:/Clients/_template G:/Clients/<ClientName>
cd G:/Clients/<ClientName>
npm install
npm run dev
```

Then:

1. Rename `client-template` in `package.json` to the client name.
2. Set `site:` in `astro.config.mjs` to the real production URL.
3. Override the design tokens in `src/styles/global.css` — **change the
   accent color and pick a type pairing** (see house-style skill).
4. Replace the placeholder copy in `src/pages/index.astro`, `/contact.astro`,
   nav links, and footer.
5. Swap `/public/favicon.svg` with the client's mark.
6. Fill in the project's `CLAUDE.md` with the real business description and any
   client-specific rules.

## What's included

- Astro 5, SSG by default
- Tailwind v4 with CSS-first `@theme` tokens
- `@fontsource-variable/inter` (self-hosted)
- React islands wired up for anything interactive
- Motion + Lucide icons available
- Sitemap generation
- SEO meta + OG tags in `Base.astro`
- Accessible nav with skip-to-content
- Form scaffold with proper labels & `aria-describedby`
- `prefers-reduced-motion` respected globally
- Strict TypeScript
- Prettier + Tailwind class sorter
- Lighthouse CI script (`npm run lighthouse`)

## What's NOT included (intentionally)

- Specific client content — placeholder everywhere, must be replaced
- Images — supply real ones per client; no stock photos
- A blog — add with `@astrojs/content` when actually needed
- A CMS — add Sanity or MDX only if the client will update content
- Analytics — decide per client (Plausible / Fathom; never GA by default)

## Commands

| Command             | What it does                                |
| ------------------- | ------------------------------------------- |
| `npm run dev`       | Local dev server at http://localhost:4321   |
| `npm run build`     | Production build into `./dist`              |
| `npm run preview`   | Preview the production build                |
| `npm run check`     | TypeScript + Astro diagnostics              |
| `npm run format`    | Prettier + Tailwind sort                    |
| `npm run lighthouse`| Run Lighthouse CI against a local build     |

## House rules

All design decisions follow the house-style skill at
`G:\ClaudeConfig\skills\house-style\SKILL.md`. Before deploying, run the
`design-review` skill.
