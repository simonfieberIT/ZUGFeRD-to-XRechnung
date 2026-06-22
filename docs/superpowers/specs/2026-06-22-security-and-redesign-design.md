# Security Fixes & Visual Redesign

**Date:** 2026-06-22
**Status:** Approved

## Goal

Fix two confirmed security/GDPR findings from the security review, then redesign the visual presentation to move away from the generic ChatGPT dark-mode aesthetic — replacing it with a distinctive Indigo-accented design that supports both light and dark mode via `prefers-color-scheme`.

---

## Part 1 — Security & GDPR Fixes

### Finding 1: Google AdSense removed

`index.html:17-18` — the AdSense script block is deleted entirely.

**Why:** Google Ads rejected the account, so the script loads but shows no ads. It still transmits visitor data (IP, fingerprint, tracking cookies) to Google on every page load. The page claims "Keine Datenübertragung" — this is a direct GDPR contradiction. Removing the script makes the privacy claim fully accurate with zero trade-off.

### Finding 2: JS scope isolation via ES Module

`index.html` — `<script defer src="script.js">` changes to `<script type="module" src="script.js">`.

No changes inside `script.js`. ES modules are automatically scoped — `currentXmlDoc`, `selectedFile`, `leitwegInput`, `supplierIdInput`, `buyerEmailInput` and all other processing state move off `window` and become inaccessible to any future third-party scripts.

### Privacy copy

The existing "Keine Datenübertragung" badge and description text remain. With AdSense gone, the claim is now 100% accurate.

---

## Part 2 — Visual Redesign

### Design Direction

**Dark + Indigo with `prefers-color-scheme` support.** Both modes use the same Indigo accent (`#6366f1`). The light mode uses white card surfaces on a light-gray background; the dark mode uses near-black with subtle white-alpha surfaces.

No external fonts are loaded. `system-ui` stays.

### Color Tokens

Defined as CSS custom properties in `:root` and overridden in `@media (prefers-color-scheme: light)`:

| Token | Dark value | Light value |
|---|---|---|
| `--bg` | `#0c1220` | `#f1f5f9` |
| `--surface` | `rgba(255,255,255,0.04)` | `#ffffff` |
| `--border` | `rgba(255,255,255,0.09)` | `#e2e8f0` |
| `--text` | `#f1f5f9` | `#0f172a` |
| `--text-muted` | `#64748b` | `#94a3b8` |
| `--accent` | `#6366f1` | `#6366f1` |
| `--accent-2` | `#8b5cf6` | `#8b5cf6` |
| `--accent-gradient` | `linear-gradient(135deg, #6366f1, #8b5cf6)` | same |

`backdrop-filter` is removed — it was used in the old glassmorphism style and is slow on low-end devices.

Card `border-radius: 12px`. Light mode cards get a subtle `box-shadow: 0 1px 4px rgba(0,0,0,0.06)`.

### Layout

Single-column, centered, `max-width: 520px`. The previous two-column grid is removed.

```
┌─────────────────────────────────────┐
│  🔒 Badge  │  Titel + Beschreibung  │
├─────────────────────────────────────┤
│  Schritt 1: PDF hochladen           │
│  ┌ ─ ─ Dropzone ─ ─ ─ ─ ─ ─ ─ ─ ┐ │
│  └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘ │
│  Dateiname                          │
├─────────────────────────────────────┤
│  Schritt 2: Angaben (konditionell)  │
│  [ Käufer E-Mail * ]                │
│  [ Leitweg-ID      ]                │
│  [ Lieferantennr.  ]                │
├─────────────────────────────────────┤
│  [ In XRechnung umwandeln → ]       │
│  Status-Pill                        │
│  Ko-Fi Card (nach Erfolg)           │
├─────────────────────────────────────┤
│  FAQ/Info (aufklappbar)             │
├─────────────────────────────────────┤
│  Footer: Version · Impressum · DSE  │
└─────────────────────────────────────┘
```

### Step Indicators

Schritt 1 and Schritt 2 each have a numbered circle indicator (`1` / `2`). Schritt 2's container is visually muted (lower opacity, dimmer border) until the PDF analysis completes and the fields are needed. This matches the existing JS logic (`extraFields.style.display = "block"` after analysis).

### Ko-Fi Integration

After a successful download, a card appears with a short motivating text ("Hat geklappt? Kaffee gefällig?") and the Ko-Fi button. More prominent than the current subtle footer banner. The existing `kofi-pulse` animation is kept.

### FAQ Section

Remains collapsible toggle — SEO value, no reason to remove.

---

## Files Changed

| File | Change |
|---|---|
| `index.html` | Remove AdSense script; change `script` tag to `type="module"`; update layout structure to single-column with step indicators |
| `styles.css` | Full rewrite using CSS custom properties for theming; remove glassmorphism/backdrop-filter; new single-column layout; step indicator styles; light/dark mode via `prefers-color-scheme` |
| `script.js` | No changes required — ES module conversion is handled by the HTML attribute only |
| `.gitignore` | `.superpowers/` already added |

---

## Out of Scope

- Ad network replacement (deferred — traffic not sufficient yet)
- Backend / server component
- Any changes to the XML conversion logic
