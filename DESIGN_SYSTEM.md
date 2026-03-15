# MetaNames Design System

> Unified design language for MetaNames products (Landing Page + App)

---

## Design Tokens

### Colors

| Token | Value | Usage |
|-------|-------|-------|
| `--primary` | `#6849fe` | Primary actions, highlights |
| `--primary-hover` | `#5a3de6` | Hover state |
| `--bg-primary` | Gradient: `from-primary via-purple-700 to-indigo-900` | Hero backgrounds |
| `--bg-secondary` | Dark backgrounds | Sections, cards |
| `--text-primary` | `#ffffff` | Main text |
| `--text-secondary` | `white/70-80%` | Subtle text |
| `--text-muted` | `white/40-60%` | Disabled, hints |
| `--border` | `white/10` | Subtle borders |
| `--glass` | `white/5-10 backdrop-blur-sm` | Cards, overlays |

### Typography

| Element | Font | Size | Weight |
|---------|------|------|--------|
| Headings | Plus Jakarta Sans | 2xl-8xl | Bold (700) |
| Body | Plus Jakarta Sans | base-lg | Normal (400) |
| Labels | Plus Jakarta Sans | sm | Medium (500) |
| Buttons | Plus Jakarta Sans | sm | Medium (500) + Uppercase |

**Font URL:**
```css
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
```

### Spacing

- Section padding: `py-12 md:py-20`
- Card padding: `p-6` to `p-8`
- Gap between elements: `gap-4` to `gap-6`
- Border radius: 
  - Cards: `rounded-2xl`
  - Buttons: `rounded-md` to `rounded-full`
  - Inputs: `rounded-lg`

### Shadows & Effects

```css
/* Glassmorphism */
.glass {
  bg-white/5 backdrop-blur-sm border border-white/10
}

/* Hover lift */
.hover-lift {
  hover:scale-[1.02] active:scale-[0.98] transition-all duration-200
}

/* Glow effect */
.glow {
  hover:shadow-lg hover:shadow-purple-500/20
}
```

---

## Component Patterns

### Buttons

```svelte
<!-- Primary -->
<button class="bg-primary text-white hover:opacity-90 hover:shadow-lg hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 rounded-md px-6 py-3 text-sm font-medium uppercase touch-manipulation">
  Label
</button>

<!-- Secondary -->
<button class="bg-white text-primary hover:bg-white/90 hover:shadow-lg hover:shadow-white/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 rounded-md px-6 py-3 text-sm font-medium uppercase touch-manipulation">
  Label
</button>
```

### Cards

```svelte
<div class="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-white/20 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300">
  Content
</div>
```

### Form Inputs

```svelte
<input class="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200" />
```

---

## Animations

### Scroll Reveal (Framer Motion)

```svelte
<motion.div
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  transition={{ duration: 0.5, delay: 0.1 }}
>
  Content
</motion.div>
```

### Fade Transitions

- Duration: `200-300ms`
- Easing: `ease-out`

### Micro-interactions

- Button press: `scale-[0.98]`
- Hover: `scale-[1.02]`
- Focus ring: `ring-2 ring-primary`

---

## Accessibility

- `touch-manipulation` on all interactive elements
- `aria-label` on icon-only buttons
- Skip links for keyboard navigation
- Focus visible states
- Color contrast minimum 4.5:1
- Reduced motion support (`prefers-reduced-motion`)

---

## Responsive Breakpoints

| Breakpoint | Width | Usage |
|------------|-------|-------|
| Mobile | < 640px | Single column |
| Tablet | 640px - 1024px | Two columns |
| Desktop | > 1024px | Full layout |

---

## Application to App

The SvelteKit app (`MetaNames/app`) should adopt this design system:

1. **Replace SMUI** with custom components using these tokens
2. **Import Plus Jakarta Sans** font
3. **Use consistent colors** via CSS variables
4. **Apply glassmorphism** patterns
5. **Add animations** via Svelte transitions or Motion

---

*Last updated: 2026-03-15*
