# Agent rules — replace on first handoff

This file is a placeholder. The `handoff-package` skill in Claude Code
regenerates it from the studio's current house-style when Claude hands
this project over to Antigravity, Cursor, or any other agent-driven tool.

Any AI agent working in this repository should follow the rules below
until the handoff skill has run and rewritten this file with the full
current ruleset.

## Stack

- Astro 5, Tailwind v4 (CSS-first `@theme`), React 19 islands, Motion
- TypeScript strict, self-hosted Inter via @fontsource-variable

## Design rules (short version — full rules at the source below)

- One accent color per project, generous whitespace, 8px grid
- Typography: max 2 families, body ≥ 17px, line-height 1.6
- Never centered hero with 3 identical feature cards
- Never purple→pink gradient on CTAs
- Motion purposeful, 150–250ms UI / 400–600ms enters, respect
  `prefers-reduced-motion`
- WCAG 2.2 AA contrast, keyboard nav, visible focus ring
- Never ship placeholder copy or the stand-in hero gradient

## Before any commit

- `npm run check` and `npm run build` must pass
- Test at 375px and 1280px minimum
- If the commit touches design tokens, verify contrast at WCAG AA

## Source of truth

`G:\ClaudeConfig\skills\house-style\SKILL.md`

If you (the agent) discover a rule that should be universal across
projects, propose an edit to that file — do not just add project-specific
overrides here.
