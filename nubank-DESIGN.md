---
version: alpha
name: Nubank
description: "A bold, purple-dominant neobank identity where Nubank Purple (#820AD1) floods full screens and cards while crisp white type and Graphik's clean geometry deliver confident, modern fintech — purple as the unmistakable signal of a category-defining brand."

colors:
  primary: "#820AD1"
  on-primary: "#FFFFFF"
  primary-hover: "#9013D8"
  primary-pressed: "#6A08AC"
  primary-deep: "#5A0A8F"
  ink: "#1A1A1A"
  ink-muted: "#595959"
  ink-subdued: "#8C8C8C"
  ink-on-purple: "#FFFFFF"
  ink-on-purple-muted: "#E4CCF5"
  canvas: "#FFFFFF"
  surface-1: "#F5F2F8"
  surface-2: "#EBE3F2"
  border: "#E0E0E0"
  border-subtle: "#F0EAF6"
  success: "#00A868"
  warning: "#E08600"
  error: "#E53935"

typography:
  display:
    fontFamily: "Graphik, Helvetica Neue, Arial, sans-serif"
    fontSize: 44px
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: -0.02em
  body:
    fontFamily: "Graphik, Helvetica Neue, Arial, sans-serif"
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 0em

spacing:
  base: 8px
  scale: [4, 8, 12, 16, 24, 32, 48, 64, 96, 128]

radius:
  sm: 6px
  md: 12px
  lg: 20px
  pill: 9999px

shadows:
  card: "0 2px 8px rgba(26,26,26,0.08)"
  elevated: "0 8px 28px rgba(90,10,143,0.18)"

motion:
  duration-fast: 120ms
  duration-base: 240ms
  easing: cubic-bezier(0.4, 0, 0.2, 1)
---

## Rationale

