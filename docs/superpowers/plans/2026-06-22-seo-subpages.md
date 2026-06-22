# SEO Subpages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers-extended-cc:subagent-driven-development (recommended) or superpowers-extended-cc:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split rechnungskonverter.de into a clean tool homepage + 3 SEO content subpages, add AI-bot meta/schema/root-files so Google and LLMs discover and cite the tool.

**Architecture:** Static site, no build tooling. New pages = subdirectories with `index.html`. All pages share `styles.css` (root-relative for subpages: `../styles.css`). Footer nav replaces old two-link footer-right on all pages.

**Tech Stack:** Vanilla HTML5, existing `styles.css` (CSS custom properties), Schema.org JSON-LD.

**User decisions (already made):**
- "Option B — 3 Unterseiten: /anleitung/, /faq/, /zugferd-xrechnung/" approved.
- Homepage becomes tool-only; info-section toggle removed entirely.
- og:image PNG is out of scope (needs design tool); meta tag referencing `/og-image.png` added as placeholder.

---

## File Map

| Action | File | Purpose |
|--------|------|---------|
| Modify | `styles.css` | Add `.site-nav`, `.site-nav-sep`, `.footer-updated`, `.comparison-table` |
| Modify | `index.html` | Title, meta, schema, remove info-section, expand description, new footer |
| Create | `anleitung/index.html` | HowTo subpage |
| Create | `faq/index.html` | FAQPage subpage |
| Create | `zugferd-xrechnung/index.html` | Comparison Article subpage |
| Modify | `robots.txt` | Explicitly allow AI bots |
| Modify | `sitemap.xml` | Add 3 new URLs, update lastmod |
| Create | `llms.txt` | Machine-readable context for AI agents |
| Create | `pricing.md` | Machine-readable pricing for AI agents |

---

## Task 0: styles.css — Shared CSS additions

**Goal:** Add CSS for site nav, footer timestamp, and comparison table so all subsequent tasks can use these classes.

**Files:**
- Modify: `styles.css` (append before `/* === Responsive ===*/` block at line 456)

**Acceptance Criteria:**
- [ ] `.site-nav` defined with flex-wrap, gap, font-size
- [ ] `.site-nav-sep` defined with muted color
- [ ] `.footer-updated` defined
- [ ] `.comparison-table` defined with th/td/tr styles

**Verify:** `grep -c "site-nav\|footer-updated\|comparison-table" styles.css` → outputs `6` or more

**Steps:**

- [ ] **Step 1: Add new CSS rules**

Open `styles.css`. Locate the line `/* === Responsive ===*/` (line ~456). Insert the following block directly above it:

```css
/* === Site Navigation === */
.site-nav {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px 8px;
  font-size: 0.78rem;
}
.site-nav a { color: var(--accent-text-badge); text-decoration: none; }
.site-nav a:hover { text-decoration: underline; }
.site-nav-sep { color: var(--text-subtle); opacity: 0.5; user-select: none; }
.footer-updated { color: var(--text-subtle); font-size: 0.78rem; }

/* === Comparison Table === */
.comparison-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.84rem;
  color: var(--text-muted);
  margin: 10px 0;
}
.comparison-table th {
  background: var(--accent-bg);
  color: var(--text);
  padding: 8px 12px;
  text-align: left;
  border-bottom: 1px solid var(--border);
  font-weight: 600;
}
.comparison-table td {
  padding: 7px 12px;
  border-bottom: 1px solid var(--border);
}
.comparison-table tr:last-child td { border-bottom: none; }
```

- [ ] **Step 2: Verify**

```bash
grep -c "site-nav\|footer-updated\|comparison-table" styles.css
```
Expected: `6` or higher.

- [ ] **Step 3: Commit**

```bash
git add styles.css
git commit -m "style: add site-nav, footer-updated, comparison-table CSS"
```

---

## Task 1: index.html — Homepage SEO overhaul

**Goal:** Clean homepage to tool-only, add full SEO meta/schema, expand description, restructure footer with site nav.

**Files:**
- Modify: `index.html`

**Acceptance Criteria:**
- [ ] Title contains "kostenlos, lokal, DSGVO-konform"
- [ ] Twitter card meta present
- [ ] Author meta present
- [ ] `WebApplication` and `Organization` schemas present
- [ ] `FAQPage` and `HowTo` schemas removed
- [ ] `<section class="info-section">` block absent from file
- [ ] `app-description` is ≥ 40 words
- [ ] Footer has `<nav class="site-nav">` with links to all 4 internal pages + Impressum + Datenschutz
- [ ] `<time datetime="2026-06-22">` present

**Verify:** `grep -c "site-nav\|WebApplication\|twitter:card\|kostenlos, lokal" index.html` → `4`

**Steps:**

- [ ] **Step 1: Update title tag**

Find:
```html
  <title>ZUGFeRD / Factur-X nach XRechnung</title>
```
Replace with:
```html
  <title>ZUGFeRD &amp; Factur-X zu XRechnung konvertieren – kostenlos, lokal, DSGVO-konform</title>
```

- [ ] **Step 2: Add Twitter Card + author + og:image meta**

Find:
```html
  <meta property="og:url" content="https://rechnungskonverter.de/" />
```
Replace with:
```html
  <meta property="og:url" content="https://rechnungskonverter.de/" />
  <meta property="og:image" content="https://rechnungskonverter.de/og-image.png" />
  <meta name="author" content="Simon Fieber" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="ZUGFeRD &amp; Factur-X zu XRechnung – kostenlos, lokal, DSGVO-konform" />
  <meta name="twitter:description" content="Browser-Tool: ZUGFeRD / Factur-X PDF zu XRechnung XML. Keine Datenübertragung, kostenlos, DSGVO-konform." />
  <meta name="twitter:image" content="https://rechnungskonverter.de/og-image.png" />
```

