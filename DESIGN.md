---
version: 1.2
name: BuzzMe-design-system
description: "A playful game surface borrowed from the Duolingo app and painted in Monad purple: one confident action color (#836EF9) for every button and CTA, a friendly rounded type stack (Nunito), and chunky 16px cards with buttons that sit on a 4px darker edge and press down when tapped. Gold is reserved for the streak, the #1 rank and the gacha highlight; green appears exactly once, on the landing gacha CTA, so it reads apart from List; red is only for wrong or super zonk. The board reads like a leaderboard in a game you can win, not a table you inspect."
colors:
  primary: "#836EF9"
  primary-pressed: "#6D57D8"
  primary-edge: "#5B46C4"
  on-primary: "#FFFFFF"
  primary-soft: "#EDE9FE"
  secondary: "#C4B5FD"
  secondary-pressed: "#A78BFA"
  secondary-edge: "#8B6FE8"
  gold: "#FFC800"
  gold-pressed: "#E6A200"
  gold-edge: "#E5A100"
  error: "#FF4B4B"
  error-pressed: "#EA2B2B"
  error-edge: "#EA2B2B"
  success: "#836EF9"
  warning: "#FFC800"
  ink: "#2A2342"
  ink-muted: "#6B6480"
  ink-subtle: "#A7A1BA"
  canvas: "#FFFFFF"
  surface-1: "#F7F6FC"
  surface-2: "#EFEDF7"
  border: "#E8E5F4"
  border-strong: "#D6D1E8"
  inverse-canvas: "#12101D"
  inverse-surface: "#1E1A2E"
  inverse-ink: "#FFFFFF"
  inverse-ink-muted: "#B7B1C6"
  overlay: "rgba(18, 16, 29, 0.6)"
typography:
  display-xl:
    fontFamily: Nunito
    fontSize: 48px
    fontWeight: 800
    lineHeight: 1.10
    letterSpacing: -0.5px
  display-lg:
    fontFamily: Nunito
    fontSize: 40px
    fontWeight: 800
    lineHeight: 1.15
    letterSpacing: -0.4px
  display-md:
    fontFamily: Nunito
    fontSize: 32px
    fontWeight: 800
    lineHeight: 1.20
    letterSpacing: -0.2px
  headline:
    fontFamily: Nunito
    fontSize: 24px
    fontWeight: 800
    lineHeight: 1.25
    letterSpacing: 0
  subhead:
    fontFamily: Nunito
    fontSize: 20px
    fontWeight: 700
    lineHeight: 1.30
    letterSpacing: 0
  body-lg:
    fontFamily: Nunito
    fontSize: 18px
    fontWeight: 600
    lineHeight: 1.50
    letterSpacing: 0
  body:
    fontFamily: Nunito
    fontSize: 16px
    fontWeight: 600
    lineHeight: 1.50
    letterSpacing: 0
  body-sm:
    fontFamily: Nunito
    fontSize: 14px
    fontWeight: 600
    lineHeight: 1.45
    letterSpacing: 0
  caption:
    fontFamily: Nunito
    fontSize: 13px
    fontWeight: 700
    lineHeight: 1.30
    letterSpacing: 0
  eyebrow:
    fontFamily: Nunito
    fontSize: 13px
    fontWeight: 800
    lineHeight: 1.30
    letterSpacing: 0.8px
  button:
    fontFamily: Nunito
    fontSize: 16px
    fontWeight: 800
    lineHeight: 1.25
    letterSpacing: 0.4px
  button-sm:
    fontFamily: Nunito
    fontSize: 14px
    fontWeight: 800
    lineHeight: 1.25
    letterSpacing: 0.4px
rounded:
  none: 0px
  sm: 8px
  md: 12px
  lg: 16px
  xl: 24px
  pill: 9999px
  full: 9999px
spacing:
  xxs: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  xxl: 48px
  section: 64px
