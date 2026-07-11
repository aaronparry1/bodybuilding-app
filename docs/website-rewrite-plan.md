# AdaptiveStrengthCoach.com Website Rewrite Plan

Date: 2026-06-14

Scope: audit of the live website at `https://adaptivestrengthcoach.com` against the current Adaptive Strength Coach app. This audit did not change app code, did not implement RevenueCat, and did not start an EAS build.

## 1. Executive Summary

The live site is not the abandoned/original version, but it is still describing an earlier, narrower product: a powerlifting and strength programming app with generic readiness-based adaptation. It does not yet reflect Adaptive Strength Coach 2026 as the app currently exists.

The strongest current site messages are:

- "Strength coaching that changes when your training does."
- rules-based programming rather than random workouts
- powerlifting/powerbuilding focus
- store-managed subscriptions
- support/privacy/terms readiness

The biggest gaps are:

- no real download route even though share cards use `https://adaptivestrengthcoach.com/download`
- no clear explanation of the current goal set
- weak coverage of Strength Dashboard, e1RM, PRs, Advanced Reports, Recovery & Capacity, Recovery Windows, evidence-based prescriptions, Power/Peak blocks, and branded sharing
- outdated "readiness inputs" framing that does not match the app's no-RPE/RIR, performance-based philosophy
- pricing is described structurally but not conversion-ready
- screenshots appear generic/old and do not show the current premium app surfaces

Recommendation: rewrite the site before subscription/paywall launch. The product is now strong enough that the website should sell the actual coaching system, not a vague training-engine promise.

Build/no-build recommendation: do not start a preview build because of the website alone. But do not launch paid acquisition or rely on share-card links until `/download` exists and the home page reflects the current product.

## 2. Current Website Problems

### Product being described

The current website describes:

- adaptive powerlifting/strength programming
- block/DUP/conjugate-style planning
- readiness-based adjustments
- main-lift-oriented programming
- store-managed subscriptions

It partially matches the current product, but it misses the broader Adaptive Strength Coach 2026 proposition:

- Build Muscle
- Build Strength
- Build Muscle & Strength
- Get Leaner
- Athletic Performance
- Powerlifting Meet
- Recovery & Capacity
- Strength Dashboard and reporting
- branded progress sharing

### Positioning mismatch

Current site positioning:

> "Adaptive programming for powerlifting and strength"

This undersells the current product. The app is now an auto-regulated strength and hypertrophy coach, with powerlifting meet prep as a major mode rather than the only spine.

Recommended positioning:

> Adaptive Strength Coach is a performance-based strength and hypertrophy coach that builds your plan, adjusts your workload, tracks strength progress, and helps you recover without asking for RPE or guesswork.

Short hero option:

> Strength and hypertrophy coaching that adapts to what you actually do.

Supporting copy:

> The app uses logged loads, reps, history, fatigue signs, block context, and consistency to decide when to push, hold, pull back, rotate exercises, or consolidate progress.

### CTA problems

Current primary CTA:

- "See plans" anchors to pricing

Problems:

- no app download CTA in the hero
- no `/download` route
- pricing exists before final product/billing architecture is implemented
- no trial CTA
- closing CTA points to support/privacy, not conversion

Recommended CTAs:

- primary: "Download the app" or "Start free trial" once subscriptions are ready
- secondary: "See how it works"
- footer/secondary: "View pricing"

### Broken/missing download path

`https://adaptivestrengthcoach.com/download` currently returns:

> Not found

This is a critical mismatch because share-card payloads are designed to use that URL. The image card itself will not be clickable on most platforms, so the caption link must work.

Required fix:

- create `/download`
- iPhone/iPad -> App Store URL when available
- Android -> Google Play URL when available
- desktop/unknown -> landing page with both store buttons or coming-soon capture
- do not use Firebase Dynamic Links

## 3. Messaging Gaps

### Current app capabilities not clearly explained

| Current app capability | Website coverage | Gap |
|---|---:|---|
| Adaptive workout generation | partial | Mentions programme generation, but not current goal/block/session architecture |
| Evidence-based prescription architecture | weak | Mentions evidence-led, but not slot-specific prescriptions, set ranges, soft caps, or core guarantees |
| Adaptive progression | partial | Mentions adjustments, but not push/hold/pull back or consolidation |
| Strength Dashboard | missing | No clear e1RM/current/best/30-day/90-day dashboard message |
| e1RM tracking | missing | This is a major "am I getting stronger?" proof point |
| PR tracking | missing | No visible emotional/progress reward message |
| Advanced reporting | missing | "Charts that mean something" is too vague |
| Recovery Window architecture | missing | Site uses peaking/restoration language, not current Recovery Window philosophy |
| Recovery & Capacity system | missing | No cardio/recovery-capacity positioning |
| Powerlifting Meet mode | partial | Mentions meet dates, but not meet countdown, peak/taper, specificity, meet-week readiness |
| Fatigue management | partial | Mentioned generally, but not exercise/muscle/systemic fatigue separation |
| Volume learning | missing | No explanation that the app learns muscle volume tolerance |
| Power and Peak blocks | weak | Not explained as distinct block types |
| Social sharing | missing | No branded PR/progress share-card story |
| No RPE/RIR required | missing | Current copy says "readiness inputs", which can imply subjective scoring |