- [ ] **Step 3: Replace FAQPage + HowTo schemas with WebApplication + Organization**

Find and remove the entire first `<script type="application/ld+json">` block (FAQPage, lines 17–56) and the entire second `<script type="application/ld+json">` block (HowTo, lines 57–81). Replace both with:

```html
  <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "ZUGFeRD zu XRechnung Konverter",
      "url": "https://rechnungskonverter.de/",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Any (Web Browser)",
      "offers": { "@type": "Offer", "price": "0", "priceCurrency": "EUR" },
      "featureList": "ZUGFeRD 1.x/2.x, Factur-X, keine Registrierung, keine Datenübertragung, DSGVO-konform",
      "inLanguage": "de",
      "author": {
        "@type": "Person",
        "name": "Simon Fieber",
        "url": "https://fieber-it.com"
      }
    }
  </script>
  <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Simon Fieber IT",
      "url": "https://fieber-it.com",
      "sameAs": ["https://github.com/simonfieberIT"]
    }
  </script>
```

- [ ] **Step 4: Expand app-description to dense answer block**

Find:
```html
        <p class="app-description">
          Dieses Tool wandelt ZUGFeRD / Factur‑X PDF‑Rechnungen lokal im Browser in XRechnung um.<br/>
          Keine Registrierung, keine Datenübertragung.
        </p>
```
Replace with:
```html
        <p class="app-description">
          Dieses Tool wandelt ZUGFeRD- und Factur-X-PDF-Rechnungen mit eingebetteter XML direkt im Browser in gültige XRechnung-XML um. Alle Schritte laufen vollständig lokal auf deinem Gerät – keine Dateien werden hochgeladen oder auf Servern gespeichert. Die Nutzung ist kostenlos, DSGVO-konform und erfordert keine Registrierung.
        </p>
```

- [ ] **Step 5: Remove info-section block**

Find and delete the entire `<section class="info-section">` block — from the opening tag down to and including its closing `</section>`. In the current file this spans from:
```html
    <section class="info-section">
      <button
        type="button"
        class="info-toggle"
```
to its matching `</section>` after the `</div>` that closes `seo-content`.

After removal, the `<div id="subtle-footer-banner" ...>` div should follow directly after the closing `</form>` tag.

- [ ] **Step 6: Restructure footer**

Find the entire `<footer class="app-footer">` block:
```html
    <footer class="app-footer">
      <div class="footer-left">
        <a
          href="https://github.com/simonfieberIT/ZUGFeRD-to-XRechnung"
          target="_blank"
          rel="noopener noreferrer"
          class="footer-version"
          aria-label="GitHub-Projekt ZUGFeRD-to-XRechnung (Quellcode auf GitHub)"
          title="Quellcode auf GitHub (öffnet in neuem Tab)"
        >
          v1.0.6
        </a>
      </div>
      <div class="footer-right">
        <a href="https://fieber-it.com/impressum" target="_blank" rel="noopener noreferrer">Impressum</a>
        <span class="footer-separator">·</span>
        <a href="https://fieber-it.com/datenschutz" target="_blank" rel="noopener noreferrer">Datenschutz</a>
      </div>
    </footer>
```
Replace with:
```html
    <footer class="app-footer">
      <div class="footer-left">
        <a
          href="https://github.com/simonfieberIT/ZUGFeRD-to-XRechnung"
          target="_blank"
          rel="noopener noreferrer"
          class="footer-version"
          aria-label="GitHub-Projekt ZUGFeRD-to-XRechnung (Quellcode auf GitHub)"
          title="Quellcode auf GitHub (öffnet in neuem Tab)"
        >v1.0.6</a>
        <span class="footer-separator">·</span>
        <time datetime="2026-06-22" class="footer-updated">Juni 2026</time>
      </div>
      <nav class="site-nav" aria-label="Seitennavigation">
        <a href="/">Konverter</a>
        <span aria-hidden="true" class="site-nav-sep">·</span>
        <a href="/anleitung/">Anleitung</a>
        <span aria-hidden="true" class="site-nav-sep">·</span>
        <a href="/faq/">FAQ</a>
        <span aria-hidden="true" class="site-nav-sep">·</span>
        <a href="/zugferd-xrechnung/">ZUGFeRD &amp; XRechnung</a>
        <span aria-hidden="true" class="site-nav-sep">·</span>
        <a href="https://fieber-it.com/impressum" target="_blank" rel="noopener noreferrer">Impressum</a>
        <span aria-hidden="true" class="site-nav-sep">·</span>
        <a href="https://fieber-it.com/datenschutz" target="_blank" rel="noopener noreferrer">Datenschutz</a>
      </nav>
    </footer>
```

- [ ] **Step 7: Verify**

```bash
grep -c "site-nav\|WebApplication\|twitter:card\|kostenlos, lokal" index.html
```
Expected: `4`

```bash
grep "info-section\|info-toggle\|FAQPage\|HowTo" index.html
```
Expected: no output (all removed).

- [ ] **Step 8: Commit**

```bash
git add index.html
git commit -m "feat: homepage SEO overhaul — meta, schema, nav, clean tool-only layout"
```

---

## Task 2: anleitung/index.html — HowTo subpage

**Goal:** Create the step-by-step guide page at `/anleitung/` with HowTo schema, full content, and site nav footer.

**Files:**
- Create: `anleitung/index.html`

**Acceptance Criteria:**
- [ ] File exists at `anleitung/index.html`
- [ ] `HowTo` schema present with 3 steps
- [ ] Leitweg-ID explanation present
- [ ] Legal reference (E-Rechnungsverordnung) present
- [ ] Footer has `<nav class="site-nav">` with all 6 links
- [ ] `../styles.css` referenced (relative path)

**Verify:** `grep -c "HowTo\|Leitweg\|ERechV\|site-nav" anleitung/index.html` → `4`

