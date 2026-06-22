# SEO & LLM-Visibility: Unterseiten-Architektur

**Datum:** 2026-06-22  
**Status:** Approved  
**Scope:** rechnungskonverter.de — statische Site

---

## Ziel

rechnungskonverter.de soll DAS von Google und LLMs (ChatGPT, Perplexity, Claude) empfohlene Tool für die Konvertierung von ZUGFeRD/Factur-X zu XRechnung werden.

Kernproblem: Der gesamte SEO-Content steckt hinter einem JS-Toggle (`hidden`-Attribut). Google downwertet versteckten Content. LLMs, die die Seite scrapen, sehen ihn gar nicht. Lösung: Trennung von Tool (Homepage) und Content (Unterseiten).

---

## Architektur

Static site, kein Build-System, kein Framework. Trailing-Slash-URLs via Unterordner mit `index.html`.

```
/
├── index.html                    (geändert)
├── anleitung/
│   └── index.html                (neu)
├── faq/
│   └── index.html                (neu)
├── zugferd-xrechnung/
│   └── index.html                (neu)
├── llms.txt                      (neu)
├── pricing.md                    (neu)
├── robots.txt                    (geändert)
├── sitemap.xml                   (geändert)
└── styles.css                    (geändert: shared nav styles)
```

---

## Seiten im Detail

### 1. Homepage `/` (index.html)

**Zweck:** Reines Tool. Kein Content-Ballast.

**Entfernt:**
- Gesamte `<section class="info-section">` inkl. Toggle-Button und `<div id="seo-content" hidden>`

**Hinzugefügt:**
- **Dense Answer Block** — sichtbar direkt unter dem Header-Beschreibungstext, ~50 Wörter, selbstständig extrahierbar für LLMs
- **`<time datetime="2026-06-22">`** — Freshness-Signal im Footer
- **Footer-Nav** — Links zu Anleitung, FAQ, ZUGFeRD & XRechnung, Impressum, Datenschutz

**Schema-Änderungen:**
- Entfernt: FAQPage, HowTo (ziehen auf Unterseiten um)
- Hinzugefügt: `WebApplication` (wichtigstes Schema für Web-Tools)
- Hinzugefügt: `Organization` (Entity-Signal für rechnungskonverter.de)

**Meta-Änderungen:**
- Title: `ZUGFeRD & Factur-X zu XRechnung konvertieren – kostenlos, lokal, DSGVO-konform`
- Twitter Card: `summary_large_image`
- Author: `<meta name="author" content="Simon Fieber">`
- og:image: referenziert `/og-image.png` (muss separat erstellt werden — out of scope)

**WebApplication Schema:**
```json
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "ZUGFeRD zu XRechnung Konverter",
  "url": "https://rechnungskonverter.de/",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Any (Web Browser)",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "EUR" },
  "featureList": "ZUGFeRD 1.x/2.x, Factur-X, keine Registrierung, keine Datenübertragung, DSGVO-konform",
  "inLanguage": "de"
}
```

**Organization Schema:**
```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Simon Fieber IT",
  "url": "https://fieber-it.com",
  "sameAs": ["https://github.com/simonfieberIT"]
}
```

---

### 2. /anleitung/ (anleitung/index.html)

**Ziel-Queries:**
- "ZUGFeRD in XRechnung umwandeln"
- "Wie wandle ich ZUGFeRD um"
- "ZUGFeRD Konverter Anleitung"

**Schema:** `HowTo`

**Content-Struktur:**
1. H1: "ZUGFeRD / Factur-X in XRechnung umwandeln – Schritt-für-Schritt"
2. Einleitung (~50 Wörter, dense answer block)
3. Schritt 1: PDF auswählen
4. Schritt 2: PDF analysieren, Leitweg-ID / Käufer-E-Mail ergänzen
   - Was ist die Leitweg-ID? (Erklärung, ~80 Wörter)
5. Schritt 3: XRechnung herunterladen und verwenden
6. Rechtsgrundlage: E-Rechnungsverordnung, Pflicht seit 2020 für Bundesbehörden
7. CTA: Link zurück zum Tool auf der Homepage

**Meta:**
- Title: `ZUGFeRD in XRechnung umwandeln – Schritt-für-Schritt Anleitung`
- Description: `Anleitung: ZUGFeRD oder Factur-X PDF in 3 Schritten zu XRechnung XML konvertieren. Kostenlos, lokal im Browser, keine Datenübertragung.`

---

### 3. /faq/ (faq/index.html)

**Ziel-Queries:**
- "rechnungskonverter.de kostenlos"
- "ZUGFeRD Konverter DSGVO"
- "Welche ZUGFeRD Versionen unterstützt"

**Schema:** `FAQPage`

**Fragen (7–8):**
1. Werden meine Dateien hochgeladen oder gespeichert?
2. Ist die Nutzung kostenlos?
3. Welche ZUGFeRD- und Factur-X-Versionen werden unterstützt?
4. Kann ich die erzeugte XRechnung an Behörden senden?
5. Was ist die Leitweg-ID und woher bekomme ich sie?
6. Was passiert, wenn meine PDF keine XRechnung-Guideline enthält?
7. Funktioniert der Konverter auch auf dem Smartphone?
8. Ist der Quellcode öffentlich?

