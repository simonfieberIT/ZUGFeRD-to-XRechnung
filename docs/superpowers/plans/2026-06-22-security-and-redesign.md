# Security Fixes & Visual Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers-extended-cc:subagent-driven-development (recommended) or superpowers-extended-cc:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the AdSense GDPR violation, fix global JS scope exposure, and redesign the UI with a distinctive Dark+Indigo style supporting light/dark mode via `prefers-color-scheme`.

**Architecture:** Purely static client-side — `index.html`, `styles.css`, `script.js`. No build toolchain, no package manager, no server. ES module conversion is done via a single HTML attribute change; all XML conversion logic in `script.js` is untouched. `pako.min.js` stays as-is (sets `window.pako` — modules can still read from `window`, so no conflict).

**Tech Stack:** Vanilla HTML5, CSS custom properties, ES module, `prefers-color-scheme` media query.

**User decisions (already made):**
- "Remove Google Ads entirely — account was rejected anyway, script still sends data to Google."
- "ES module via `type='module'` attribute on the script tag only — no code changes in script.js for that."
- "Design direction B: Dark + Indigo (`#6366f1`/`#8b5cf6`), with light mode support via `prefers-color-scheme`."
- "Single-column, step-based layout. Step 2 is visually locked until PDF analysis completes."
- "Ko-Fi support card to be more prominent after successful conversion."
- "system-ui font — no external font loading."

---

## File Map

| File | Change |
|---|---|
| `index.html` | Task 0: remove AdSense + `type="module"`; Task 2: restructure `<main>` to single-column form with step sections |
| `styles.css` | Task 1: full rewrite — CSS tokens, light/dark mode, single-column layout, step indicators |
| `script.js` | Task 3: add `step2` DOM ref + 3 class-toggle calls for step-locked state |

`pako.min.js`, `robots.txt`, `sitemap.xml` — unchanged.

---

### Task 0: Security Fixes

**Goal:** Remove the AdSense script block and convert `script.js` to an ES module, eliminating the GDPR data leak and `window` scope exposure.

**Files:**
- Modify: `index.html` (lines 17–18 and 286)

**Acceptance Criteria:**
- [ ] `index.html` contains no reference to `pagead2.googlesyndication.com` or `adsbygoogle`
- [ ] The `script.js` script tag has `type="module"` and no `defer` attribute
- [ ] Opening the page in browser: DevTools → Network shows zero requests to `*.googlesyndication.com`
- [ ] DevTools → Console: `window.currentXmlDoc` returns `undefined` (confirms module scope)
- [ ] Tool still converts a ZUGFeRD PDF successfully end-to-end

**Verify:** Open page. DevTools → Network: no googlesyndication requests. Console: `window.currentXmlDoc` → `undefined`. Upload ZUGFeRD PDF → conversion succeeds.

**Steps:**

- [ ] **Step 1: Remove AdSense script block**

Delete these two lines from `index.html` (currently lines 17–18):
```html
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7588206782628183"
    crossorigin="anonymous"></script>
```

- [ ] **Step 2: Convert script tag to ES module**

Find the script tag at the bottom of `index.html` (currently line 286):
```html
  <script src="script.js" defer></script>
```
Replace with:
```html
  <script type="module" src="script.js"></script>
```
`type="module"` implies defer — no separate attribute needed. `pako.min.js` (the line above) keeps its `defer` and still runs first since it appears earlier in document order.

- [ ] **Step 3: Verify scope isolation**