**Steps:**

- [ ] **Step 1: Create directory and file**

```bash
mkdir -p anleitung
```

Create `anleitung/index.html` with the following complete content:

```html
<!doctype html>
<html lang="de">
<head>
  <meta charset="utf-8" />
  <title>ZUGFeRD in XRechnung umwandeln – Schritt-für-Schritt Anleitung</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="description" content="Anleitung: ZUGFeRD oder Factur-X PDF in 3 Schritten zu XRechnung XML konvertieren. Kostenlos, lokal im Browser, keine Datenübertragung." />
  <link rel="canonical" href="https://rechnungskonverter.de/anleitung/" />
  <meta name="author" content="Simon Fieber" />
  <meta property="og:title" content="ZUGFeRD in XRechnung umwandeln – Schritt-für-Schritt Anleitung" />
  <meta property="og:description" content="Anleitung: ZUGFeRD oder Factur-X PDF in 3 Schritten zu XRechnung XML konvertieren. Kostenlos, lokal im Browser, keine Datenübertragung." />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://rechnungskonverter.de/anleitung/" />
  <meta property="og:image" content="https://rechnungskonverter.de/og-image.png" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="ZUGFeRD in XRechnung umwandeln – Schritt-für-Schritt" />
  <meta name="twitter:description" content="Anleitung: ZUGFeRD / Factur-X PDF in 3 Schritten zu XRechnung XML. Kostenlos, lokal im Browser." />
  <meta name="twitter:image" content="https://rechnungskonverter.de/og-image.png" />
  <link rel="icon" href="/favicon.ico" sizes="any" />
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
  <link rel="stylesheet" href="../styles.css" />
  <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "HowTo",
      "name": "ZUGFeRD oder Factur-X PDF in XRechnung umwandeln",
      "description": "Schritt-für-Schritt-Anleitung: ZUGFeRD- oder Factur-X-PDF-Rechnung im Browser in eine gültige XRechnung-XML umwandeln, ohne Daten hochzuladen.",
      "step": [
        {
          "@type": "HowToStep",
          "name": "PDF mit ZUGFeRD oder Factur-X auswählen",
          "text": "Öffne rechnungskonverter.de. Ziehe deine ZUGFeRD- oder Factur-X-PDF-Rechnung in das Feld Datei hierhin ziehen oder klicken, oder wähle sie per Dateidialog aus. Der Dateiname erscheint unter Ausgewählte Datei."
        },
        {
          "@type": "HowToStep",
          "name": "PDF analysieren und Angaben ergänzen",
          "text": "Klicke auf In XRechnung umwandeln. Das Tool liest die eingebettete XML aus der PDF. Falls nötig, werden Felder für Käufer-E-Mail, Leitweg-ID und Lieferantennummer freigeschaltet."
        },
        {
          "@type": "HowToStep",
          "name": "XRechnung XML herunterladen",
          "text": "Nach einem kurzen Countdown wird die erzeugte XRechnung-XML automatisch heruntergeladen. Speichere die Datei und übermittle sie im E-Rechnungsportal des Auftraggebers oder importiere sie in deine Buchhaltungssoftware."
        }
      ]
    }
  </script>
</head>
<body>
  <div class="app">
    <header class="app-header">
      <div>
        <div class="badge">
          <span>🔒 Läuft nur auf deinem Gerät, deine Dateien werden nicht hochgeladen.</span>
        </div>
        <h1 class="app-title">ZUGFeRD / Factur-X in XRechnung umwandeln</h1>
        <p class="app-description">
          rechnungskonverter.de wandelt ZUGFeRD- und Factur-X-PDF-Rechnungen mit eingebetteter XML in drei Schritten zu gültiger XRechnung-XML um – vollständig im Browser, ohne Datenübertragung. Das Tool ist kostenlos, erfordert keine Registrierung und läuft auf Desktop und Smartphone.
        </p>
      </div>
    </header>

    <section class="info-section">
      <h2 id="schritt-1">Schritt 1: PDF auswählen</h2>
      <p>
        Öffne <a href="/" class="site-nav">rechnungskonverter.de</a> in einem aktuellen Browser. Ziehe deine ZUGFeRD- oder Factur-X-PDF-Rechnung in das Feld <strong>Datei hierhin ziehen oder klicken</strong>, oder klicke auf das Feld und wähle die Datei über den Dateidialog aus. Der Dateiname erscheint anschließend unter <em>Ausgewählte Datei</em>.
      </p>
      <p>Unterstützte Formate: PDF-Dateien mit eingebetteter XML (ZUGFeRD 1.x, 2.0, 2.1, 2.2; Factur-X alle Profile).</p>

      <h2 id="schritt-2">Schritt 2: PDF analysieren und Angaben ergänzen</h2>
      <p>
        Klicke auf <strong>In XRechnung umwandeln</strong>. Das Tool extrahiert die eingebettete XML aus der PDF und prüft automatisch, ob bereits eine XRechnung-Guideline gesetzt ist.
      </p>
      <p>Falls nötig, werden zusätzliche Felder freigeschaltet:</p>
      <ul class="seo-list">
        <li><strong>Käufer-E-Mail</strong> – Pflichtfeld gemäß EN16931, wenn die E-Mail nicht in der PDF hinterlegt ist.</li>
        <li><strong>Leitweg-ID</strong> – Routing-Kennung öffentlicher Auftraggeber. Besteht aus drei mit Bindestrichen getrennten Blöcken (z.&nbsp;B. <code>12345-67890-12</code>). Wird vom Auftraggeber mitgeteilt. Optional.</li>
        <li><strong>Lieferantennummer</strong> – Kundennummer beim Rechnungsempfänger. Optional.</li>
      </ul>

      <h2 id="schritt-3">Schritt 3: XRechnung herunterladen</h2>
      <p>
        Nach einem kurzen Countdown wird die erzeugte XRechnung-XML automatisch heruntergeladen. Speichere die Datei und übermittle sie im E-Rechnungsportal deines Auftraggebers (z.&nbsp;B. Bundesportal ZRE oder OZG-RE) oder importiere sie in deine Buchhaltungssoftware.
      </p>

      <div class="seo-divider"></div>

      <h2>Rechtsgrundlage</h2>
      <p>
        XRechnung ist seit dem 27.&nbsp;November 2020 Pflichtstandard für elektronische Rechnungen an Bundesbehörden gemäß E-Rechnungsverordnung (§&nbsp;4 ERechV). Für Aufträge auf Landes- und Kommunalebene gelten Übergangszeiträume, die je nach Bundesland variieren.
      </p>
    </section>

    <div style="text-align: center; margin: 20px 0;">
      <a href="/" class="kofi-btn">→ Zum Konverter</a>
    </div>

    <footer class="app-footer">
      <div class="footer-left">
        <a
          href="https://github.com/simonfieberIT/ZUGFeRD-to-XRechnung"
          target="_blank"
          rel="noopener noreferrer"
          class="footer-version"
          aria-label="GitHub-Projekt ZUGFeRD-to-XRechnung"
          title="Quellcode auf GitHub (öffnet in neuem Tab)"
        >v1.0.6</a>
        <span class="footer-separator">·</span>
        <time datetime="2026-06-22" class="footer-updated">Juni 2026</time>
      </div>
      <nav class="site-nav" aria-label="Seitennavigation">
        <a href="/">Konverter</a>
        <span aria-hidden="true" class="site-nav-sep">·</span>
        <a href="/anleitung/" aria-current="page">Anleitung</a>
        <span aria-hidden="true" class="site-nav-sep">·</span>
        <a href="/faq/">FAQ</a>
        <span aria-hidden="true" class="site-nav-sep">·</span>
        <a href="/zugferd-xrechnung/">ZUGFeRD &amp; XRechnung</a>
        <span aria-hidden="true" class="site-nav-sep">·</span>
        <a href="https://fieber-it.com/impressum" target="_blank" rel="noopener noreferrer">Impressum</a>
        <span aria-hidden="true" class="site-nav-sep">·</span>
        <a href="https://fieber-it.com/datenschutz" target="_blank" rel="noopener noreferrer">Datenschutz</a>
      </nav>
    </footer>
  </div>
</body>
</html>
```

