# SPD Website — Design Rationale & Component Breakdown

**Sindikasi Pemilu dan Demokrasi (SPD)**
Homepage UX/UI Redesign · April 2026

---

## 1. Design Intent

The current SPD site leans on a vivid orange identity and a marketing-deck rhythm. The redesign shifts toward an **institutional-research register** closer to the Habibie Institute — a tone the public associates with think-tanks, policy centers, and peer-reviewed scholarship. The goal is not to erase SPD's warmth, but to let the work speak: research, data, and civic participation first, decoration last.

The three governing principles for every decision below:

1. **Hierarchy over ornament.** A reader should be able to understand *what SPD is* and *what it produces* within 5 seconds of landing, without scrolling.
2. **Data as identity.** For a research institution, numbers and publications *are* the brand. They are surfaced in the hero, not hidden under an "About" click.
3. **Restraint as respect.** Civic platforms carry weight. Muted palette, generous whitespace, and serif-sans pairing signal that SPD takes itself — and its readers — seriously.

---

## 2. Visual System

### Color palette

| Token | Hex | Usage |
|---|---|---|
| Primary (Navy) | `#0A2540` | Brand anchor — topbar, footer, CTAs, logo mark |
| Primary 700 | `#0F355F` | Hover states |
| Primary 50 | `#EAF0F7` | Dropdown hover, subtle backgrounds, event date chips |
| Accent (Red) | `#B91C2C` | Eyebrows, emphasis, delta indicators, Jubir Warga CTA |
| Ink | `#111827` | Headlines |
| Text | `#1F2937` | Body |
| Muted | `#6B7280` | Secondary text, metadata |
| Line | `#E5E7EB` | Borders, dividers |
| Background Alt | `#F7F8FA` | Alternating sections — breaks visual rhythm without color noise |

**Why navy + muted red instead of orange?** Orange reads commercial and energetic, which is appropriate for event pages or campaigns but dilutes research credibility. Navy signals authority and civic institution; a *muted* red (not crimson) keeps an Indonesian democratic reference without turning loud.

### Typography

- **Headings**: Source Serif 4 (weights 400–700). A contemporary serif with institutional gravitas. Used sparingly — only for H1–H4 and occasional data values.
- **Body & UI**: Inter (300–700). A neutral, highly legible workhorse.
- **Why the pair**: A serif/sans duo is the visual language of research journals and policy publications (Habibie Institute, Brookings, IFES, LSE). A sans-only system would feel like a startup; a serif-only system would feel like a newspaper.

### Spacing & layout

- Container: max-width 1240px, 24px horizontal gutter.
- Vertical rhythm: 80px section padding (56px mobile). Alternating `#FFFFFF` / `#F7F8FA` backgrounds every other section to give the eye rest points without adding decoration.
- Radius: 4px for buttons, 8–12px for cards. Never pill-rounded except on contextual pills.

---

## 3. Homepage Layout — Section by Section

### 3.1 Top Utility Bar (`.topbar`)
- **Left**: Office address + email — establishes physical presence (institutional signal).
- **Right**: Social icons + ID/EN switch.
- **Rationale**: Habibie Institute and peer think-tanks use a thin utility strip to move low-priority actions out of the main nav, keeping the nav clean.

### 3.2 Primary Navigation (`.nav`)
Sticky, white, 76px tall. Multi-level dropdowns:
- **Tentang SPD** — profile, vision, history, org chart, team, annual reports, partners.
- **Program & Riset** — mega-dropdown, two columns: "Program Unggulan" + "Riset & Data".
- **Publikasi** — two-level: Artikel → (Opini/Analisis/Policy Brief); Jurnal → (Jurnal Demokrasi/OJS/Pedoman Submisi); Buku; Working Papers.
- **Terlibat** — Jubir Warga, Partisipasi Publik, Volunteer, Donasi.
- **Berita**, **Agenda** — flat links (high-frequency destinations).
- **CTA**: "Cari Data" — the primary conversion action for SPD is always data access, not "contact us".

**UX notes**:
- Dropdowns open on hover *and* on focus (keyboard accessible).
- Sub-dropdowns cascade to the right with a `›` affordance.
- Active link color is accent red, not primary navy — makes current location unmistakable.

### 3.3 Hero (`.hero`)
Two-column grid: message left, data dashboard preview right.

