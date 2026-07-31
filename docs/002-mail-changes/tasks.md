# 002 — Mail feedback tasks

Source: [raw.md](./raw.md)  
Status: open · not started unless noted

Attachments expected (not in raw.md):
- [ ] New club logo (header + footer)
- [ ] Updated photo of Lisa Matthieson (coaches)

---

## 1. Navigation & site chrome

- [ ] **Nav order** — Reorder main menu to match user intent:
  1. Training  
  2. Competitions  
  3. Membership / Join  
  4. About  
  5. Welfare / Safeguarding  
  6. Contact  
  > **Note (site check):** the proposed order omits **Club Merchandise** and **Members Login** — decide where they land. "Membership / Join" merges what is currently two separate top-level items (Membership dropdown + Join Us). "Contact" will be the **new Contact page** (see §8).
- [ ] **Footer — Swim England** — Add Swim England affiliate logo and link (club is Swim England affiliated).
  > **Note (site check):** footer already *says* "Swim England Affiliated" in the brand blurb and bottom bar — only the logo + link are missing.
- [ ] **Logo — header** — Replace club logo in the header with the new attached logo.
- [ ] **Logo — footer** — Replace club logo in the footer with the same new logo.
  > **Note (site check):** both `Nav.astro` and `Footer.astro` currently hotlink the logo from the old WordPress site (`torquayleander.co.uk/wp-content/uploads/2021/07/Logo.png`) — host the new logo locally in `public/` when replacing.

---

## 2. Home page

- [ ] **Hero banner** — Compress / de-emphasise main title banner (“Building Confidence…”) so it is less dominant.
- [ ] **News feed** — Add a Facebook page feed section titled **News**.
  > **Note (site check):** the Facebook page URL is already known — `facebook.com/TorquayLeanderSwimmingClub` (used in Footer, galas page, and home `/events` link). Only the **embed method** is still open.
- [ ] **Replace upcoming meets** — Put the News (Facebook) section in place of the current “Upcoming meets” block.
  > **Note (site check):** "Upcoming Meets" is not a standalone block — it's a sidebar `<aside>` in a two-column grid beside the welcome text on `index.astro`. Replacing it means reworking that grid layout.

---

## 3. About us

- [ ] **Facilities — electronic timing** — On the facilities highlight cards/windows, add:  
  *FINA Approved Electronic Timing* — Torquay Leander is proud to be the only club in Torbay and the surrounding areas to have Electronic Timing and Scoreboard which is used to enhance training and galas.
  > **Note (site check):** genuine add — timing currently only appears as a "Colorado Timing System" bullet in the equipment list on `/about/facilities/`; no fact card, no scoreboard mention, no "only club in Torbay" claim.
- [ ] **Facilities — diving blocks** — On the facilities highlight cards/windows, add:  
  *Diving Blocks* — We are fortunate to be the only club in Torbay to have FINA approved diving blocks, allowing us to train in real-world competition environments.
  > **Note (site check):** this is an **update, not an add** — `/about/facilities/` already has a fact card ("Diving Blocks on Every Lane — Only club in Torbay with permanent poolside blocks…"). Fold in the "FINA approved" + "real-world competition environments" wording.

---

## 4. Training & membership

- [ ] **Learn to Swim → Swim Torquay** — Add a button/link on stages 1–4 through to the Swim Torquay page.
  > **Note (site check):** the "Stages 1–4" card on `/training/learn-to-swim/` currently has no button, and the "Lessons are run by Swim Torquay" callout has no link either — the button could serve both. Swim Torquay URL still needed (see open questions).
- [ ] **Tab — Warm-up video** — Add a Warm Up Video tab (content TBD / linked from mail assets if provided).
- [ ] **Tab — Stretches** — Add a Stretches tab (content TBD / linked from mail assets if provided).
- [ ] **Training videos hub** — Add a section (or page area) for training videos / helpful guidance; link content to competition guides (e.g. “what to expect at your first gala”).

### 4a. Video links to include

Clean YouTube URLs (Outlook SafeLinks stripped). Playlist: `PLu-pVYBawZo5vXQBZU2fVrOuCL1U6Qak0`.

- [ ] **Nutrition advice** — Embed/link: https://www.youtube.com/watch?v=yLVoq8fZDys&list=PLu-pVYBawZo5vXQBZU2fVrOuCL1U6Qak0&index=5
- [ ] **Sports Psychology Support 1** — Add to training content: https://www.youtube.com/watch?v=LNu4xUo2P50&list=PLu-pVYBawZo5vXQBZU2fVrOuCL1U6Qak0&index=3  
  - [ ] Also add the same video on **Safeguarding / wellbeing**.
- [ ] **Sports Psychology Support 2** — Add to training content: https://www.youtube.com/watch?v=M_YyoZ7WsnU&list=PLu-pVYBawZo5vXQBZU2fVrOuCL1U6Qak0&index=11  
  - [ ] Also add the same video on **Safeguarding / wellbeing**.