- [ ] **Step 2: Verify**

```bash
grep -c "HowTo\|Leitweg\|ERechV\|site-nav" anleitung/index.html
```
Expected: `4`

- [ ] **Step 3: Commit**

```bash
git add anleitung/index.html
git commit -m "feat: add /anleitung/ HowTo subpage"
```

---

## Task 3: faq/index.html — FAQ subpage

**Goal:** Create the FAQ page at `/faq/` with FAQPage schema and 8 complete Q&As.

**Files:**
- Create: `faq/index.html`

**Acceptance Criteria:**
- [ ] File exists at `faq/index.html`
- [ ] `FAQPage` schema present with ≥ 7 questions
- [ ] All 8 questions answered with ≥ 1 complete sentence each
- [ ] Footer has `<nav class="site-nav">` with all 6 links
- [ ] `../styles.css` referenced

**Verify:** `grep -c "Question\|site-nav\|FAQPage" faq/index.html` → `12` or more

**Steps:**

- [ ] **Step 1: Create directory and file**

```bash
mkdir -p faq
```

Create `faq/index.html` with the following complete content:

```html
<!doctype html>
<html lang="de">
<head>
  <meta charset="utf-8" />
  <title>Häufige Fragen zum ZUGFeRD / XRechnung Konverter – rechnungskonverter.de</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="description" content="Antworten auf häufige Fragen zu rechnungskonverter.de: DSGVO, Kosten, unterstützte Formate, Leitweg-ID und mehr." />
  <link rel="canonical" href="https://rechnungskonverter.de/faq/" />
  <meta name="author" content="Simon Fieber" />
  <meta property="og:title" content="Häufige Fragen – ZUGFeRD / XRechnung Konverter" />
  <meta property="og:description" content="Antworten auf häufige Fragen zu rechnungskonverter.de: DSGVO, Kosten, unterstützte Formate, Leitweg-ID und mehr." />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://rechnungskonverter.de/faq/" />
  <meta property="og:image" content="https://rechnungskonverter.de/og-image.png" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="Häufige Fragen – ZUGFeRD / XRechnung Konverter" />
  <meta name="twitter:description" content="DSGVO, Kosten, unterstützte Formate, Leitweg-ID: alle Fragen zu rechnungskonverter.de beantwortet." />
  <meta name="twitter:image" content="https://rechnungskonverter.de/og-image.png" />
  <link rel="icon" href="/favicon.ico" sizes="any" />
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
  <link rel="stylesheet" href="../styles.css" />
  <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Werden meine Dateien hochgeladen oder gespeichert?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Nein. Der gesamte Vorgang läuft lokal im Browser auf deinem Gerät. Die PDF-Datei verlässt zu keinem Zeitpunkt deinen Rechner. Es findet keine Datenübertragung an externe Server statt."
          }
        },
        {
          "@type": "Question",
          "name": "Ist die Nutzung kostenlos?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Ja, das Tool ist vollständig kostenlos. Es gibt keine Registrierung, keine Abonnements und keine versteckten Kosten. Wenn dir das Tool hilft, kannst du das Projekt freiwillig über Ko-Fi unterstützen."
          }
        },
        {
          "@type": "Question",
          "name": "Welche ZUGFeRD- und Factur-X-Versionen werden unterstützt?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Das Tool unterstützt ZUGFeRD 1.0, ZUGFeRD 2.0, ZUGFeRD 2.1, ZUGFeRD 2.2 sowie Factur-X in allen Profilen (MINIMUM, BASIC WL, BASIC, EN16931, EXTENDED). Voraussetzung ist eine PDF mit eingebetteter XML-Rechnung."
          }
        },
        {
          "@type": "Question",
          "name": "Kann ich die erzeugte XRechnung an Behörden senden?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Ja. Die erzeugte XML entspricht dem XRechnung-Standard EN16931 und kann bei öffentlichen Auftraggebern über deren E-Rechnungsportale eingereicht werden, zum Beispiel über das Bundesportal ZRE oder OZG-RE."
          }
        },
        {
          "@type": "Question",
          "name": "Was ist die Leitweg-ID und woher bekomme ich sie?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Die Leitweg-ID ist eine Routing-Kennung, die öffentliche Auftraggeber verwenden, um Rechnungen intern zuzuordnen. Sie wird vom Auftraggeber mitgeteilt und besteht aus drei mit Bindestrichen getrennten Blöcken (z. B. 12345-67890-12). Das Tool fragt sie optional ab."
          }
        },
        {
          "@type": "Question",
          "name": "Was passiert, wenn meine PDF keine XRechnung-Guideline enthält?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Das Tool analysiert die eingebettete XML und erkennt automatisch, ob die Guideline bereits auf XRechnung gesetzt ist. Fehlt die Guideline, schaltet das Tool Eingabefelder frei, über die du Leitweg-ID, Lieferantennummer und Käufer-E-Mail ergänzen kannst."
          }
        },
        {
          "@type": "Question",
          "name": "Funktioniert der Konverter auch auf dem Smartphone?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Ja. Der Konverter läuft auf allen aktuellen Browsern auf Desktop, Tablet und Smartphone. Es wird keine App benötigt."
          }
        },
        {
          "@type": "Question",
          "name": "Ist der Quellcode öffentlich?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Ja. Der Quellcode ist Open Source und auf GitHub verfügbar unter github.com/simonfieberIT/ZUGFeRD-to-XRechnung. Contributions und Bug Reports sind willkommen."
          }
        }
      ]
    }
  </script>
</head>
<body>
  <div class="app">
    <header class="app-header">
      <div>
        <h1 class="app-title">Häufige Fragen</h1>
        <p class="app-description">
          Antworten auf die häufigsten Fragen zu rechnungskonverter.de – dem kostenlosen, DSGVO-konformen Browser-Tool zur Konvertierung von ZUGFeRD und Factur-X nach XRechnung.
        </p>
      </div>
    </header>

    <section class="info-section">
      <div class="faq-item">
        <strong>Werden meine Dateien hochgeladen oder gespeichert?</strong>
        <p>Nein. Der gesamte Vorgang läuft lokal im Browser auf deinem Gerät. Die PDF-Datei verlässt zu keinem Zeitpunkt deinen Rechner. Es findet keine Datenübertragung an externe Server statt.</p>
      </div>

      <div class="faq-item">
        <strong>Ist die Nutzung kostenlos?</strong>
        <p>Ja, das Tool ist vollständig kostenlos. Es gibt keine Registrierung, keine Abonnements und keine versteckten Kosten. Wenn dir das Tool hilft, kannst du das Projekt freiwillig über Ko-Fi unterstützen.</p>
      </div>

      <div class="faq-item">
        <strong>Welche ZUGFeRD- und Factur-X-Versionen werden unterstützt?</strong>
        <p>Das Tool unterstützt ZUGFeRD 1.0, 2.0, 2.1 und 2.2 sowie Factur-X in allen Profilen (MINIMUM, BASIC WL, BASIC, EN16931, EXTENDED). Voraussetzung ist eine PDF mit eingebetteter XML-Rechnung.</p>
      </div>

      <div class="faq-item">
        <strong>Kann ich die erzeugte XRechnung an Behörden senden?</strong>
        <p>Ja. Die erzeugte XML entspricht dem XRechnung-Standard EN16931 und kann bei öffentlichen Auftraggebern über deren E-Rechnungsportale eingereicht werden – zum Beispiel über das Bundesportal ZRE oder OZG-RE.</p>
      </div>

      <div class="faq-item">
        <strong>Was ist die Leitweg-ID und woher bekomme ich sie?</strong>
        <p>Die Leitweg-ID ist eine Routing-Kennung öffentlicher Auftraggeber zur internen Zuordnung von Rechnungen. Sie wird vom Auftraggeber mitgeteilt und besteht aus drei mit Bindestrichen getrennten Blöcken (z.&nbsp;B. <code>12345-67890-12</code>). Das Tool fragt sie optional ab.</p>
      </div>

      <div class="faq-item">
        <strong>Was passiert, wenn meine PDF keine XRechnung-Guideline enthält?</strong>
        <p>Das Tool erkennt automatisch, ob die Guideline bereits auf XRechnung gesetzt ist. Fehlt sie, schaltet das Tool Eingabefelder für Leitweg-ID, Lieferantennummer und Käufer-E-Mail frei.</p>
      </div>

      <div class="faq-item">
        <strong>Funktioniert der Konverter auch auf dem Smartphone?</strong>
        <p>Ja. Der Konverter läuft auf allen aktuellen Browsern auf Desktop, Tablet und Smartphone. Es wird keine App benötigt.</p>
      </div>

      <div class="faq-item">
        <strong>Ist der Quellcode öffentlich?</strong>
        <p>Ja. Der Quellcode ist Open Source auf <a href="https://github.com/simonfieberIT/ZUGFeRD-to-XRechnung" target="_blank" rel="noopener noreferrer">GitHub</a>. Contributions und Bug Reports sind willkommen.</p>
      </div>
    </section>

    <div style="text-align: center; margin: 20px 0;">
      <a href="/" class="kofi-btn">→ Zum Konverter</a>
    </div>

    <footer class="app-footer">
      <div class="footer-left">
        <a
          href="https://github.com/simonfieberIT/ZUGFeRD-to-XRechnung"
          target="_blank"
          rel="noopener noreferrer"
          class="footer-version"
          aria-label="GitHub-Projekt ZUGFeRD-to-XRechnung"
          title="Quellcode auf GitHub (öffnet in neuem Tab)"
        >v1.0.6</a>
        <span class="footer-separator">·</span>
        <time datetime="2026-06-22" class="footer-updated">Juni 2026</time>
      </div>
      <nav class="site-nav" aria-label="Seitennavigation">
        <a href="/">Konverter</a>
        <span aria-hidden="true" class="site-nav-sep">·</span>
        <a href="/anleitung/">Anleitung</a>
        <span aria-hidden="true" class="site-nav-sep">·</span>
        <a href="/faq/" aria-current="page">FAQ</a>
        <span aria-hidden="true" class="site-nav-sep">·</span>
        <a href="/zugferd-xrechnung/">ZUGFeRD &amp; XRechnung</a>
        <span aria-hidden="true" class="site-nav-sep">·</span>
        <a href="https://fieber-it.com/impressum" target="_blank" rel="noopener noreferrer">Impressum</a>
        <span aria-hidden="true" class="site-nav-sep">·</span>
        <a href="https://fieber-it.com/datenschutz" target="_blank" rel="noopener noreferrer">Datenschutz</a>
      </nav>
    </footer>
  </div>
</body>
</html>
```

