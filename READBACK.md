# Read-back: prototype → production

The source of truth is `TruDoc Gold Waitlist.dc.html`. The published artifact (claude.ai/artifact/KUZQ3dr2JZcTasA3Mnaigo) was checked against it and its content is identical. The two differ only in bundler attribute names.

## Screens and sections (in order)

**01 Landing `/`**
1. Top bar: logo, TruDoc wordmark and "Gold" badge
2. Hero: two chip marquees, glow, human image, H1, 3 feature rows, 2 price cards. It has no CTA.
3. How it works: 5 steps
4. Biomarkers accordion: 8 areas. Heart is open by default, and only one area is open at a time.
5. Conditions: 2 horizontally scrolling rows of 4 cards
6. Doctors: trust row (Google 4.8, 12k+ patients) and a carousel of 5 doctor cards
7. Pricing: 2 plan cards, then "Split your payment with" and the tabby and tamara logos
8. FAQ: 5 items, with index 3 open by default and one open at a time
9. Footer: contact details, star glow, giant wordmark, and a spacer below for the CTA
10. Sticky CTA: always visible

**02 Join the waitlist `/?join=1`**: back button; name, phone (+971) and plan fields; sticky submit panel

**03 You're on the waitlist `/?join=success`**: animated tick, heading with the first name, formatted phone number

## Copy

Every landing string and list is in [`lib/content.ts`](lib/content.ts), copied verbatim from the prototype. That includes curly quotes, intentional `\n` breaks and trailing spaces such as `'Kidney '` and `'Up to 4 members above 18+ '`. Copy that sits inline in components:

| Where | Copy |
| --- | --- |
| Hero H1 | Make proactive healthcare simple. |
| How it works h2 | How it works? / Complete health picture |
| Biomarkers h2 | We test 50+ biomarkers / across 9 health areas |
| Conditions | Track the signs before they become a bigger problem · See the health markers linked to common chronic conditions, so you can spot changes early and take action sooner |
| Doctors | Guided by doctors. / Proven by people. · Real experiences from people guided by / DHA & DHO licensed TruDoc doctors · Google · 4.8 Rating · 12k+ patients |
| Pricing | Join now before the / prices double · Only waitlist members get access to launch pricing when TruDoc Gold becomes available. · /day · Split your payment with |
| FAQ | FAQ |
| Footer | Contact · +971 551 21 6628 · info@trudocgroup.com · Office 701, Bay Square, Building 1, / Business Bay, Dubai, UAE |
| Sticky CTA | From AED 1/day · Limited-time launch price · Join waitlist for free |
| Form | Join the waitlist · We'll let you know as soon as TruDoc Gold launches, so you can join at the early-bird rate · Name · Enter your full name · Phone number · +971 · 50 123 4567 · Which plan are you interested in? · Free to join, with no payment now. We'll only / use these details to notify you · Join the waitlist / Joining… / Try again |
| Errors | Please enter your name · Please enter a valid name · Please enter your phone number · Please enter a valid UAE mobile number, e.g. 050 123 4567 · Please choose a plan · We couldn't add you to the waitlist. Please try again. |
| Success | You're on the waitlist {firstName} · We'll contact you on {+971 5X XXX XXXX} as soon as TruDoc Gold launches · There's nothing else you need to do. You can close this window. |

## Decisions where sources disagreed