**Left column**:
- Live tag with pulsing dot: "Pemilu 2029: Persiapan Dimulai" — anchors SPD in the current political calendar.
- H1 with an italic emphasis clause: *"pemilu yang bermakna"*. The serif italic is the single most "institutional" typographic choice in the design.
- 2-line lede — institutional positioning statement.
- Two CTAs: primary (explore data) + outline (about SPD).
- **Running Programs strip**: 4 pill-links for active initiatives. This is the "short about + running programs" requirement, rendered as compact navigation rather than a card grid — prevents the hero from ballooning.

**Right column — Dashboard preview**:
A compact card that looks like the real dashboard, not a screenshot. Three stat cells (Partisipasi / TPS Dipantau / Laporan Warga) + a two-line trend chart + a small "LIVE" badge. Clicking it should open the full dashboard.

**Why this hero**: The Habibie Institute hero uses a single strong headline + a secondary data or publication feature. Our version does the same but surfaces a live dashboard — because SPD's differentiator is open electoral data, and the hero must communicate that instantly.

### 3.4 Jubir Warga CTA (`.jubir`)
Full-bleed navy section. Two-column: campaign message left, stat grid right (4 numbers: 4,280 Jubir / 34 Provinsi / 520 Kab-Kota / 98% Kepuasan).

**Rationale**: The brief asked for "campaign style CTA" — but this is an institutional site, so the campaign energy is achieved by (a) a strong dark contrast against the white hero, (b) muted-red accent on the CTA button, and (c) stat-driven social proof instead of splashy imagery. No photos used here — restraint signals confidence.

### 3.5 Dynamic Photo Collage
Asymmetric grid: 1 large + 4 medium + 1 wide. Every 3.5s, a random tile cross-fades to a new image from a pool of 10. Each tile has a hover overlay with caption.

**Rationale**: Dynamic doesn't mean distracting. The rotation is slow (not a carousel that demands attention), and the asymmetric layout prevents the "stock collage" feeling. Captions name *where and when* — every photo becomes evidence of fieldwork.

### 3.6 Interactive Timeline
Horizontal 5-stop timeline on a light-gray section. Years (2011 → 2026) alternate above/below a center line. Dots scale and turn red on hover.

**Rationale**: A horizontal timeline reads left-to-right as "institution maturing over time" — the right unconscious signal. Vertical timelines feel blog-like; horizontal feels archival/museum. Five stops is enough; more becomes noise.

### 3.7 Team (`.team-grid` + `.modal`)
Four portraits in a 3:4 aspect ratio grid, desaturated slightly at rest and full color on hover. Click opens a modal (220px photo + name + role + bio + expertise tag).

**Rationale**: Team pages on research sites fail when they try to be LinkedIn. Here, the card shows only name + role — the bio is behind an intentional click. Modal is dismissible with Escape, backdrop click, or the × button.

### 3.8 YouTube Latest Video
Main video (16:9) left, three smaller up-next thumbnails right. Red circular play button is the only strong red element on the page, drawing the eye.

**Rationale**: Embedding a real YouTube iframe loads ~500KB of third-party JS; this thumbnail-first pattern defers that cost until the user actually clicks. Faster first paint, better privacy.

### 3.9 Publication Portal (`.portal`)
Two cards: "Jurnal Demokrasi SPD" and "Working Papers & Policy Brief". Each has an icon, short description, three metadata chips (volumes, license, indexing), and two CTAs (submit + guidelines).

**Rationale**: The journal submission portal is the single highest-value conversion for an academic-adjacent institution. It gets its own breathing section, not a footer link.

### 3.10 Books & Research
Four book cards with synthetic covers (CSS-generated, each a different muted color — navy, brown, deep teal, muted red). Title + author on cover; metadata + title below.

**Rationale**: Real book covers are rarely available in high-res at the right size. A consistent CSS "house style" for covers is more institutional and easier to maintain — and it doubles as a fallback if a real cover image fails to load. Pattern used by university presses.

### 3.11 News & Articles
Three-column grid. Each card: image + (category · date · read time) + serif title + excerpt.

**Rationale**: Metadata sits above the title (as in long-form journalism — NYT, Guardian, The Atlantic). The category is red and uppercase-tracked — the only typographic flourish — to let readers scan by topic.

### 3.12 Events (`.events-list`)
Single bordered container with 4 event rows. Each row: date chip (primary-50 bg) | title + metadata | type tag.