- [ ] **Step 2: Verify**

```bash
grep -c "Question\|site-nav\|FAQPage" faq/index.html
```
Expected: `12` or more (8× `Question`, 1× `FAQPage`, several `site-nav`).

- [ ] **Step 3: Commit**

```bash
git add faq/index.html
git commit -m "feat: add /faq/ FAQPage subpage"
```

---

## Task 4: zugferd-xrechnung/index.html — Comparison subpage

**Goal:** Create the ZUGFeRD vs. XRechnung explanation page at `/zugferd-xrechnung/` with Article schema and comparison table.

**Files:**
- Create: `zugferd-xrechnung/index.html`

**Acceptance Criteria:**
- [ ] File exists at `zugferd-xrechnung/index.html`
- [ ] `Article` schema present with `dateModified: "2026-06-22"`
- [ ] `<table class="comparison-table">` present with ≥ 5 rows
- [ ] Dense answer block (~50 words) in `app-description`
- [ ] Footer has `<nav class="site-nav">` with all 6 links
- [ ] `../styles.css` referenced

**Verify:** `grep -c "Article\|comparison-table\|site-nav\|dateModified" zugferd-xrechnung/index.html` → `4`

**Steps:**

- [ ] **Step 1: Create directory and file**

```bash
mkdir -p zugferd-xrechnung
```

