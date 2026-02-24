# Ralph Loop — Aether × SentimenTrader Demo Polish

Started: 2026-02-24T04:20:00+01:00
Config: interval=15min, maxIterations=40, duration=5h, agents=3-5

## Context
This is a Next.js 14 interactive demo showing Ontos' compiled reasoning engine applied to SentimenTrader's 3,100 indicators. 4 phases: Problem, .onto Engine, Live Tick simulation, Deterministic AI chat. Single page.tsx (~700 lines). Uses framer-motion, Tailwind, inline styles. Dark theme.

Live URL: Deployed on Vercel (ontos-aether-demo project).

## Backlog
- [ ] Responsive design — currently hardcoded px values, breaks on mobile/tablet
- [ ] Auto-advance option: phases auto-play like a presentation
- [ ] Phase 1: Add animated counter for "3,100 indicators" stat
- [ ] Phase 2: Syntax highlighting improvements — keywords, strings, comments should be more distinct
- [ ] Phase 2: Add collapsible sections for the .onto code (classes vs rules)
- [ ] Phase 3: Add a timeline/sparkline showing S&P 500 price with the two tick dates marked
- [ ] Phase 3: Add sound effects toggle (optional terminal typing sounds)
- [ ] Phase 4: Chat response should render markdown properly (bold, bullets, numbered lists)
- [ ] Phase 4: Add typing indicator that feels more natural (variable speed)
- [ ] Loading state / skeleton for initial page load
- [ ] Add subtle particle/grid background animation (very subtle, not distracting)
- [ ] Meta tags — og:image, title, description for sharing
- [ ] Accessibility — aria labels, focus management, screen reader support
- [ ] Performance — lazy load phases, reduce bundle size
- [ ] Phase 3 done state: add a mini graph visualization showing the 4-hop traversal path
- [ ] Extract hardcoded data (tick output, chat messages, onto code) into separate files
- [ ] TypeScript strict mode — fix any type issues
- [ ] Add error boundary around each phase
- [ ] Smooth scroll behavior when switching phases

## Completed
- [x] Add a progress bar at top showing which phase you're on
- [x] Add keyboard navigation between phases (arrow keys + number keys 1-4)
- [x] Phase 3: Terminal should have a blinking cursor
- [x] Add "Restart Demo" button to go back to phase 1
- [x] Footer with Ontos branding + "Built with .onto" badge
- [x] Phase navigation dots (mobile-friendly alternative to text tabs) — added to footer
- [x] Add page transitions that feel more cinematic (slide + fade) — improved exit/enter animations

## Iteration History

### Iteration 1 — 2026-02-24T07:03+01:00
- Added animated progress bar at top (gradient accent→aether, smooth transitions)
- Keyboard navigation: ← → arrows, ↑ ↓ arrows, number keys 1-4
- Blinking green cursor in Phase 3 terminal during tick playback
- Footer with Ontos branding, Restart Demo button, Next Phase button, phase dots
- Improved page transitions (slide up/down + fade, 0.3s easeOut)
- Build: ✓ | Deploy: ✓ (Vercel prod)