components:
  btn-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button}"
    rounded: "{rounded.lg}"
    padding: 14px 24px
    boxShadow: "0 4px 0 {colors.primary-edge}"
  btn-primary-pressed:
    backgroundColor: "{colors.primary-pressed}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button}"
    rounded: "{rounded.lg}"
    padding: 14px 24px
    boxShadow: "0 0 0 {colors.primary-edge}"
  btn-gacha:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button}"
    rounded: "{rounded.lg}"
    padding: 14px 24px
    boxShadow: "0 4px 0 {colors.secondary-edge}"
  btn-gold:
    backgroundColor: "{colors.gold}"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.lg}"
    padding: 14px 24px
    boxShadow: "0 4px 0 {colors.gold-edge}"
  btn-ghost:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.primary-pressed}"
    typography: "{typography.button}"
    rounded: "{rounded.lg}"
    padding: 14px 24px
    boxShadow: "0 4px 0 {colors.border}"
  btn-danger:
    backgroundColor: "{colors.error}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button}"
    rounded: "{rounded.lg}"
    padding: 14px 24px
    boxShadow: "0 4px 0 {colors.error-edge}"
  card:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
    padding: 20px
    border: "2px solid {colors.border}"
  list-row:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
    padding: 14px 16px
    border: "2px solid {colors.border}"
  list-row-hover:
    backgroundColor: "{colors.surface-1}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
    padding: 14px 16px
    border: "2px solid {colors.border-strong}"
  rank-badge:
    backgroundColor: "{colors.surface-1}"
    textColor: "{colors.ink-muted}"
    typography: "{typography.headline}"
    rounded: "{rounded.md}"
    padding: 6px 12px
  rank-badge-top:
    backgroundColor: "{colors.gold}"
    textColor: "{colors.ink}"
    typography: "{typography.headline}"
    rounded: "{rounded.md}"
    padding: 6px 12px
  hud-pill:
    backgroundColor: "{colors.surface-1}"
    textColor: "{colors.ink-muted}"
    typography: "{typography.caption}"
    rounded: "{rounded.pill}"
    padding: 6px 14px
  streak-pill:
    backgroundColor: "{colors.gold}"
    textColor: "{colors.ink}"
    typography: "{typography.caption}"
    rounded: "{rounded.pill}"
    padding: 6px 14px
  tab:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink-muted}"
    typography: "{typography.button-sm}"
    rounded: "{rounded.lg}"
    padding: 10px 18px
  tab-selected:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button-sm}"
    rounded: "{rounded.lg}"
    padding: 10px 18px
  gacha-card:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.headline}"
    rounded: "{rounded.xl}"
    padding: 28px
    boxShadow: "0 6px 0 {colors.primary-edge}"
  prize-reveal:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.display-md}"
    rounded: "{rounded.xl}"
    padding: 32px
    border: "3px solid {colors.primary}"
  input:
    backgroundColor: "{colors.surface-1}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: 12px 16px
    border: "2px solid {colors.border}"
  input-focused:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: 12px 16px
    border: "2px solid {colors.primary}"
  top-nav:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.subhead}"
    rounded: "{rounded.none}"
    height: 72px
  footer:
    backgroundColor: "{colors.inverse-canvas}"
    textColor: "{colors.inverse-ink-muted}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.none}"
    padding: 48px 24px
---

## Overview