**Purple as a category claim** — Nubank Purple (#820AD1) is the boldest color bet in modern banking. Traditional banks own navy, green, and red; Nubank claimed an unowned, vivid purple and committed to it at full saturation across full-screen surfaces, cards, and the famous purple credit card. The purple is the brand — when a Brazilian sees that exact violet, they think Nubank before they read a word. The system is built to let purple dominate confidently rather than appear as a timid accent.

**Confident, modern, anti-bank** — Nubank was founded to replace the bureaucratic, fee-laden incumbent banking experience in Latin America. The visual language is the opposite of marble lobbies and gold serif logos: clean geometric sans-serif type, generous whitespace, friendly plain-language copy, and rounded modern shapes. The design communicates that this is a technology company that happens to do banking — fast, transparent, and built for a phone.

**White type on purple as the core pairing** — The defining surface is a full-bleed purple field carrying crisp white headlines and balances. This high-contrast, single-color-plus-white pairing is instantly recognizable and forces clarity: financial figures must be legible against the purple, so the type is bold and the layouts are uncluttered. The restraint of a near-monochrome purple/white palette is what makes the brand feel premium and decisive.

**Mobile-first, balance-forward** — Nubank is fundamentally an app, and the most important element on any screen is the user's money: account balance, card limit, recent transactions. The design system foregrounds these figures in large type on purple hero surfaces, with everything else arranged as clean white cards beneath. The hierarchy always answers "how much do I have and what just happened" before anything else.

## 1. Visual Theme & Atmosphere
Nubank feels bold, modern, and unmistakably purple. The signature experience is a full-bleed #820AD1 surface — the home screen's balance header, onboarding screens, the card visual — carrying large white type. Beneath and around it, clean white cards on a faintly purple-tinted background (#F5F2F8) organize transactions and features. The atmosphere is confident and tech-forward: this is a bank that behaves like a consumer app.

Layouts are spacious and rounded. Large radii (12–20px), pill buttons, and soft purple-tinted shadows give the interface a friendly, premium feel without ornamentation. The mood is decisive simplicity — strong color, strong type, lots of air, and no decorative clutter competing with the user's financial information.

## 2. Color System
**Brand purple system**:
- Nubank Purple: #820AD1 — hero surfaces, primary buttons, the card, brand fields
- Hover: #9013D8 — slightly brighter on interaction
- Pressed: #6A08AC — confirms the press
- Deep purple: #5A0A8F — gradients, deeper accents, shadow tint

**Light surface system**:
- Canvas: #FFFFFF — content cards, transaction lists
- Surface 1: #F5F2F8 — faintly purple-tinted page background
- Surface 2: #EBE3F2 — nested panels, selected rows
- Border: #E0E0E0 — neutral dividers
- Border subtle: #F0EAF6 — internal separators with a purple cast

**Text on light**:
- Primary ink: #1A1A1A — near-black, primary reading color on white cards
- Muted: #595959 — secondary metadata, helper text
- Subdued: #8C8C8C — timestamps, fine print

**Text on purple**:
- On-purple: #FFFFFF — headlines and balances on purple surfaces
- On-purple muted: #E4CCF5 — secondary labels on purple

**Semantic**:
- Success: #00A868 — income, completed transfer
- Warning: #E08600 — pending, attention needed
- Error: #E53935 — failed payment, blocked card

White-on-purple is the brand-defining, high-contrast pairing. Purple is used as a full surface or solid fill, never as thin small text on white where its legibility would weaken.

## 3. Typography
Nubank uses Graphik — a clean, neutral geometric grotesque by Commercial Type — as its brand typeface, with Helvetica Neue and Arial fallbacks. Graphik's even, modern forms reinforce the tech-company-not-bank positioning: it is contemporary, legible, and free of any traditional-banking seriousness.

At display scale (balance headers, onboarding headlines): 32–44px, weight 600, tight −0.02em tracking. Balances and key headlines own the purple hero surface in white.

At body scale (transaction descriptions, settings): 16px, weight 400. Nubank favors comfortably large body text — clarity over density, suiting a mobile-first audience and plain-language voice.

Monetary figures use weight 600–700 with tabular figures, so balances and amounts align cleanly in transaction lists and never jitter as values update. The system avoids hairline weights — everything reads grounded and confident.

## 4. Components & Patterns
**Balance hero header (the atom)**:
- Full-bleed #820AD1 surface at the top of the home screen
- Large white balance figure, account label, quick-action row beneath
- The first and most important thing the user sees

**Nubank card visual**:
- The iconic flat purple credit card, large rounded corners, minimal detail
- Card number, holder, and status rendered in white
- Tappable to reveal controls (freeze, limits, virtual card)

**Quick-action row**:
- Horizontal row of circular icon buttons on the purple header (Pay, Transfer, Deposit, More)
- White icons in subtle translucent circles — primary navigation into money flows

**Transaction list**:
- Clean white rows: merchant icon, description, date, amount
- Income amounts in success green, outflows in ink; tappable for detail
- Grouped by day with muted date headers

**Pix transfer flow** (Brazil's instant payments):
- Step-by-step purple-accented flow: recipient, amount, confirm
- Large amount entry, single primary purple pill per step

**Account / feature card**:
- White rounded card surfacing a product (savings box, loan offer, insurance)
- Purple iconography and a single clear CTA

**Primary pill button**:
- Purple fill #820AD1 with white text, fully rounded
- One primary action per screen; secondary actions as purple-outline ghost buttons

**Bottom navigation bar**:
- Fixed tab bar: Home, Cards, Pix, Profile
- Active tab tinted purple; clean line icons

**Notification / status chip**:
- Pill chips in semantic colors with dark or white text
- Transaction states: completed / pending / failed

**Savings box ("caixinha")**:
- Rounded card showing a goal, progress ring in purple, and balance
- Playful but clean visualization of set-aside money

## 5. Spacing & Layout
Nubank uses an 8px base grid. The home screen is structured as a tall purple hero header (carrying balance and quick actions) flowing into a scrollable stack of white cards on the #F5F2F8 background. Card radii are large (12–20px) and shadows are soft with a purple tint, giving gentle depth.

Content uses generous padding (20–24px inside cards, 16px page gutters on mobile) and ample vertical rhythm (24–32px between sections). The layout is single-column and thumb-friendly, with the primary pill action and bottom nav anchored within reach.

Transaction rows are comfortably tall (around 64px) with clear separation, prioritizing scannability of money movement over packing density. The purple hero-to-white-cards structure is the consistent spatial signature across the app.

## 6. Motion & Interaction
**Screen transitions**: purple flows feel smooth and continuous — 240ms eased transitions between steps in a payment flow, reinforcing a frictionless feel.

**Pill button press**: 120ms scale-down and shift to the pressed purple tone, springing back on release.

**Balance reveal**: tapping the hide/show toggle animates the balance figure with a brief 200ms fade between hidden dots and the real number.

**Card flip / detail**: tapping the card visual animates a smooth transition to card controls; the purple card scales gently into focus.

**Transaction confirmation**: a Pix or transfer success animates a clean check-mark draw on a purple surface — the moment of completion.

## Accessibility

### Contrast Ratios
- **#FFFFFF on #820AD1 purple**: 6.4:1 — passes AA (the core white-on-purple pairing, comfortably legible)
- **#1A1A1A ink on #FFFFFF canvas**: 17.9:1 — passes AAA
- **#595959 muted on #FFFFFF**: 7.0:1 — passes AAA
- **#8C8C8C subdued on #FFFFFF**: 3.5:1 — fails AA; reserve for non-essential fine print
- **#E4CCF5 on-purple-muted on #820AD1**: 2.9:1 — fails AA; use only for large or non-essential secondary labels on purple, never body text
- **#820AD1 purple on #FFFFFF**: 6.4:1 — passes AA; acceptable for icons and large text, fine for active states
- **#1A1A1A ink on #F5F2F8 surface-1**: 16.5:1 — passes AAA
- **#00A868 success on #FFFFFF**: 3.4:1 — fails AA; pair income green with a sign/label, use larger bold text

### Minimum Requirements
- **Touch target**: 44×44px minimum; quick-action circles and pill buttons must meet this
- **Balance privacy**: the hide-balance toggle must be reachable and announced — sensitive figures should be maskable for shoulder-surfing protection
- **Focus indicator**: 2px solid #820AD1 outline on light surfaces; 2px solid #FFFFFF outline on purple surfaces — always visible against the active background
- **Income vs. outflow**: never rely on green/dark color alone — pair amounts with +/− signs and labels for colorblind users

### Motion
- Respects `prefers-reduced-motion`: yes — screen-flow transitions, card flip, balance fade, and confirmation draw are reduced to instant state changes or simple fades
- Payment-flow transitions are decorative; the step changes still occur without animation under reduced motion

### Notes
- White-on-purple (#FFFFFF on #820AD1) at 6.4:1 is the primary brand pairing and passes AA — keep purple at its full saturation as a surface, not as small text on white
- On-purple muted (#E4CCF5) at 2.9:1 fails AA — restrict it to large secondary labels on purple surfaces; never use it for transaction text or amounts
- Financial figures (balances, amounts) must be exposed as readable, labeled text for screen readers, and remain legible when the balance-privacy mask is toggled off
- Because the brand leans heavily on a single hue, ensure status and semantic meaning (success/pending/failed) are always conveyed with text and icon, not purple-vs-color shading alone