| # | Topic | Decision |
| --- | --- | --- |
| 1 | **Phone `maxLength`** | The prototype uses 12, but the brief requires `+971 50 123 4567` (16 characters) to be valid. With 12, the input truncates that format to `+971 50 123 ` when it's typed, pasted or autofilled. **Raised to 16.** The validation rules are unchanged. |
| 2 | Radio colour | Gold `226,166,49`, per the brief. Figma's blue isn't used. |
| 3 | Input border transition | 0.15s, from the prototype. The brief says 0.2s. |
| 4 | `corner-shape: superellipse(1.6)` | The brief mentions it, but the prototype doesn't use it anywhere, so it isn't added. |
| 5 | framer-motion | Not used. The prototype's CSS keyframes are reproduced exactly (`tdExpand`, `tdCollapse`, `tdBlurIn`, etc.). |
| 6 | Form routing | In-page, with the URL kept in sync (`?join=1`, `?join=success`; see W1). Back, Forward and swipe-back all run the same collapse. A refresh on `?join=1` restores the form and keeps Back working. |
| 7 | Back button | Same visual position, with a 44×44 touch target, per the brief. |
| 8 | FAQ a11y | The prototype puts the answer inside the `<button>`. Here the question is the button (`aria-expanded`/`aria-controls`) and the whole row stays clickable, so the visuals and behaviour are unchanged. |
| 9 | Marquee chips | Marked `aria-hidden` because they're decorative and duplicated for the loop. They pause under reduced motion. |
| 10 | Trust row at 320px | It overflows and is clipped by the section, as in the prototype. |
| 11 | Form submit panel | Adds `env(safe-area-inset-bottom)` padding, per the brief's safe-area requirement. |
| 12 | Next.js version | 16 (latest). The brief says 14+. |
| 13 | Anti-abuse | Honeypot field plus a 1.5s minimum fill time. The timer survives a refresh, so restored progress isn't rejected as a bot. |

## Web / desktop version (`TruDoc Gold Waitlist Web.dc.html`)

These are the same components, data, copy, API and validation as mobile. Responsive variants apply from 768px. A geometry/typography diff against the web prototype shows no differences at 1440, 1280, 1100 and 1024px, or in the open modal at 1440px. The diff tool flags only one cosmetic item: the two-line headings, where I use `\n` and the prototype uses `<br>`. Both render identically.

| # | Topic | Decision |
| --- | --- | --- |
| W1 | URL | The web brief's `?join=1` and `?join=success` are used for **both** layouts, replacing the mobile `#join` and `#done`. A link shared from desktop then opens the form on a phone too. |
| W2 | Conditions at 768–999px | **2 columns, per the brief.** The prototype has no rule and stays at 4, which squeezes the cards at 768–900px. |
| W3 | `human.png` | It's 656px wide and soft on desktop. There's a TODO in `Hero.tsx` to swap in a 2x asset (≥1300px wide). |
| W4 | Doctors prev/next arrows | **Not added.** The brief says to ask first. The scroller has snapping and arrow-key scrolling. |
| W5 | Phone `maxLength` | 16 in the modal too (see decision 1). The web prototype still has 12. |
| W6 | Biomarker cards on mobile | **Changed at your request:** they're now full width with no 56px indent, matching the web prototype's no-indent rule. The mobile snapshot baseline includes this change. |

## Open questions for you

1. **OG image:** the brief asks for one. Please send one; the meta tags are ready.
2. **Duplicate flag:** the API returns `{ ok: true, duplicate: true }`, as the brief specifies. The UI never shows it, but anyone calling the API directly can use it to check whether a phone number is on the list. Should it be dropped?
3. **"9 health areas"** while only 8 areas are listed. The copy is kept as is.
4. **"Nutrionist"** (Danya Taha's role): a typo, kept verbatim.
5. **Pricing cards** have no CTA or plan preselect, as in the prototype. Do you want one?
7. **Doctors carousel arrows** on desktop: do you want prev/next buttons?
8. **A 2x `human.png`** (≥1300px wide) for desktop.
6. **Production domain**, for `NEXT_PUBLIC_SITE_URL`.

The Figma audit is partly out of date. The prototype now has real doctor photos, avatars, payment logos, step images numbered 1–5, every biomarker list and every FAQ answer, and the "?" on the last FAQ.

## Verification

- An automated geometry and typography diff compares the prototype with the build at 320, 375, 414 and 480px, on the landing and the form. It finds no differences beyond noise: alpha rounding of 179 vs 178, aria-hidden chips skipped by the script, and renamed image files.
- Playwright: 69 tests passing, including a mobile visual snapshot.
- Lighthouse on the production build:
  - Desktop: 100 / 100 / 100 / 100
  - Mobile: 93 / 100 / 100 / 100
  - CLS 0 on both