- [ ] **Training video (index 21)** — https://www.youtube.com/watch?v=lJQxKumukI0&list=PLu-pVYBawZo5vXQBZU2fVrOuCL1U6Qak0&index=21
- [ ] **Training video (index 22)** — https://www.youtube.com/watch?v=ZDhQZtYxpLM&list=PLu-pVYBawZo5vXQBZU2fVrOuCL1U6Qak0&index=22
- [ ] **Training video (index 23)** — https://www.youtube.com/watch?v=oTA1COEj_00&list=PLu-pVYBawZo5vXQBZU2fVrOuCL1U6Qak0&index=23
- [ ] **Training video (index 24)** — https://www.youtube.com/watch?v=j_lAhRF5vQI&list=PLu-pVYBawZo5vXQBZU2fVrOuCL1U6Qak0&index=24
- [ ] **Training video (index 45)** — https://www.youtube.com/watch?v=F4AKzbqPPP0&list=PLu-pVYBawZo5vXQBZU2fVrOuCL1U6Qak0&index=45
- [ ] **Training video (index 53)** — https://www.youtube.com/watch?v=CfNoFpwLV4w&list=PLu-pVYBawZo5vXQBZU2fVrOuCL1U6Qak0&index=53
- [ ] **Training video (index 58)** — https://www.youtube.com/watch?v=EXW1WDLFxPw&list=PLu-pVYBawZo5vXQBZU2fVrOuCL1U6Qak0&index=58
- [ ] **Fetch titles** for untitled playlist items (index 21–24, 45, 53, 58) so UI labels are readable, not raw URLs.

---

## 5. Galas & competitions — banner & champions

- [ ] **Banner — Scott Ormsby** — Where “two-time Devon Mini League” is shown, add **2026 Scott Ormsby Champions**.
- [ ] **Banner — William Shield** — Same area: add **2026 William Shield Champions**.
  > **Note (site check):** confirmed anchor — the trophy banner on `/galas/` reads exactly "Torquay Leander are two-time Devon Mini League champions — 2024 and 2025."

---

## 6. Galas & competitions — Parent’s Guide