BuzzMe does not look like the market it belongs to. Every other pay-to-rank board, and the surface
that inspired this one (outbid.lol), reads as dark, dense and clinical. BuzzMe takes the opposite tack
and borrows the entire feel of the **Duolingo app**, painted in **Monad purple**: one confident
**Monad Purple** (`{colors.primary}` #836EF9), chunky rounded geometry, a mascot who reacts to you,
streaks, and big candy buttons that visibly press down when tapped.

The mechanism underneath is serious (an on-chain auction for rank, a revenue-funded gacha). The look
is deliberately not, because a friendly frame is what makes a leaderboard something you open on
purpose. That is the whole design argument: **soft shapes, one confident purple, playful type**,
wrapped around a hard mechanism.

Monad's own brand is a single saturated purple on clean white or deep near-black, so the palette is
built around that: purple carries every action, a light lavender carries tints and borders, gold
carries the reward moments, and the neutrals are pulled slightly violet so nothing reads as a
generic gray. Red is used for exactly one meaning: wrong, rejected, or super zonk.

**Key characteristics:**

- **One action color.** Monad Purple carries every primary action (list, raise, spin) and the selected
  tab. There is no second brand color; the light lavender (`{colors.secondary}`) is only for tints and
  borders. The single exception is the landing gacha call to action, which is green (`#58CC02`) so it
  reads apart from the purple List button next to it.
- **Chunky, rounded, bordered.** Cards and rows use `{rounded.lg}` 16px with a 2px border, never a
  shadow. The only shadow in the system is the flat 4px edge under a button.
- **Buttons sit on an edge and press down.** Every button carries a solid `0 4px 0 <edge>` shadow that
  collapses to `0 0 0` on press, so the button physically moves. This is the Duolingo signature.
- **Rounded, heavy type.** Nunito at weight 800 for display and button, 600 for body. Headlines are
  bold and friendly, never thin.
- **Numbers in pills.** Rank, spend, pot, streak and level all render as rounded pills
  (`{rounded.pill}`), so every metric reads as a game stat.
- **Playful motion.** Wins get confetti and a bounce; a zonk gets a comedic shake; a super zonk gets a
  red flash and a "share again" prompt.
- **Rounded mascot, present everywhere.** "Bo", a friendly rounded board-and-coin character, reacts
  (cheers a win, shrugs a zonk). Working name; see the mascot note below.

---

## Colors

> Source pages: `/` (the board), `/list`, `/board/[key]`, `/dashboard` (the profile, which holds the
> gacha), `/docs`.

### Brand and action

| Token | Value | Use |
| --- | --- | --- |
| `{colors.primary}` | #836EF9 | Primary buttons, the selected tab, active states. |
| `{colors.primary-pressed}` | #6D57D8 | The pressed fill of a purple button. |
| `{colors.primary-edge}` | #5B46C4 | The flat 4px edge under a purple button. |
| `{colors.primary-soft}` | #EDE9FE | A very light purple tint for quiet surfaces. |
| `{colors.secondary}` | #C4B5FD | Light lavender: tints, borders, secondary accents. |
| `{colors.gold}` | #FFC800 | Streak flame, XP, the #1 rank badge, the gacha highlight. |
| `{colors.error}` | #FF4B4B | Wrong, rejected, or super zonk. |

### Neutrals and surfaces

- `{colors.canvas}` #FFFFFF is the page. `{colors.surface-1}` #F7F6FC is the inset surface (inputs,
  HUD pills). `{colors.border}` #E8E5F4 is every 2px card and row outline.
- `{colors.ink}` #2A2342 is the primary text, a deep violet near-black, never pure black.
  `{colors.ink-muted}` #6B6480 is secondary text, `{colors.ink-subtle}` #A7A1BA is disabled and
  placeholder.
- `{colors.inverse-canvas}` #12101D is the footer, the only dark surface above the page break.

### Semantics

- `{colors.success}` purple for confirmed. `{colors.warning}` gold for pending or at-risk.
  `{colors.error}` red for wrong, rejected, or super zonk. Feedback is rendered next to the control
  that caused it, never in a single block at the foot of the page.

---

## Typography

**Nunito** carries the whole hierarchy, as the free, rounded stand-in for Duolingo's proprietary
Feather. Display sizes run at weight **800**, the heavy friendly headline treatment; body sits at 600
for legibility at small sizes. The voice is warm, short and encouraging.

- **Display** (48 / 40 / 32px, 800): hero and page titles, the prize reveal.
- **Headline / subhead** (24 / 20px, 800 / 700): card titles, section heads.
- **Body** (18 / 16 / 14px, 600): all reading text. Line-height 1.50.
- **Eyebrow** (13px, 800, 0.8px tracking, uppercase): small labels above a heading.
- **Button** (16px, 800, 0.4px tracking): all button text, uppercase optional.