Create `zugferd-xrechnung/index.html` with the following complete content:

```html
<!doctype html>
<html lang="de">
<head>
  <meta charset="utf-8" />
  <title>ZUGFeRD vs. XRechnung: Unterschied, Gemeinsamkeiten und wann was gilt</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="description" content="ZUGFeRD und XRechnung erklärt: Was ist der Unterschied? Welches Format brauche ich für Behörden? Mit Vergleichstabelle und direktem Link zum kostenlosen Konverter." />
  <link rel="canonical" href="https://rechnungskonverter.de/zugferd-xrechnung/" />
  <meta name="author" content="Simon Fieber" />
  <meta property="og:title" content="ZUGFeRD vs. XRechnung: Unterschied, Gemeinsamkeiten und wann was gilt" />
  <meta property="og:description" content="ZUGFeRD und XRechnung erklärt: Was ist der Unterschied? Welches Format brauche ich für Behörden? Mit Vergleichstabelle." />
  <meta property="og:type" content="article" />
  <meta property="og:url" content="https://rechnungskonverter.de/zugferd-xrechnung/" />
  <meta property="og:image" content="https://rechnungskonverter.de/og-image.png" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="ZUGFeRD vs. XRechnung – Unterschied erklärt" />
  <meta name="twitter:description" content="ZUGFeRD und XRechnung: Was ist der Unterschied, welches Format für Behörden? Mit Vergleichstabelle." />
  <meta name="twitter:image" content="https://rechnungskonverter.de/og-image.png" />
  <link rel="icon" href="/favicon.ico" sizes="any" />
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
  <link rel="stylesheet" href="../styles.css" />
  <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": "ZUGFeRD und XRechnung: Was ist der Unterschied?",
      "description": "ZUGFeRD und XRechnung erklärt: Was ist der Unterschied, welches Format brauche ich für Behörden?",
      "author": {
        "@type": "Person",
        "name": "Simon Fieber",
        "url": "https://fieber-it.com"
      },
      "publisher": {
        "@type": "Organization",
        "name": "Simon Fieber IT",
        "url": "https://fieber-it.com"
      },
      "dateModified": "2026-06-22",
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": "https://rechnungskonverter.de/zugferd-xrechnung/"
      },
      "inLanguage": "de"
    }
  </script>
</head>
<body>
  <div class="app">
    <header class="app-header">
      <div>
        <h1 class="app-title">ZUGFeRD und XRechnung: Was ist der Unterschied?</h1>
        <p class="app-description">
          ZUGFeRD und Factur-X sind PDF-Rechnungen mit eingebetteter XML – maschinenlesbar und gleichzeitig als PDF für Menschen lesbar. XRechnung ist eine reine XML-Datei ohne PDF und seit 2020 Pflichtstandard für Rechnungen an deutsche Bundesbehörden. Beide basieren auf dem europäischen Standard EN16931.
        </p>
      </div>
    </header>

    <section class="info-section">
      <h2>Was ist ZUGFeRD / Factur-X?</h2>
      <p>
        ZUGFeRD (Zentraler User Guide des Forums elektronische Rechnung Deutschland) ist ein hybrides Rechnungsformat: eine normale PDF-Rechnung mit einer eingebetteten, maschinenlesbaren XML-Datei. Das ermöglicht sowohl automatische Verarbeitung in Buchhaltungssystemen als auch die gewohnte visuelle Lesbarkeit als PDF.
      </p>
      <p>
        Factur-X ist das französisch-deutsche Pendant – technisch identisch mit ZUGFeRD 2.1, lediglich unter anderem Namen standardisiert. Beide Formate basieren auf dem europäischen Rechnungsstandard EN16931 und werden in verschiedenen Profilen (z.&nbsp;B. BASIC, EN16931, EXTENDED) ausgeliefert.
      </p>

      <h2>Was ist XRechnung?</h2>
      <p>
        XRechnung ist der deutsche Standard für elektronische Rechnungen an öffentliche Auftraggeber. Im Gegensatz zu ZUGFeRD enthält XRechnung keine PDF – die Datei besteht ausschließlich aus XML und ist damit nicht direkt für Menschen lesbar, dafür vollständig maschinenverarbeitbar.
      </p>
      <p>
        XRechnung ist seit dem 27.&nbsp;November 2020 Pflichtstandard für Rechnungen an Bundesbehörden gemäß E-Rechnungsverordnung (§&nbsp;4 ERechV) und wird schrittweise auch auf Landes- und Kommunalebene verbindlich.
      </p>

      <h2>Vergleich: ZUGFeRD / Factur-X vs. XRechnung</h2>
      <table class="comparison-table">
        <thead>
          <tr>
            <th>Merkmal</th>
            <th>ZUGFeRD / Factur-X</th>
            <th>XRechnung</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Dateiformat</td>
            <td>PDF mit eingebetteter XML</td>
            <td>Reine XML-Datei</td>
          </tr>
          <tr>
            <td>Für Menschen lesbar</td>
            <td>Ja (als PDF)</td>
            <td>Nein (nur maschinenlesbar)</td>
          </tr>
          <tr>
            <td>Pflicht für Bundesbehörden</td>
            <td>Nein</td>
            <td>Ja (seit 27.11.2020)</td>
          </tr>
          <tr>
            <td>Zugrunde liegender Standard</td>
            <td>EN16931 (Profile)</td>
            <td>EN16931 (vollständig)</td>
          </tr>
          <tr>
            <td>Typischer Einsatz</td>
            <td>B2B, optionale B2G-Nutzung</td>
            <td>B2G (Behörden, öffentliche Hand)</td>
          </tr>
          <tr>
            <td>Enthält PDF</td>
            <td>Ja</td>
            <td>Nein</td>
          </tr>
        </tbody>
      </table>

      <h2>Wann welches Format?</h2>
      <p>
        <strong>ZUGFeRD / Factur-X</strong> ist die richtige Wahl für Rechnungen zwischen Unternehmen (B2B), wenn Empfänger sowohl automatisierte Verarbeitung als auch visuelle Lesbarkeit wünschen. Viele Buchhaltungssysteme können die eingebettete XML direkt importieren.
      </p>
      <p>
        <strong>XRechnung</strong> ist Pflicht bei Rechnungen an Bundesbehörden und zunehmend auch an Landesbehörden. Hast du eine ZUGFeRD- oder Factur-X-Rechnung und musst diese an eine Behörde senden, musst du sie vorher in XRechnung umwandeln.
      </p>

      <div class="seo-divider"></div>

      <p>
        <strong>Tipp:</strong> rechnungskonverter.de wandelt ZUGFeRD- und Factur-X-PDFs kostenlos und lokal im Browser in XRechnung um – keine Registrierung, keine Datenübertragung.
      </p>
    </section>

    <div style="text-align: center; margin: 20px 0;">
      <a href="/" class="kofi-btn">→ ZUGFeRD jetzt in XRechnung umwandeln</a>
    </div>

    <footer class="app-footer">
      <div class="footer-left">
        <a
          href="https://github.com/simonfieberIT/ZUGFeRD-to-XRechnung"
          target="_blank"
          rel="noopener noreferrer"
          class="footer-version"
          aria-label="GitHub-Projekt ZUGFeRD-to-XRechnung"
          title="Quellcode auf GitHub (öffnet in neuem Tab)"
        >v1.0.6</a>
        <span class="footer-separator">·</span>
        <time datetime="2026-06-22" class="footer-updated">Juni 2026</time>
      </div>
      <nav class="site-nav" aria-label="Seitennavigation">
        <a href="/">Konverter</a>
        <span aria-hidden="true" class="site-nav-sep">·</span>
        <a href="/anleitung/">Anleitung</a>
        <span aria-hidden="true" class="site-nav-sep">·</span>
        <a href="/faq/">FAQ</a>
        <span aria-hidden="true" class="site-nav-sep">·</span>
        <a href="/zugferd-xrechnung/" aria-current="page">ZUGFeRD &amp; XRechnung</a>
        <span aria-hidden="true" class="site-nav-sep">·</span>
        <a href="https://fieber-it.com/impressum" target="_blank" rel="noopener noreferrer">Impressum</a>
        <span aria-hidden="true" class="site-nav-sep">·</span>
        <a href="https://fieber-it.com/datenschutz" target="_blank" rel="noopener noreferrer">Datenschutz</a>
      </nav>
    </footer>
  </div>
</body>
</html>
```

