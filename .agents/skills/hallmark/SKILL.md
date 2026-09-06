---
name: hallmark
description: Anti-AI-slop design skill. 20 themes with real structural variety, 2+1 typography discipline, mobile-first responsive non-negotiables, and 57-gate check.
---

# Hallmark Design Skill (Local Mirror)

This repository follows the **Hallmark v1.1** anti-slop design system.
Project rules and locked design tokens are maintained in `design.md`.

## Core Disciplines
1. **Pre-flight scan**: Read `design.md` before touching any component or page.
2. **Honest copy**: Preserve all domain names, warehouse facts, real database types.
3. **Locked tokens**: Use named CSS variables / Tailwind tokens; never inline arbitrary hex/oklch/rgb colors.
4. **No re-drawn chrome**: No fake phone frames or fake browser dots.
5. **Mobile responsiveness**: Verify at 320, 375, 414, 768, 1024px. Root `overflow-x: clip`, touch target min 44px, no 2-line clickable text.
6. **Typography purity**: Never italicize headings or display text. Pair Display + Body + Mono.
7. **8-state interactive discipline**: default, hover, focus-visible, active, disabled, loading, error, success.
