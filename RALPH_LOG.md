# Ralph Loop — Aether × SentimenTrader Demo Polish

Started: 2026-02-24T04:20:00+01:00
Config: interval=15min, maxIterations=40, duration=5h, agents=3-5

## Context
This is a Next.js 14 interactive demo showing Ontos' compiled reasoning engine applied to SentimenTrader's 3,100 indicators. 4 phases: Problem, .onto Engine, Live Tick simulation, Deterministic AI chat. Single page.tsx (~700 lines). Uses framer-motion, Tailwind, inline styles. Dark theme.

Live URL: Deployed on Vercel (ontos-aether-demo project).

## Backlog
- [ ] Responsive design — currently hardcoded px values, breaks on mobile/tablet
- [ ] Add keyboard navigation between phases (arrow keys)
- [ ] Auto-advance option: phases auto-play like a presentation
- [ ] Phase 1: Add animated counter for "3,100 indicators" stat
- [ ] Phase 2: Syntax highlighting improvements — keywords, strings, comments should be more distinct
- [ ] Phase 2: Add collapsible sections for the .onto code (classes vs rules)
- [ ] Phase 3: Add a timeline/sparkline showing S&P 500 price with the two tick dates marked
- [ ] Phase 3: Terminal should have a blinking cursor
- [ ] Phase 3: Add sound effects toggle (optional terminal typing sounds)
- [ ] Phase 4: Chat response should render markdown properly (bold, bullets, numbered lists)
- [ ] Phase 4: Add typing indicator that feels more natural (variable speed)
- [ ] Add page transitions that feel more cinematic (slide + fade)
- [ ] Add a progress bar at top showing which phase you're on
- [ ] Loading state / skeleton for initial page load
- [ ] Add subtle particle/grid background animation (very subtle, not distracting)
- [ ] Meta tags — og:image, title, description for sharing
- [ ] Accessibility — aria labels, focus management, screen reader support
- [ ] Performance — lazy load phases, reduce bundle size
- [ ] Add "Restart Demo" button to go back to phase 1
- [ ] Phase 3 done state: add a mini graph visualization showing the 4-hop traversal path
- [ ] Footer with Ontos branding + "Built with .onto" badge
- [ ] Extract hardcoded data (tick output, chat messages, onto code) into separate files
- [ ] TypeScript strict mode — fix any type issues
- [ ] Add error boundary around each phase
- [ ] Smooth scroll behavior when switching phases
- [ ] Phase navigation dots (mobile-friendly alternative to text tabs)

## Completed
(items move here as they're done)

## Iteration History
(appended each iteration)