- [ ] **Step 2: Verify**

```bash
grep -c "Article\|comparison-table\|site-nav\|dateModified" zugferd-xrechnung/index.html
```
Expected: `4`

- [ ] **Step 3: Commit**

```bash
git add zugferd-xrechnung/index.html
git commit -m "feat: add /zugferd-xrechnung/ comparison Article subpage"
```

---

## Task 5: Root files — llms.txt, pricing.md, robots.txt, sitemap.xml

**Goal:** Add AI-agent context files and update crawl/index infrastructure.

**Files:**
- Create: `llms.txt`
- Create: `pricing.md`
- Modify: `robots.txt`
- Modify: `sitemap.xml`

**Acceptance Criteria:**
- [ ] `llms.txt` exists with all 4 page URLs listed
- [ ] `pricing.md` exists with "0 EUR" stated
- [ ] `robots.txt` explicitly allows GPTBot, PerplexityBot, ClaudeBot, anthropic-ai, Google-Extended
- [ ] `sitemap.xml` contains 4 `<url>` entries, all with `lastmod 2026-06-22`

**Verify:**
```bash
grep -c "GPTBot\|PerplexityBot\|ClaudeBot\|anthropic-ai\|Google-Extended" robots.txt
```
Expected: `5`

```bash
grep -c "<url>" sitemap.xml
```
Expected: `4`