**Rationale**: A list beats a card grid for events because events are read chronologically. The date chip repeats at the left edge, creating a natural timeline rhythm. Type tags (Offline / Online / Pelatihan) on the right let users filter visually.

### 3.13 Footer
Four columns: brand + tagline, Lembaga links, Publikasi links, Kontak info. Navy background for continuity with the topbar — the brand color literally frames the page.

### 3.14 Scroll-to-top
Fixed bottom-right circular button (navy, 44px). Appears after 600px scroll. Smooth-scrolls to top.

---

## 4. Component Breakdown

Mapped so each piece can be built as a reusable React/Vue/Svelte component:

```
<Layout>
  <TopBar />
  <Navbar>
    <NavDropdown items=[] />
    <NavMegaDropdown columns=[] />
    <NavDropdownWithSubmenu />
    <LanguageSwitch />
  </Navbar>

  <Hero>
    <HeroCopy tag, h1, lede, ctas />
    <ProgramPills items=[] />
    <DashboardPreview stats=[], chart, status="live" />
  </Hero>

  <JubirCTA stats=[] />
  <PhotoCollage pool=[], interval={3500} />
  <Timeline milestones=[] />
  <TeamGrid members=[] onSelect={openModal} />
  <TeamModal member ref />
  <VideoSection main, sidebar=[] />
  <PublicationPortal cards=[] />
  <BookGrid books=[] />
  <ArticleGrid articles=[] />
  <EventList events=[] />
  <Footer />
  <ScrollToTop />
</Layout>
```

Every component is data-driven (arrays passed as props), so the CMS (or JSON, Strapi, Sanity, WordPress headless) can populate them without design changes.

---

## 5. UX Details

- **Smooth scrolling** (`scroll-behavior: smooth`) on every anchor link and the scroll-top button.
- **Focus management**: dropdowns open on `:focus-within` so keyboard users get them; modal traps focus and restores body scroll on close; ESC closes the modal.
- **Motion discipline**: 150–250ms transitions, ease-out. No parallax. No hero video. No bouncing elements. The only looping animation is the tiny pulse dot on the hero tag.
- **Responsive breakpoints**:
  - `≥ 969px` — desktop grid.
  - `≤ 968px` — single-column stacks, nav collapses into hamburger, topbar address hidden, event type tag hidden.
  - `≤ 560px` — section padding reduces from 80px to 56px, stats grid becomes single column, all cards single column.
- **Accessibility**: semantic `<nav>`, `<section>`, `<article>`, `<footer>`; `aria-label` on icon buttons; `role="dialog" aria-modal="true"` on team modal; contrast ratios ≥ 4.5:1 for body text and ≥ 3:1 for large text against every background.
- **Performance**: system fonts fallback, Lucide icons loaded from CDN (tree-shake in production), images lazy-loaded via native `loading="lazy"` (can be added per image).

---

## 6. What This Design Deliberately Does NOT Do

- **No hero carousel.** They bury content and kill LCP scores.
- **No gradient backgrounds.** Exactly one subtle white→grey fade on the hero; everything else is solid.
- **No icon-decorated value-prop grid.** The reference site has one ("Kolaboratif / Berbasis Data / Inovatif / Inklusif"). In the research register, these sound like a startup deck; they've been replaced by the live dashboard — a concrete demonstration of the same values.
- **No counter-up animations on stats.** They delay readability and feel gimmicky for an institution.
- **No chatbot, no popup, no cookie fly-in.** Institutional sites earn trust by not interrupting.

---

## 7. Recommended Next Steps

1. **Wire the Vite/React shell** — port the sections into `src/components/sections/` matching the component tree above. The existing `src-backup/components/layout/Header.jsx` and `sections/Hero.jsx` can be rebuilt against this design.
2. **Connect a headless CMS** for news, events, team, publications (Sanity or Strapi is recommended — open-source, good IA for bilingual content).
3. **Real dashboard**: replace the hero SVG preview with a live embed from the actual Dashboard Pemilu backend.
4. **Add an OJS link** for Jurnal Demokrasi in the publication portal card — the button currently links to `#`.
5. **Generate `/en` routes** before launch — the language switch should flip locale, not just state.
6. **Run Lighthouse** — target ≥ 95 on every metric. With this design (no hero video, no heavy third-party), it should land there on first try.

---

*Prepared for SPD Indonesia — April 2026.*