### Copy that should change

Current:

> "Readiness, missed work, swaps, added sets, session difficulty, and recent trends all feed into what happens next..."

Issue:

- "session difficulty" may imply subjective RPE/RIR.
- The current app intentionally avoids RPE/RIR inputs.

Replace with:

> The app watches logged loads, reps, completed sets, drop-off, swaps, fatigue signals, history, and block context. No RPE spreadsheet required.

Current:

> "Linear, block, DUP, and conjugate-style planning all live inside one consistent framework..."

Issue:

- This may overpromise visible programme style selection if normal users are not choosing all of those systems directly.

Replace with:

> The plan uses structured blocks, stable main lifts, controlled variation, and goal-specific phases instead of random daily workouts.

## 4. Visual Gaps

### What works

- dark premium aesthetic
- clean panels and cards
- strong logo presence
- consistent type system
- broadly compatible with the app's dark/gold training feel

### What does not match the app strongly enough

- Website accent color is blue/emerald. The current app and share cards lean dark/gold/cream with a stronger gym-premium feel.
- Phone screenshots appear generic/older and do not show the current best surfaces.
- No visible branded share card examples.
- No Strength Dashboard / Progress reporting screenshots.
- No Workout Review screenshot.
- No Recovery & Capacity card screenshot.
- No Powerlifting Meet roadmap/taper screenshot.

Recommended visual direction:

- keep dark premium base
- shift accent system closer to app/share-card gold + cream, with restrained blue only for data/reporting
- replace generic phone stack with current app screenshots:
  - Home current block/week + next block
  - Train overview with differentiated set ranges
  - Workout Review with PR/baseline
  - Strength Dashboard
  - Recovery & Capacity card
  - Powerlifting Meet taper/roadmap
  - branded PR share card

## 5. Recommended Positioning

Primary positioning:

> Adaptive Strength Coach is an auto-regulated strength and hypertrophy coach.

Short value proposition:

> It builds your plan, tracks what you actually complete, and adjusts your next training decision from performance evidence.

Differentiation:

- not random workouts
- not a static spreadsheet
- no RPE/RIR required
- main lifts stay stable enough to progress
- accessories rotate with purpose
- recovery is coached, not ignored
- progress is visible through e1RM, PRs, reports, and review

Best audience:

- serious recreational lifters
- strength-focused hypertrophy lifters
- powerbuilding users
- powerlifters preparing for a meet
- athletes who need strength/power with fatigue control
- people leaning out who want to preserve strength and muscle

Hero recommendation:

Headline:

> Strength coaching that adapts to your actual performance.

Subheadline:

> Adaptive Strength Coach builds evidence-based strength and hypertrophy plans, tracks reps and loads, manages fatigue, and tells you when to push, hold, or pull back.

CTA:

- "Download the app"
- "See how it works"

Proof strip:

- Evidence-based set prescriptions
- e1RM and PR tracking
- Recovery & Capacity coaching
- Powerlifting Meet mode
- iPhone and Android

## 6. Recommended Page Structure

### Launch-ready navigation

Recommended top nav:

- How it works
- Features
- Powerlifting Meet
- Reports
- Pricing
- FAQ
- Download

Move these to footer only:

- Support
- Privacy
- Terms
- Delete account

### Home page structure

1. Hero
   - clear product category
   - primary download/trial CTA
   - current app screenshots

2. Trust/problem section
   - "Not random workouts. Not a static spreadsheet."
   - explain why adaptive coaching matters

3. How it works
   - Build the plan
   - Log the work
   - Review the evidence
   - Adapt the next decision

4. Coaching engine
   - Push / Hold / Pull Back
   - Evidence-based prescriptions
   - Rep range occupancy
   - Fatigue separation
   - Volume learning

5. Training blocks
   - Hypertrophy
   - Powerbuilding
   - Strength
   - Power
   - Peak
   - Recovery Window

6. Progress proof
   - Strength Dashboard
   - e1RM tracking
   - PR tracking
   - Advanced Reports

7. Recovery & Capacity
   - recovery cardio as work-capacity support
   - timing guidance
   - not fat-loss guilt

8. Powerlifting Meet mode
   - countdown
   - specificity
   - peak/taper
   - meet-week readiness

9. Share progress
   - branded PR/progress cards
   - privacy-safe sharing

10. Pricing / trial
   - monthly
   - annual
   - trial
   - restore/manage through stores

11. FAQ
   - who it is for
   - no RPE/RIR
   - not medical advice
   - what happens if you miss workouts
   - how recovery/cardio works
   - powerlifting meet support

### Recommended supporting pages

Home:

- main conversion page

Features:

- all product systems in one place

How It Works:

- training theory in plain English

Pricing:

- subscription/trial details once RevenueCat products are final

Powerlifting Meet:

- dedicated page for high-intent traffic

Strength Dashboard:

- dedicated progress/reporting page if screenshots are strong

Download:

- smart app-store routing and desktop fallback

FAQ:

- buyer objections and product truthfulness

Support/Privacy/Terms/Delete:

- footer utility pages

## 7. Recommended Offer Structure

Do not publish final prices yet, but prepare the website for:

- monthly subscription
- annual subscription
- free trial
- entitlement: `premium`

Recommended offer:

- 14-day free trial after onboarding/plan preview
- annual plan visually recommended
- monthly available for flexibility

Why:

- The app's value is felt after seeing a plan and completing 2-5 workouts.
- A trial fits adaptive coaching better than a pure pay-before-value wall.
- Annual makes sense for long training cycles, Powerlifting Meet prep, and progress reports.

Recommended pricing page copy:

> Start with a free trial. Build your plan, log your first sessions, and see how the app adjusts before the subscription begins.

Avoid:

- fat-loss guarantees
- medical/recovery claims
- "AI coach" unless the product actually exposes AI coaching
- fake limited-time urgency

## 8. Priority Website Changes

### Critical

1. Build `/download`.
   - Required because share-card captions point there.
   - Without it, social sharing becomes a dead-end acquisition loop.

2. Replace hero copy.
   - Current copy is reasonable but too narrow and too generic.
   - It should sell performance-based adaptive strength and hypertrophy coaching.

3. Replace screenshots.
   - Use current app screens and share-card previews.
   - Screenshots are the fastest way to prove the app is real and polished.

4. Remove "Delete account" from main nav.
   - Keep it in footer.
   - Main nav should be conversion/product focused.

### High priority

5. Add Strength Dashboard / PR / e1RM section.
   - This answers the buyer's core question: "Am I getting stronger?"

6. Add Recovery & Capacity section.
   - Important because it differentiates cardio as recovery/work-capacity support, not calorie guilt.

7. Add Powerlifting Meet section/page.
   - Current site is powerlifting-heavy but does not explain the new meet countdown/taper engine.

8. Add current block architecture section.
   - Hypertrophy, Powerbuilding, Strength, Power, Peak, Recovery Window.

9. Add "No RPE/RIR required" messaging.
   - This is a real product differentiator.

### Medium priority

10. Add advanced reporting section.
    - Strength, volume, recovery/capacity, consistency reports.

11. Add branded sharing section.
    - Show PR/progress cards and make the app promotion loop obvious.

12. Add buyer FAQ.
    - "What if I miss a week?"
    - "Does it work for Get Leaner?"
    - "Is cardio required?"
    - "Does it replace a coach?"
    - "Is it only for powerlifters?"

13. Add app-store readiness assets.
    - same screenshot set can support website and store listings.

## 9. Recommended Implementation Order

1. Create `/download` route.
   - Store URLs can be configurable placeholders until final listings are live.
   - Desktop fallback should show both store buttons or "coming soon" capture.

2. Rewrite homepage hero and top-level positioning.
   - Make the app category clear in the first viewport.

3. Replace nav.
   - Product/conversion links in header.
   - Legal/support links in footer.

4. Capture current app screenshots.
   - Home
   - Train overview
   - Workout Review
   - Strength Dashboard
   - Progress reports
   - Recovery & Capacity
   - Powerlifting Meet roadmap/taper
   - PR share card

5. Add product sections.
   - Coaching engine
   - Training blocks
   - Strength Dashboard / Reports
   - Recovery & Capacity
   - Powerlifting Meet
   - Sharing

6. Prepare pricing/trial page.
   - Keep prices configurable until product IDs and store metadata are final.

7. Update policy/support pages only where needed.
   - Current support/privacy/terms are serviceable.
   - Privacy should eventually name actual providers once RevenueCat/store setup is final.

8. Add app-store marketing assets.
   - feature graphic
   - 6-8 screenshots
   - short description
   - long description
   - keywords
   - subscription/trial disclosure copy

## App Store Readiness Assets Needed

Website/store screenshot set:

- Home with current block/week and next block
- Train overview with differentiated set ranges
- Workout Review with PR/baseline recommendations
- Strength Dashboard with e1RM trends
- Recent PRs / PR history
- Advanced Reports
- Recovery & Capacity card with timing guidance
- Powerlifting Meet countdown/taper
- branded share-card preview

Copy assets:

- one-line store subtitle
- short App Store description
- long Play Store description
- subscription/trial disclosure
- privacy nutrition/provider details
- support URL
- terms URL
- delete-account URL
- download smart-link route

Suggested store subtitle:

> Auto-Regulated Strength Coaching

Suggested short description:

> Build strength and muscle with evidence-based training that adapts to your logged performance.

## Build / No-Build Recommendation

No app build is required for this audit.

Do not begin paid acquisition or treat share cards as acquisition-ready until `/download` exists.

The website should be rewritten before RevenueCat/paywall launch so the funnel is coherent:

share card -> `/download` -> store listing/site -> app onboarding -> plan preview -> trial/paywall.