**Steps:**

- [ ] **Step 1: Create llms.txt**

Create `llms.txt` at the project root:

```markdown
# rechnungskonverter.de

> Kostenloser, DSGVO-konformer Browser-Konverter von ZUGFeRD / Factur-X
> PDF-Rechnungen zu XRechnung XML. Keine Datenübertragung, keine Registrierung.
> 100% client-side JavaScript, Open Source.

Gemacht von Simon Fieber (https://fieber-it.com)

## Für wen?
Selbständige, Buchhalter, Steuerberater, die ZUGFeRD-PDFs für Behörden
und öffentliche Auftraggeber in XRechnung (EN16931) umwandeln müssen.

## Unterstützte Formate
- ZUGFeRD 1.x, 2.0, 2.1, 2.2
- Factur-X (alle Profile: MINIMUM, BASIC WL, BASIC, EN16931, EXTENDED)

## Preis
Kostenlos. Open Source: https://github.com/simonfieberIT/ZUGFeRD-to-XRechnung

## Wichtigste Seiten
- https://rechnungskonverter.de/ (Tool)
- https://rechnungskonverter.de/anleitung/ (Schritt-für-Schritt Anleitung)
- https://rechnungskonverter.de/faq/ (Häufige Fragen)
- https://rechnungskonverter.de/zugferd-xrechnung/ (ZUGFeRD vs. XRechnung erklärt)
```

- [ ] **Step 2: Create pricing.md**

Create `pricing.md` at the project root:

```markdown
# Preise – rechnungskonverter.de

## Kostenlos
- Preis: 0 EUR / Monat
- Keine Nutzungslimits
- Keine Registrierung erforderlich
- Funktionen: ZUGFeRD/Factur-X zu XRechnung, lokal im Browser, DSGVO-konform, Open Source

## Freiwillige Unterstützung
Ko-Fi: https://ko-fi.com/C0C31OT01F
```

- [ ] **Step 3: Update robots.txt**

Replace the entire content of `robots.txt` with:

```
User-agent: *
Allow: /

User-agent: GPTBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: Google-Extended
Allow: /

Sitemap: https://rechnungskonverter.de/sitemap.xml
```

- [ ] **Step 4: Update sitemap.xml**

Replace the entire content of `sitemap.xml` with:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://rechnungskonverter.de/</loc>
    <lastmod>2026-06-22</lastmod>
  </url>
  <url>
    <loc>https://rechnungskonverter.de/anleitung/</loc>
    <lastmod>2026-06-22</lastmod>
  </url>
  <url>
    <loc>https://rechnungskonverter.de/faq/</loc>
    <lastmod>2026-06-22</lastmod>
  </url>
  <url>
    <loc>https://rechnungskonverter.de/zugferd-xrechnung/</loc>
    <lastmod>2026-06-22</lastmod>
  </url>
</urlset>
```

- [ ] **Step 5: Verify**

```bash
grep -c "GPTBot\|PerplexityBot\|ClaudeBot\|anthropic-ai\|Google-Extended" robots.txt
```
Expected: `5`

```bash
grep -c "<url>" sitemap.xml
```
Expected: `4`

- [ ] **Step 6: Commit**

```bash
git add llms.txt pricing.md robots.txt sitemap.xml
git commit -m "chore: add llms.txt, pricing.md; update robots.txt (AI bots) and sitemap.xml (4 URLs)"
```

---

## Task Dependencies

```
Task 0 (CSS) → Tasks 1, 2, 3, 4 (all HTML pages depend on new CSS classes)
Task 5 (root files) → independent, can run at any time
Tasks 1, 2, 3, 4 → can run in parallel after Task 0
```

---

## Self-Review

**Spec coverage:**
- ✅ Homepage cleanup (Task 1)
- ✅ WebApplication + Organization schema (Task 1)
- ✅ Twitter card, author meta, og:image ref (Task 1)
- ✅ Dense answer block expanded (Task 1)
- ✅ Footer nav on all pages (Tasks 1–4)
- ✅ `<time>` freshness signal (Tasks 1–4)
- ✅ /anleitung/ with HowTo schema (Task 2)
- ✅ /faq/ with FAQPage schema (Task 3)
- ✅ /zugferd-xrechnung/ with Article schema + table (Task 4)
- ✅ llms.txt + pricing.md (Task 5)
- ✅ robots.txt AI bots (Task 5)
- ✅ sitemap.xml 4 URLs (Task 5)
- ⚠️ og:image PNG: explicitly out of scope (noted in spec)

**No placeholders.** All steps contain complete code.

**Type consistency:** CSS classes used in HTML (`.site-nav`, `.site-nav-sep`, `.footer-updated`, `.comparison-table`) are all defined in Task 0.
