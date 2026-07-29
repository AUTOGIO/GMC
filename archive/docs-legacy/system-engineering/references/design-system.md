# GMC Design System

All GMC interfaces (React dashboard, Mission Control Launcher, Real Estate Monitor) follow a unified dark-mode design language. This file defines the canonical color tokens, typography, and component conventions.

---

## Color Palette

### CSS Custom Properties (use these exact names)

```css
:root {
  /* Backgrounds */
  --bg:       #0a0a0a;    /* page background */
  --surface:  #111111;    /* card surface */
  --surface2: #181818;    /* card hover surface */

  /* Borders */
  --border:        rgba(74, 78, 82, 0.35);
  --border-bright: rgba(74, 78, 82, 0.60);

  /* Accent colors */
  --lime:   #D0FF00;  /* PRIMARY accent — GMC brand, KPIs, live indicators */
  --silver: #C0C0C0;  /* secondary accent — neutral/structural items */
  --blue:   #4f8ef7;  /* information, monitors, data views */
  --purple: #7c5cfc;  /* actions, interactive, analytics */
  --green:  #22c55e;  /* positive, live status, gains */
  --yellow: #f59e0b;  /* file/static items, caution */
  --red:    #ef4444;  /* danger, losses, alerts */

  /* Text */
  --text:   #E2E8F0;  /* primary body text */
  --muted:  #4A4E52;  /* disabled / placeholder */
  --muted2: #94A3B8;  /* secondary text, captions */
}
```

**Real Estate Monitor** uses a slightly different surface palette (pt-BR context):
```css
--bg:      #0f1117;
--surface: #1a1d27;
--surface2: #222635;
--border:  #2e3347;
```
The accent and text tokens remain identical.

---

## Typography

### Fonts (Google Fonts)

```html
<!-- Import in <head> -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Cormorant+Garamond:wght@400;600&display=swap" rel="stylesheet">
```

| Usage | Font | Weight |
|---|---|---|
| Body / UI | DM Sans | 400, 500, 600, 700 |
| Display titles (H1) | Cormorant Garamond | 600 |
| Monospace (code, data) | system monospace | — |

### Type Scale

| Element | Size | Weight | Style |
|---|---|---|---|
| Page title (H1) | 38px | 600 | Cormorant Garamond, silver gradient |
| Section label | 10px | 700 | uppercase, letter-spacing 0.15em |
| Card title (H3) | 16px | 700 | white |
| Card description | 12px | 400 | var(--muted2) |
| Badge / tag | 9–11px | 700 | uppercase, letter-spacing 0.12em |
| Body | 14px | 400 | var(--text) |
| Caption / footer | 12px | 400 | var(--muted) |

### GMC Wordmark Style

```css
/* Used in Launcher header */
.gmc-logo {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--muted);
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 4px 12px;
}
```

### Display Title Gradient

```css
/* Silver gradient for main H1 titles */
h1 {
  font-family: 'Cormorant Garamond', Georgia, serif;
  background: linear-gradient(135deg, #C0C0C0 0%, #FFFFFF 45%, #C0C0C0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

---

## Background Grid Pattern

Applied via `body::before` on all pages:

```css
body::before {
  content: '';
  position: fixed;
  inset: 0;
  background-image:
    linear-gradient(rgba(74, 78, 82, 0.07) 1px, transparent 1px),
    linear-gradient(90deg, rgba(74, 78, 82, 0.07) 1px, transparent 1px);
  background-size: 40px 40px;
  pointer-events: none;
  z-index: 0;
}
```

All page content wraps with `position: relative; z-index: 1;`.

---

## Card Component

### Base Structure

```html
<a class="card card-{accent}" href="...">
  <div class="card-icon">📊</div>
  <!-- or inline icon+meta row -->
  <h3>Card Title</h3>
  <p>Description text.</p>
  <div class="card-footer">
    <span class="card-action">Action label</span>
    <span class="card-arrow">→</span>
  </div>
</a>
```

### Accent Variants

| Class | Accent | Background on hover |
|---|---|---|
| `card-lime` | `--lime` | `rgba(208,255,0,0.06)` |
| `card-silver` | `--silver` | `rgba(192,192,192,0.06)` |
| `card-blue` | `--blue` | `rgba(79,142,247,0.07)` |
| `card-purple` | `--purple` | `rgba(124,92,252,0.07)` |
| `card-green` | `--green` | `rgba(34,197,94,0.07)` |
| `card-yellow` | `--yellow` | `rgba(245,158,11,0.07)` |

Card top-border glow uses `::before` pseudo with `opacity: 0` → `1` on hover.

### Status Dots

```html
<span class="status-dot status-live"></span>    <!-- green pulse → running -->
<span class="status-dot status-static"></span>  <!-- blue solid → static HTML -->
<span class="status-dot status-file"></span>    <!-- yellow solid → file -->
```

---

## Grid Layout

```css
.grid   { display: grid; gap: 16px; margin-bottom: 40px; }
.grid-2 { grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); }
.grid-3 { grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); }
```

CSV/file item grid (smaller tiles):
```css
.csv-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 8px;
}
```

---

## Section Labels

```html
<div class="section-label">Section Name</div>
```

```css
.section-label {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--muted);
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 10px;
}
.section-label::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--border);
}
```

---

## Live Date Badge

```html
<div class="date-badge">
  <span class="dot"></span>
  <span id="livedate">Loading…</span>
</div>
```

```css
.date-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(208,255,0,0.07);
  border: 1px solid rgba(208,255,0,0.2);
  border-radius: 20px;
  padding: 5px 14px;
  font-size: 12px;
  color: var(--lime);
}
.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--lime);
  animation: pulse 2s infinite;
}
@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
```

---

## Number Formatting Conventions

| Type | Format | Example |
|---|---|---|
| BRL currency | `R$ 1.234,56` | R$ 2.450.000,00 |
| USD currency | `USD 1,234.56` | USD 485,230.00 |
| Percentage | `42.3%` | 47.8% |
| Date (UI) | `DD/MM/YYYY` | 07/04/2026 |
| Date (CSV) | `YYYY-MM-DD` | 2026-04-07 |

---

## Motion

Transitions on interactive elements:
```css
transition: border-color 0.2s, background 0.2s, transform 0.18s, box-shadow 0.2s;
```

Card hover lift:
```css
.card:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 32px rgba(0,0,0,0.5);
}
```

Arrow nudge:
```css
.card:hover .card-arrow { transform: translateX(4px); }
```

---

## Accent Color Assignment by Module

| Module | Primary accent |
|---|---|
| Portfolio Dashboard (main) | lime |
| Real Estate Monitor | blue |
| Excel (Portfolio) | green |
| Excel (Real Estate) | lime |
| Excel (Advanced KPIs) | blue |
| Built/Static Dashboard | silver |
| Quick actions | lime, purple, blue |