Add a **Gala & Competition Guide** (or “Swimming Galas – A Parent's Guide”) from the mail body. Implement as one page/section with the subsections below (or equivalent structure).

### 6a. Structure & intro

- [ ] **Page shell** — Create/update gala guide page with title and short intro.
  > **Note (site check):** `/galas/competition-guide/` already exists with **different content** (race starts, whistle signals, the four strokes) — none of which is in the mail. Merge the Parent's Guide around it; do not overwrite the existing sections.
- [ ] **What is a Swimming Gala?** — Definition: competition; practice training; racing experience.
- [ ] **Range of events** — Friendly beginner → National Championships; confidence, skills, PBs.
- [ ] **Licensed levels intro** — Licensed comps under Swim England Rules; four levels.

### 6b. Competition levels

- [ ] **Level 1** — Long Course (50m); National/Regional/County; qualifying for majors.
- [ ] **Level 2** — Short Course (25m); National/Regional/County; qualifying in 25m pool.
- [ ] **Level 3** — 25m or 50m; County/Regional and higher-level meet quals.
- [ ] **Level 4** — Entry-level licensed; intro to racing outside club; stepping stone to L3.
- [ ] **Club note** — Torquay Leander regularly competes L1–L3; newer swimmers start at L4.

### 6c. Heats & HDW

- [ ] **Heats** — More competitors than lanes → heats; seeded by entry times (slower early, faster late).
- [ ] **Heat Declared Winners (HDW)** — Common at L3/L4; no final; all heats ranked by time.
- [ ] **HDW example** — e.g. 40 swimmers / five heats of eight; win heat ≠ win event.
- [ ] **Heats + finals** — Higher level (County/Regional/National): heats then finals for some events.
- [ ] **Race own race** — Focus on best time, not only winning the heat.

### 6d. Course length & times

- [ ] **Short Course (SC)** — 25m pool.
- [ ] **Long Course (LC)** — 50m pool.
- [ ] **Advertised course** — Club gala notices state SC or LC.
- [ ] **Entry times** — Best time for full race distance, not one length.
- [ ] **SC vs LC examples** — 100 Free SC vs 100 Free LC definitions.
- [ ] **Entry form time type** — Forms specify SC, LC, or “all times as 25m (SC)”.
- [ ] **Why times differ** — More turns/push-offs in 25m → usually faster; SC/LC not directly comparable.
- [ ] **Time conversions** — Some LC meets seed on SC times; Regional/National often need LC quals; convert via Swim England system when needed.

### 6e. Roles at a gala

- [ ] **Volunteers intro** — Galas rely on volunteers (often swimming parents); invite interest.
- [ ] **Coach** — Prep, warm-up/cool-down, race plan, feedback, encouragement.
- [ ] **Team Manager (TM)** — Welfare, safety, organisation; Swim England trained + enhanced DBS.
- [ ] **TM duties** — Look after swimmers; act in their interests; warm-up/race readiness; marshalling escort; support coaches; need male & female TMs where possible; club cannot attend without TMs.
- [ ] **Starter** — Fair/safe race starts.
- [ ] **Timekeepers** — Record times; electronic timing + manual backup; Head Timekeeper role.
- [ ] **Judges and Referees** — Fair racing under Swim England rules; DQ decisions via Referee.

### 6f. What to bring

- [ ] **Kit list** — Two costumes (incl. race suit if owned); two goggles; two club hats; two towels; club T-shirt/hoodie; poolside footwear; water/sugar-free drinks; healthy snacks; full-day lunch; large bag; phone only if venue allows (often not on poolside).
- [ ] **Extras note** — Any meet-specific kit communicated before the event.

### 6g. What happens at a gala

- [ ] **Arrival** — Arrive early; report to TM; changing rooms / team base.
- [ ] **Warm-up** — Supervised; often boys/girls separate; TM/coach call times; coach sets warm-up.
- [ ] **Before racing** — Dry, race costume if needed, rest with team (chat, read, cards, music).
- [ ] **Marshalling** — TM → coach briefing → marshalling → heats → blocks.
- [ ] **The race** — Compete when called.
- [ ] **After the race** — Coach feedback; warm-down if available; dry, refuel, next event.
- [ ] **Going home** — Tell TM before leaving with parent/guardian after all races done.

### 6h. Medals, closing & links

- [ ] **Medals and awards** — Usually collected at the event (little time for formal presentations); **Club Championships** exception: awards night (usually January) for trophies/medals and celebration.
- [ ] **Final word** — Enjoyment, learn/improve, represent club; support teammates; PBs & sportsmanship as important as medals.
- [ ] **Link — individual best times** — http://www.swimmingresults.org/individualbest/
- [ ] **Link — individual rankings** — http://www.swimmingresults.org/individualrankings/
- [ ] **Link — membership / ASA number check** — https://www.swimmingresults.org/membershipcheck/
- [ ] **Link — licensed meets list** — https://www.swimmingresults.org/licensed_meets/
- [ ] **Copy-edit guide text** — Fix mail-export artifacts (`\*`), typos (e.g. achievements), tone pass once content is on the site.

---

## 7. Club Championships 2026

- [ ] **Year update** — Update Club Championships content to **2026**.
  > **Note (site check):** also reword the section heading ("2025 Club Championships") and the intro text ("Heat sheets from our most recent championships are below…") on `/galas/club-championships/`.
- [ ] **Remove heat sheets** — Remove existing heat sheet links for now (add later when available).
  > **Note (site check):** the current `programme` data has one entry per day with a `pdf` field and no session concept — Sun 15 Nov needs **two sessions**, so the data shape/rendering needs a small rework.
- [ ] **Session — Thu 5 Nov** — 400m Freestyle.
- [ ] **Session — Mon 9 Nov** — 100IM, 25 Backstroke (7 and under), 200 Breaststroke, 50 Backstroke, 100 Freestyle.
- [ ] **Session — Sun 15 Nov (1)** — 25 Butterfly (7 and under), 50 Butterfly, 100 Backstroke, 200 Freestyle.
- [ ] **Session — Sun 15 Nov (2)** — 25m Breaststroke (7 and under), 50m Freestyle, 100 Breaststroke.
- [ ] **Session — Thu 19 Nov** — 200IM, 25 Freestyle (7 and under), 50 Breaststroke, 200 Backstroke, 100 Butterfly.

---

## 8. Contact page

> **Note (site check / decision):** the site has **no contact page** — the "dark and heavy contact form" in the mail is the home page's "Ready to Dive In?" join section (the black card at `#contact`). **Decision: create a new standalone Contact page** reusing that same section, with the home page keeping its copy. The new nav "Contact" item (§1) links to it.

- [ ] **New Contact page** — Create `/contact/` reusing the home page contact/join section on its own page.
- [ ] **Lighter form UI** — Contact form section feels dark/heavy; use a lighter background.
- [ ] **Enquiry split (optional)** — Consider separate paths for membership vs general enquiries.

---

## 9. Coaches

- [ ] **Lisa Matthieson photo** — Replace existing photo with the attached image.
  > **Note (site check):** coaches on `/training/#coaches` are listed by first name only ("Lisa"), with the photo hotlinked from the old WordPress site — host the new photo locally when replacing. Surname spelling ("Matthieson") can't be verified from the site.

---

## Open questions / needs from club

- [ ] Confirm new logo file delivery and preferred formats (SVG/PNG).
- [ ] Confirm Lisa Matthieson photo delivery.
- [ ] Confirm Swim England logo assets + official URL for affiliate link.
- [ ] Confirm Swim Torquay URL for Learn to Swim stages 1–4 button.
- [ ] Confirm Facebook **embed method** for News feed (plugin, manual posts, etc.). ~~Page URL~~ — already known: `facebook.com/TorquayLeanderSwimmingClub`.
- [ ] Decide where **Club Merchandise** and **Members Login** sit in the new nav order (omitted from the mail's proposed order).
- [ ] Confirm titles for unnamed training playlist videos (or fetch from YouTube).
- [ ] Confirm where Warm-up / Stretches media lives.
- [ ] Confirm preferred home for Parent’s Guide (new page under Galas vs long section on galas index).