One rule: **no thin weights anywhere.** If it looks like a document, it is wrong.

---

## Layout

- **Board first.** On `/`, the ranked list is the hero. Interactive surfaces sit near the top; rules
  and prose live in `/docs`, never above the fold.
- **One column on mobile, a centred column on desktop.** The board is a list, not a grid, so it stays
  legible at every width. Max content width 720px for the board, 960px for two-up detail pages.
- **Rows, not tables.** Each listing is a `list-row`: rank badge, thumbnail, title, spend pill, and a
  Raise button. Rows are separated by 8px of space, not dividers.
- **Notes hide behind a "?".** The board's key facts (the pot, the daily share, "rank = what you pay")
  live in a help note whose panel opens inside the board screen, not as paragraphs on the page.
- **Spacing scale** `{spacing}` 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64. Section rhythm uses 64px.

---

## Components

- **btn-primary** (purple, 4px edge): the one loud action per screen (List, Raise, Spin).
- **btn-gacha** (purple gradient, deeper edge): the gacha call to action.
- **btn-gold**: streak or reward moments.
- **btn-green**: the landing gacha CTA only, the one non-purple action on the site.
- **btn-ghost**: tertiary, quiet actions.
- **card**: white, 16px radius, 2px border, 20px padding. No shadow.
- **list-row**: the billboard unit described above.
- **rank-badge**: gold for #1, surface pill for all others.
- **hud-pill / streak-pill**: the game stats.
- **tab / tab-selected**: the All-time / Today / Daily switch, purple when selected.
- **gacha-card**: the purple gradient spin surface with its own edge.
- **prize-reveal**: the big centered result card, purple border on a win, red on a zonk.
- **input**: inset lavender-gray, 2px border, purple border when focused.

---

## Motion

- **Press:** buttons translate down 4px as the edge shadow collapses. 80ms.
- **Win:** confetti burst plus a 1.05 scale bounce on the prize card. 600ms.
- **Zonk:** a quick horizontal shake, then a flat "better luck" line. 400ms.
- **Super zonk:** a red flash, then the share-again prompt slides up. 500ms.
- **Row move:** when a listing changes rank, it slides to its new position rather than snapping. 300ms.

Motion is expressive but short. Nothing blocks input for longer than the animation, and a win never
takes more than a second to celebrate.

---

## Voice

Warm, short, and a little playful, in the Duolingo register: congratulate wins, soften losses, never
lecture.

- Do: "You are #3. Two more USDC and you take the board."
- Do: "Zonk. Nothing this time, but your streak is safe."
- Do: "Super zonk. Share again to unlock tomorrow's spin."
- Do not: "Transaction reverted: insufficient allowance."
- Do not: "Rank is determined by cumulative USD-normalized spend."

Jargon stays in the explanation zone (the `/docs` page and the "?" note), not in the moment. Plain
words in the moment, precise words in `/docs`.

---

## Do and do not

- **Do** keep exactly one loud purple action per screen.
- **Do** put every number in a rounded pill.
- **Do** render feedback next to the control that caused it.
- **Do** hide instruction and rules behind a "?" affordance or in `/docs`, not as paragraphs on the
  board.
- **Do not** add drop shadows to cards (only buttons carry an edge).
- **Do not** use em dashes in copy (prefer commas and colons).
- **Do not** use thin type, hard corners, or a second brand color (the single green landing CTA is the
  only exception).
- **Do not** use red for anything other than wrong, rejected, or super zonk.

---

## The mascot

**"Bo"** is a friendly, rounded character made of a stack of little billboard tiles in Monad purple,
topped by a gold coin, with big white eyes. Bo appears small in the nav, cheers on a gacha win (arms
up and a confetti trail), shrugs on a zonk, and looks worried on a super zonk before holding out the
share button. Bo is the board's Duo.

This is a working name and a placeholder direction. Real art and a final name are an open decision.