Open `index.html` in browser (file:// or local server). Upload a ZUGFeRD PDF, click convert.
In DevTools Console during the 5-second countdown, run:
```js
window.currentXmlDoc  // expected: undefined
window.selectedFile   // expected: undefined
```
Both must return `undefined`. The conversion download should still succeed.

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "security: remove AdSense script and convert to ES module"
```

---

### Task 1: CSS Design System Rewrite

**Goal:** Replace `styles.css` entirely with a token-based system supporting Dark+Indigo (default) and light mode via `prefers-color-scheme`.

**Files:**
- Modify: `styles.css`

**Acceptance Criteria:**
- [ ] `:root` defines all design tokens as CSS custom properties
- [ ] `@media (prefers-color-scheme: light)` block overrides background, surface, border, text, and accent-bg tokens
- [ ] No `backdrop-filter` anywhere in the file
- [ ] No hardcoded color values outside of `:root` and the light-mode override block (all colors use `var(--*)`)
- [ ] Page renders correctly in both modes (test via DevTools → Rendering → Emulate CSS media feature `prefers-color-scheme`)
- [ ] Dark mode: deep navy background, indigo-accented elements, white-alpha card surfaces
- [ ] Light mode: `#f1f5f9` background, white card surfaces, same indigo accent

**Verify:** DevTools → Rendering → toggle `prefers-color-scheme` between dark and light. Confirm visual switch.

**Steps:**

- [ ] **Step 1: Replace styles.css entirely**

Overwrite `styles.css` with the following content:

```css
/* === Design Tokens === */
:root {
  --bg: #0c1220;
  --bg-gradient: linear-gradient(160deg, #0c1220 0%, #0f172a 100%);
  --surface: rgba(255, 255, 255, 0.04);
  --surface-hover: rgba(255, 255, 255, 0.07);
  --border: rgba(255, 255, 255, 0.09);
  --border-accent: rgba(99, 102, 241, 0.4);
  --text: #f1f5f9;
  --text-muted: #64748b;
  --text-subtle: #475569;
  --accent: #6366f1;
  --accent-2: #8b5cf6;
  --accent-gradient: linear-gradient(135deg, #6366f1, #8b5cf6);
  --accent-bg: rgba(99, 102, 241, 0.08);
  --accent-bg-badge: rgba(99, 102, 241, 0.15);
  --accent-border-badge: rgba(99, 102, 241, 0.35);
  --accent-text-badge: #a5b4fc;
  --radius: 12px;
  --radius-sm: 8px;
  --radius-pill: 999px;
  --shadow: none;
}

@media (prefers-color-scheme: light) {
  :root {
    --bg: #f1f5f9;
    --bg-gradient: linear-gradient(160deg, #f8f9ff 0%, #f1f5f9 100%);
    --surface: #ffffff;
    --surface-hover: #f8fafc;
    --border: #e2e8f0;
    --border-accent: #c7d2fe;
    --text: #0f172a;
    --text-muted: #94a3b8;
    --text-subtle: #64748b;
    --accent-bg: #eef2ff;
    --accent-bg-badge: #ede9fe;
    --accent-border-badge: #ddd6fe;
    --accent-text-badge: #5b21b6;
    --shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  }
}

/* === Reset === */
*, *::before, *::after { box-sizing: border-box; }

/* === Base === */
body {
  margin: 0;
  padding: 24px 16px;
  min-height: 100vh;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  background: var(--bg-gradient);
  background-attachment: fixed;
  color: var(--text);
  display: flex;
  align-items: flex-start;
  justify-content: center;
}

.app {
  width: 100%;
  max-width: 520px;
  padding-top: 16px;
  padding-bottom: 32px;
}

/* === Header === */
.app-header {
  margin-bottom: 20px;
}

.badge {
  display: inline-block;
  font-size: 0.72rem;
  background: var(--accent-bg-badge);
  color: var(--accent-text-badge);
  padding: 3px 12px;
  border-radius: var(--radius-pill);
  border: 1px solid var(--accent-border-badge);
  margin-bottom: 8px;
}

.app-title {
  font-size: 1.2rem;
  font-weight: 700;
  margin: 0 0 4px;
  color: var(--text);
}

.app-description {
  font-size: 0.83rem;
  color: var(--text-muted);
  margin: 0;
  line-height: 1.5;
}

/* === Steps === */
.step {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 16px;
  margin-bottom: 10px;
  box-shadow: var(--shadow);
  transition: border-color 0.2s ease, opacity 0.25s ease;
}

.step-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.step-number {
  width: 22px;
  height: 22px;
  background: var(--accent-gradient);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.72rem;
  font-weight: 700;
  color: #fff;
  flex-shrink: 0;
}

.step-title {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--text);
}

.step-locked {
  opacity: 0.4;
  pointer-events: none;
}

.step-locked .step-number {
  background: var(--border);
}

/* === Dropzone === */
.dropzone {
  display: block;
  border: 1.5px dashed var(--border-accent);
  border-radius: var(--radius-sm);
  padding: 20px;
  text-align: center;
  cursor: pointer;
  background: var(--accent-bg);
  transition: border-color 0.15s ease, background 0.15s ease;
  margin-top: 0;
  margin-bottom: 10px;
}

.dropzone:hover,
.dropzone.dragover {
  border-color: var(--accent);
  background: rgba(99, 102, 241, 0.14);
}

.dropzone input[type="file"] { display: none; }

.dropzone-icon { font-size: 1.8rem; margin-bottom: 6px; }

.dropzone-text-main {
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--text);
}

.dropzone-text-sub {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-top: 2px;
}

.file-info {
  font-size: 0.75rem;
  color: var(--text-subtle);
  display: flex;
  gap: 4px;
}

#file-name { color: var(--text-muted); }

/* === Form === */
.form-grid { margin: 0; }

.form-section { margin-bottom: 12px; }

.form-section-title {
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--text-subtle);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 8px;
}

.form-row { margin-bottom: 8px; }

.form-row label {
  display: block;
  font-size: 0.78rem;
  color: var(--text-muted);
  margin-bottom: 4px;
}

.form-row input {
  width: 100%;
  background: var(--surface-hover);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 7px 10px;
  font-size: 0.82rem;
  color: var(--text);
  font-family: inherit;
  transition: border-color 0.15s ease;
  outline: none;
}

.form-row input:focus {
  border-color: var(--accent);
}

/* === Button === */
.button-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 14px;
  margin-bottom: 10px;
}

.button-row.compact { margin-top: 0; }

button[type="submit"] {
  width: 100%;
  background: var(--accent-gradient);
  color: #fff;
  border: none;
  border-radius: var(--radius-sm);
  padding: 10px 16px;
  font-size: 0.88rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: opacity 0.15s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

button[type="submit"]:hover { opacity: 0.88; }

/* === Status Pill === */
.status-pill {
  font-size: 0.8rem;
  color: var(--text-muted);
  padding: 6px 0;
  min-height: 28px;
}

.status-pill.warn { color: #f87171; }
.status-pill.ok   { color: #34d399; }

/* === Support / Ko-Fi Card === */
.support-container {
  margin-top: 14px;
  background: var(--surface);
  border: 1px solid var(--border-accent);
  border-radius: var(--radius);
  padding: 14px 16px;
  box-shadow: var(--shadow);
}

.support-hint {
  font-size: 0.83rem;
  color: var(--text-muted);
  margin: 0 0 10px;
  line-height: 1.5;
}

.kofi-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: var(--accent-gradient);
  color: #fff !important;
  text-decoration: none !important;
  padding: 8px 16px;
  border-radius: var(--radius-sm);
  font-size: 0.85rem;
  font-weight: 600;
  transition: opacity 0.15s ease;
}

.kofi-btn:hover { opacity: 0.88; }

@keyframes kofi-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.5); }
  50%       { box-shadow: 0 0 0 7px rgba(99, 102, 241, 0); }
}

.kofi-pulse { animation: kofi-pulse 1.8s ease-in-out 3; }

/* === Subtle Footer Banner (post-conversion secondary hint) === */
.subtle-footer-banner {
  margin-top: 10px;
  font-size: 0.77rem;
  color: var(--text-subtle);
  text-align: center;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  justify-content: center;
  align-items: center;
}

.subtle-kofi-link {
  color: var(--accent-text-badge);
  text-decoration: none;
}

.subtle-kofi-link:hover { text-decoration: underline; }

/* === Info / FAQ Section === */
.info-section {
  margin-top: 16px;
  padding: 14px 16px;
  border-radius: var(--radius);
  background: var(--surface);
  border: 1px solid var(--border);
  font-size: 0.84rem;
  line-height: 1.55;
  box-shadow: var(--shadow);
}

.info-section h2 {
  font-size: 0.95rem;
  margin-top: 16px;
  margin-bottom: 6px;
  color: var(--text);
}

.info-section p {
  color: var(--text-muted);
  margin: 0 0 4px;
}

.info-toggle {
  margin-bottom: 4px;
  padding: 5px 12px;
  border-radius: var(--radius-pill);
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text-muted);
  font-size: 0.8rem;
  font-family: inherit;
  cursor: pointer;
  transition: border-color 0.15s ease, color 0.15s ease;
}

.info-toggle:hover {
  border-color: var(--accent);
  color: var(--text);
}

.faq-item { margin-top: 10px; color: var(--text-muted); }
.faq-item strong { display: block; margin-bottom: 2px; color: var(--text); }

.howto-steps {
  margin: 10px 0 8px;
  padding-left: 20px;
  line-height: 1.55;
  color: var(--text-muted);
}

.howto-steps li { margin-bottom: 6px; }
.howto-steps strong { color: var(--text); }

.seo-list {
  margin: 8px 0 4px;
  padding-left: 18px;
  color: var(--text-muted);
}

.faq-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 10px;
  margin-top: 8px;
}

.faq-grid .faq-item { margin-top: 0; }

.seo-divider {
  height: 1px;
  background: var(--border);
  margin: 12px 0;
}

/* === Share Links === */
.share-links {
  margin-top: 10px;
  font-size: 0.78rem;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
  color: var(--text-subtle);
}

.share-links a { color: var(--accent-text-badge); text-decoration: none; }
.share-links a:hover { text-decoration: underline; }
.share-separator { opacity: 0.6; }

/* === Footer === */
.app-footer {
  margin-top: 16px;
  padding-top: 10px;
  border-top: 1px solid var(--border);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  font-size: 0.78rem;
  color: var(--text-subtle);
}

.footer-left  { display: flex; align-items: center; gap: 6px; }
.footer-right { display: flex; align-items: center; gap: 6px; }

.footer-version {
  color: var(--text-subtle);
  text-decoration: none;
  white-space: nowrap;
}
.footer-version:hover { text-decoration: underline; }

.footer-separator { opacity: 0.6; }

.app-footer a { color: var(--accent-text-badge); text-decoration: none; }
.app-footer a:hover { text-decoration: underline; }

/* === Responsive === */
@media (max-width: 560px) {
  body { padding: 16px 10px; }
}
```

- [ ] **Step 2: Verify tokens and both modes**

Open `index.html` in browser. DevTools → Rendering → Emulate CSS media feature `prefers-color-scheme`:
- **dark**: Background `#0c1220` to `#0f172a`, indigo step numbers and borders
- **light**: Background `#f8f9ff` to `#f1f5f9`, white cards with subtle shadows

Run `grep -n "backdrop-filter" styles.css` → must return no output.

- [ ] **Step 3: Commit**

```bash
git add styles.css
git commit -m "design: rewrite CSS with token system and light/dark mode support"
```

---

### Task 2: HTML Layout Restructure

**Goal:** Replace the two-column grid with a single-column form wrapping two step sections, and update the Ko-Fi hint text.

**Files:**
- Modify: `index.html` (the `<main>` block, approximately lines 99–180)

**Acceptance Criteria:**
- [ ] No `.app-main` or `grid-template-columns` in `index.html`
- [ ] `<form id="upload-form">` wraps both step sections and the button/status/support area
- [ ] `#step-1` contains the dropzone and `#file-input` / `#file-name`
- [ ] `#step-2` has class `step-locked` and contains `#xrechnung-fields` with all three inputs
- [ ] All existing IDs present: `file-input`, `file-name`, `buyer-email`, `leitweg`, `supplier-id`, `upload-form`, `xrechnung-fields`, `status`, `support-container`, `support-hint`
- [ ] `#support-hint` text begins with "Hat geklappt?"

**Verify:**
```bash
grep -c 'app-main\|grid-template' index.html
# expected: 0

grep -n 'id="file-input"\|id="file-name"\|id="buyer-email"\|id="leitweg"\|id="supplier-id"\|id="upload-form"\|id="xrechnung-fields"\|id="status"\|id="support-container"\|id="support-hint"' index.html
# expected: 10 lines, one per ID
```

**Steps:**

- [ ] **Step 1: Replace the `<main>` block**

Find and replace the entire `<main class="app-main">...</main>` section in `index.html` (currently contains two `<section class="card">` elements) with:

```html
    <form id="upload-form">
      <!-- Schritt 1: PDF auswählen -->
      <section class="step" id="step-1">
        <div class="step-header">
          <span class="step-number">1</span>
          <span class="step-title">PDF auswählen</span>
        </div>

        <label class="dropzone">
          <div class="dropzone-icon">📄</div>
          <div class="dropzone-text-main">Datei hierhin ziehen oder klicken</div>
          <div class="dropzone-text-sub">Unterstützt: PDF mit eingebetteter XML</div>
          <input id="file-input" type="file" accept="application/pdf" />
        </label>

        <div class="file-info">
          <span>Ausgewählte Datei:</span>
          <span id="file-name">Noch keine Datei ausgewählt</span>
        </div>
      </section>

      <!-- Schritt 2: Angaben ergänzen (locked until PDF analysis) -->
      <section class="step step-locked" id="step-2">
        <div class="step-header">
          <span class="step-number">2</span>
          <span class="step-title">Angaben ergänzen</span>
        </div>

        <div id="xrechnung-fields">
          <div class="form-section">
            <div class="form-section-title">Pflichtfeld für die XRechnung</div>
            <div class="form-row">
              <label for="buyer-email">Käufer E-Mail (elektronische Adresse)</label>
              <input id="buyer-email" type="email" placeholder="z. B. rechnung@kunde.de" />
            </div>
          </div>

          <div class="form-section">
            <div class="form-section-title">Optionale Angaben</div>
            <div class="form-row">
              <label for="leitweg">Leitweg-ID (BuyerReference)</label>
              <input id="leitweg" type="text" placeholder="z. B. 12345-67890-12345-67" />
            </div>
            <div class="form-row">
              <label for="supplier-id">Lieferantennummer beim Kunden</label>
              <input id="supplier-id" type="text" placeholder="Kundennummer beim Rechnungsempfänger" />
            </div>
          </div>
        </div>
      </section>

      <!-- Konvertierung -->
      <div class="button-row">
        <button type="submit">
          <span>In XRechnung umwandeln</span>
        </button>
      </div>

      <div>
        <div id="status" class="status-pill">
          Bereit für Upload
        </div>
      </div>

      <div id="support-container" class="support-container" hidden>
        <p id="support-hint" class="support-hint" hidden>
          Hat geklappt? Kaffee gefällig! ☕<br/>
          Mit deiner Unterstützung halte ich das Tool kostenlos, aktuell und weiterentwickelt.
        </p>
        <a
          href="https://ko-fi.com/C0C31OT01F"
          target="_blank"
          rel="noopener noreferrer"
          class="kofi-btn"
          aria-label="Projekt auf Ko‑Fi unterstützen"
          title="Projekt auf Ko‑Fi unterstützen"
        >☕ Kaffee ausgeben</a>
      </div>
    </form>
```

- [ ] **Step 2: Run verification commands**

```bash
grep -c 'app-main\|grid-template' index.html
# expected output: 0

grep -n 'id="file-input"\|id="file-name"\|id="buyer-email"\|id="leitweg"\|id="supplier-id"\|id="upload-form"\|id="xrechnung-fields"\|id="status"\|id="support-container"\|id="support-hint"' index.html
# expected: 10 matches
```

- [ ] **Step 3: Visual check in browser**

Open `index.html`. Confirm:
- Single centered column visible
- Step 1 fully visible with dropzone
- Step 2 visible but dimmed (locked state)
- Button below both steps
- No layout errors

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "design: single-column step-based layout"
```

---

### Task 3: JS Step Indicator State + Full End-to-End Test

**Goal:** Wire up the `step-locked` CSS class in `script.js` so step 2 visually unlocks when the analysis requires extra fields, and verify the complete conversion flow works with all changes applied.

**Files:**
- Modify: `script.js`

**Acceptance Criteria:**
- [ ] `step2` DOM reference added near the top of `script.js`
- [ ] `step2.classList.add("step-locked")` called in `resetProcessingState` (where `extraFields.style.display = "none"` is)
- [ ] `step2.classList.remove("step-locked")` called when `upgradeNeeded = true` and fields are shown
- [ ] `step2.classList.add("step-locked")` called in the `isXRechnungAlready` branch where fields are hidden
- [ ] Full ZUGFeRD → XRechnung conversion works: upload PDF → step 2 unlocks → fill fields → convert → download succeeds
- [ ] Selecting a new file after conversion: step 2 re-locks

**Verify:** Upload a ZUGFeRD PDF. After analysis: `document.getElementById('step-2').classList.contains('step-locked')` → `false`. Select new file: same check → `true`.

**Steps:**

- [ ] **Step 1: Add `step2` DOM reference**

After the line `const subtleFooterBanner = document.getElementById("subtle-footer-banner");` (line ~52), add:

```js
const step2 = document.getElementById("step-2");
```

- [ ] **Step 2: Lock step-2 in `resetProcessingState`**

In the `resetProcessingState` function, the line `extraFields.style.display = "none";` appears around line 73. Directly after it add:

```js
  if (step2) step2.classList.add("step-locked");
```

The full block should look like:
```js
  currentXmlDoc = null;
  currentBaseName = null;
  upgradeNeeded = false;
  extraFields.style.display = "none";
  if (step2) step2.classList.add("step-locked");
  leitwegInput.value = "";
```

- [ ] **Step 3: Unlock step-2 when upgrade is needed**

In the form submit handler, find the section that sets `upgradeNeeded = true` and `extraFields.style.display = "block"` (around lines 249–250). The block looks like:

```js
      upgradeNeeded = true;
      extraFields.style.display = "block";
```

Change it to:

```js
      upgradeNeeded = true;
      extraFields.style.display = "block";
      if (step2) step2.classList.remove("step-locked");
```

- [ ] **Step 4: Keep step-2 locked for already-XRechnung PDFs**

In the `isXRechnungAlready` branch, find where `extraFields.style.display = "none"` is set (around line 225). Add after it:

```js
        if (step2) step2.classList.add("step-locked");
```

- [ ] **Step 5: Verify support-hint calls are in place**

```bash
grep -n "supportHint.hidden = false" script.js
```
Expected: 2 matches (one for the already-XRechnung path, one for the upgrade path). If fewer, check both `startDownloadCountdown` callbacks and add `supportHint.hidden = false;` inside each `onFinish` callback if missing.

- [ ] **Step 6: Full end-to-end smoke test**

1. Open `index.html` in browser (local server or file://)
2. Upload a ZUGFeRD/Factur-X PDF that needs upgrade
3. Confirm step 2 section becomes fully visible (no longer dimmed)
4. Fill in Käufer E-Mail if prompted
5. Click "In XRechnung umwandeln"
6. Confirm countdown appears and XML file downloads
7. After download: Ko-Fi card appears with "Hat geklappt?" text
8. Select a new file: step 2 re-locks (dimmed again)
9. DevTools → Network: zero requests to googlesyndication.com throughout

- [ ] **Step 7: Commit**

```bash
git add script.js
git commit -m "design: step indicator state management"
```