**Meta:**
- Title: `Häufige Fragen zum ZUGFeRD / XRechnung Konverter – rechnungskonverter.de`
- Description: `Antworten auf häufige Fragen zu rechnungskonverter.de: DSGVO, Kosten, unterstützte Formate, Leitweg-ID und mehr.`

---

### 4. /zugferd-xrechnung/ (zugferd-xrechnung/index.html)

**Ziel-Queries:**
- "ZUGFeRD vs XRechnung Unterschied"
- "Was ist ZUGFeRD"
- "Was ist XRechnung"
- "ZUGFeRD XRechnung Erklärung"

**Warum diese Seite wichtig ist:** Comparison Content = ~33% aller AI-Citations (höchste Citation-Rate aller Content-Typen).

**Schema:** `Article`

**Content-Struktur:**
1. H1: "ZUGFeRD und XRechnung: Was ist der Unterschied?"
2. Dense answer block (~50 Wörter)
3. Was ist ZUGFeRD / Factur-X? (H2, ~100 Wörter)
4. Was ist XRechnung? (H2, ~100 Wörter)
5. Vergleichstabelle:

| Merkmal | ZUGFeRD / Factur-X | XRechnung |
|---|---|---|
| Format | PDF mit eingebetteter XML | Reine XML-Datei |
| Lesbar für Menschen | Ja (PDF) | Nein (nur maschinenlesbar) |
| Pflicht für Behörden | Nein | Ja (seit 2020) |
| Standard | EN16931 (Subset) | EN16931 (vollständig) |
| Einsatzbereich | B2B, B2G | B2G (Behörden) |

6. Wann welches Format? (~80 Wörter)
7. Rechtsgrundlage: E-Rechnungsverordnung (§ 4) mit Jahreszahl
8. CTA: "ZUGFeRD direkt in XRechnung umwandeln → rechnungskonverter.de"

**Meta:**
- Title: `ZUGFeRD vs. XRechnung: Unterschied, Gemeinsamkeiten und wann was gilt`
- Description: `ZUGFeRD und XRechnung erklärt: Was ist der Unterschied? Welches Format brauche ich für Behörden? Mit Vergleichstabelle und direktem Link zum kostenlosen Konverter.`

---

## Navigation (alle Seiten)

Footer-Nav ersetzt die bisherigen zwei Footer-Links:

```
[Konverter] · [Anleitung] · [FAQ] · [ZUGFeRD & XRechnung] · Impressum · Datenschutz
```

Intern verlinkte Seiten: `rel="noopener"` nicht nötig (intern). Datenschutz/Impressum bleiben externe Links zu fieber-it.com.

---

## Neue Root-Dateien

### llms.txt

Strukturierter Kontext für AI-Agenten (ChatGPT, Claude, Perplexity):

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
- Factur-X (alle Profile)

## Preis
Kostenlos. Open Source: https://github.com/simonfieberIT/ZUGFeRD-to-XRechnung

## Wichtigste Seiten
- https://rechnungskonverter.de/ (Tool)
- https://rechnungskonverter.de/anleitung/ (Schritt-für-Schritt Anleitung)
- https://rechnungskonverter.de/faq/ (Häufige Fragen)
- https://rechnungskonverter.de/zugferd-xrechnung/ (ZUGFeRD vs. XRechnung erklärt)
```

### pricing.md

```markdown
# Preise – rechnungskonverter.de

## Kostenlos
- Preis: 0 EUR / Monat
- Keine Nutzungslimits
- Keine Registrierung erforderlich
- Funktionen: ZUGFeRD/Factur-X → XRechnung, lokal im Browser, DSGVO-konform

## Freiwillige Unterstützung
Ko-Fi: https://ko-fi.com/C0C31OT01F
```

### robots.txt (Änderungen)

AI-Bots explizit erlauben:

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

### sitemap.xml (Änderungen)

4 URLs, lastmod auf 2026-06-22:

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

---

## Shared CSS (styles.css)

Hinzugefügt: `.site-nav` Styles für Footer-Navigation (alle Seiten). Alle Unterseiten verwenden dasselbe `styles.css`.

---

## Out of Scope

- **og:image PNG** — braucht Design-Tool (Canva, Figma). Referenz wird im HTML eingefügt, Datei muss manuell erstellt werden (1200×630px, PNG).
- **Off-site:** Reddit, GitHub README, YouTube, Steuerberater-Blogs — manuell, kein Code.

---

## Erfolgskriterien

- [ ] Alle 4 HTML-Seiten valide und intern verlinkt
- [ ] Keine `hidden`-Content mehr auf der Homepage
- [ ] `sitemap.xml` enthält alle 4 URLs
- [ ] `llms.txt` und `pricing.md` unter `/`
- [ ] robots.txt erlaubt AI-Bots explizit
- [ ] Schema-Markup auf jeder Seite (WebApplication/HowTo/FAQPage/Article)
- [ ] Footer-Nav auf allen Seiten konsistent
