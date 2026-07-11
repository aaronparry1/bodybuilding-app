# Live Website Conversion Audit

Date: 2026-06-14

Website: `https://adaptivestrengthcoach.com`

Scope: cold-visitor conversion audit of the live Adaptive Strength Coach website after the rebuild. This audit did not change website code, app code, RevenueCat, or EAS.

References checked:

- Live Adaptive Strength Coach routes: `/`, `/download`, `/features`, `/pricing`, `/faq`, `/support`, `/privacy`, `/terms`, `/delete-account`
- Competitor positioning: Strong, Hevy, Boostcamp, JuggernautAI, RP Hypertrophy App, and spreadsheet/program-template alternatives

## Executive Summary

The rebuilt site is a major improvement over the previous version. It now describes the current product rather than an abandoned or old powerlifting-only app. A cold visitor can understand within 5-10 seconds that Adaptive Strength Coach is an auto-regulated strength and hypertrophy coaching app that adapts from logged performance.

The site now communicates the main product pillars:

- adaptive strength and hypertrophy coaching
- evidence-based prescription
- no RPE/RIR required
- Strength Dashboard
- PR and e1RM tracking
- Recovery & Capacity
- Recovery Windows
- Powerlifting Meet mode
- advanced reporting
- branded progress sharing

The biggest conversion weakness is not the core message. It is proof and purchase readiness.

The site currently makes a strong claim, but it does not yet fully prove it with:

- polished app-store-ready screenshots
- a concise above-the-fold product demo
- trust/social proof
- final store buttons
- final pricing/trial language
- clear "why pay" framing

Verdict: good enough as a truthful product website, not yet optimized as a paid acquisition landing page.

Build/no-build recommendation: no app build needed. Website should get one more conversion polish pass before paid launch or RevenueCat paywall rollout.

## Biggest Conversion Problems

### 1. The app cannot actually be downloaded yet

`/download` works and is no longer a dead route, which is important. But the store buttons are placeholders:

- "App Store"
- "Google Play"
- "Store links coming soon"

This is sensible pre-store readiness, but it means every primary CTA currently ends in a holding pattern.

Conversion impact: high. Cold visitors who are motivated cannot complete the desired action.

Recommended fix:

- When store listings are ready, replace placeholders with real App Store and Google Play badges.
- Keep `/download` as the stable smart-link route.
- On desktop, show both store badges plus a short reason to download.

### 2. Hero explains the product, but not the immediate payoff strongly enough

Current hero:

> Strength coaching that adapts to your actual performance.

This is clear and accurate. It tells a visitor what category the product occupies. But it could be sharper on the payoff.

What it implies:

- app adapts
- app is strength-focused
- performance matters

What it does not immediately say:

- "know exactly what to do next"
- "stop guessing progression"
- "see if you are getting stronger"
- "without spreadsheets or effort scoring"

Recommended hero refinement:

> Know what to lift next.

Supporting headline/subheadline:

> Adaptive strength and hypertrophy coaching that adjusts from your logged reps, loads, and fatigue signals.

Or:

> Strength and hypertrophy coaching that tells you when to push, hold, or pull back.

### 3. Screenshots are real, but not yet conversion-grade

The current screenshots are useful because they prove the product exists. However, several have Design QA banners, dense debug-ish context, or old fixture states. They feel honest, but not yet app-store polished.

Conversion impact: high.

Recommended fix:

- Capture clean production-style screenshots without Design QA banners.
- Prioritize:
  - Home: current block/week, next block, Recovery & Capacity if relevant
  - Train: differentiated set ranges
  - Workout Review: PR/baseline recommendation
  - Progress: Strength Dashboard and Advanced Reports
  - Powerlifting Meet: countdown/taper context
  - Share card preview with download footer

### 4. The site has no trust proof yet

Competitors lean heavily on credibility:

- Strong: trusted by millions and press quotes.
- Hevy: "14+ million athletes", ratings, community.
- Boostcamp: "1.2M+ users", "300M+ workouts logged", coach/program library.
- JuggernautAI: Chad Wesley Smith/Juggernaut brand, coach credibility, trial and community.
- RP: Dr. Mike Israetel, pro bodybuilders, pricing, testimonials, guarantee.

Adaptive Strength Coach currently has placeholders but not proof.

Recommended fix:

- Add "Built for serious lifters who want coaching logic, not random workouts" as positioning.
- Add beta/tester quotes when available.
- Add internal product proof now:
  - "Evidence-based set prescription"
  - "No RPE/RIR required"
  - "Strength Dashboard"
  - "Powerlifting Meet mode"
- Add public proof later:
  - beta users
  - workouts logged
  - PRs logged
  - app-store ratings once real

### 5. Pricing is truthful but not persuasive yet

Pricing page says "Price pending". That is correct for now, but it cannot convert paid users.

Recommended fix before monetization:

- show final monthly and annual prices
- show free trial length
- make annual the recommended option
- explain what premium unlocks
- explain restore/manage subscription

## Homepage Findings

### Hero

Does it explain the product in 5-10 seconds?

Yes, mostly.

The phrase "Auto-regulated strength & hypertrophy coaching" plus "adapts to your actual performance" is clear for the intended audience. Serious lifters will understand the category quickly.

Headline strength:

- Clear: yes
- Memorable: moderate
- Benefit-led: partial

It is accurate, but it could be more urgent and concrete. "Adapts to your actual performance" is a mechanism. "Know what to lift next" is a stronger outcome.

CTA:

- Clear: yes
- Primary CTA: Download the app
- Secondary CTA: See how it works

Problem: the download CTA currently leads to placeholder store links.

Premium feel:

Yes. Dark/gold branding, strong typography, and app screenshots feel more premium than the old site.

Product match:

Mostly yes. It now matches the current app's name, tone, and feature set better. The remaining mismatch is screenshot polish.

### Above-the-fold content

Working well:

- product category is clear
- no-RPE/RIR differentiator is visible
- e1RM/PR, Recovery & Capacity, and Powerlifting Meet are named early
- CTA is visible

Needs improvement:

- The hero screenshots are visually interesting but partially overlapping and not instantly legible.
- The hero copy is long enough that the first viewport may feel more explanatory than punchy.
- Add one line of "what you get today":
  - "A plan, today's workout, next load decisions, and progress reports."

## Positioning Findings

The site clearly explains:

- adaptive strength coaching: yes
- evidence-based workout prescription: yes
- autoregulation: yes
- Strength Dashboard: yes
- PR tracking: yes
- e1RM tracking: yes
- Recovery Windows: yes
- Powerlifting Meet mode: yes
- Advanced Reports: yes
- branded sharing: yes

Weakest explanations:

- Recovery Windows: named correctly, but not given a visual example.
- Advanced Reports: present, but still abstract without a dedicated screenshot.
- Branded sharing: mentioned, but no visible share-card preview on the live page.
- Powerlifting Meet mode: present, but should have a stronger dedicated section or page because it is high-intent.

## Conversion Findings

Would a cold visitor understand who it is for?

Yes, with some ambiguity.

The site says serious lifters, strength/hypertrophy, powerlifting meet, athletic performance, and Get Leaner. That is good. It could sharpen the main buyer:

> For lifters who want a coached plan that adapts, not a blank tracker or spreadsheet.

Would they understand the problem it solves?

Mostly.

Problems stated:

- random workouts
- static spreadsheets
- guessing progression
- generic set prescriptions

Could be stronger:

- "You logged the workout. Now what should change next?"
- "Most trackers record training. Adaptive Strength Coach decides the next training move."

Would they understand why it is different?

Yes compared with basic trackers. Partial compared with AI/coaching apps.

The no-RPE/RIR and evidence-based prescription claims are strong. The site should contrast more directly:

- Strong/Hevy: tracking-first
- Boostcamp: program-library-first
- JuggernautAI/RP: branded coaching-system-first, but uses different feedback models
- spreadsheets: static unless you manually update them

Would they understand why they should download?

Partially.

The current download reason is "this app is smart and structured." The stronger reason is:

> Download it to see your plan and start logging the evidence the coach uses.

Would they understand why it will be worth paying for?

Not yet.

The site names premium-worthy features, but it does not yet present a paid value stack:

- adaptive plan generation
- workout logging
- progression decisions
- Strength Dashboard
- advanced reports
- Recovery & Capacity
- Powerlifting Meet
- branded share cards

Pricing should eventually show "Premium includes" in a crisp list.

## Competitor Differentiation

### Strong

Strong positions around simple, intuitive workout tracking and planning, with large trust signals and press quotes. It is a mature tracker.

Adaptive Strength Coach differentiation:

- not just a logbook
- gives next-session coaching decisions
- evidence-based prescription architecture
- Recovery Windows and Powerlifting Meet mode

Current site effectiveness: good, but needs a clearer "trackers record; ASC coaches" contrast.

### Hevy

Hevy positions as the #1 free workout tracker/planner, with social/community motivation, huge user count, ratings, and easy logging.

Adaptive Strength Coach differentiation:

- less social/community
- more structured adaptive coaching
- no RPE/RIR
- goal/block-aware prescription

Current site effectiveness: good on coaching logic, weak on trust/social proof.

### Boostcamp

Boostcamp positions around free programs, expert/community routines, workout tracking, progressive overload, PRs, and very strong usage numbers.

Adaptive Strength Coach differentiation:

- not a program marketplace
- not "pick a plan and follow it"
- personalized ongoing prescription and fatigue-aware adaptation
- built around current user goal/block/history

Current site effectiveness: moderate. It says "not templates", but should more directly state "your plan adapts from your data."

### JuggernautAI

JuggernautAI owns a strong powerlifting/powerbuilding coaching identity, brand authority, individualized plans, feedback-adjusted programming, trial, and community.

Adaptive Strength Coach differentiation:

- broader strength/hypertrophy/recovery-capacity product
- no subjective RPE/RIR-style effort inputs
- stronger visible dashboard/reporting angle
- Powerlifting Meet mode without being only a powerlifting product

Current site effectiveness: partial. The site sounds credible, but JuggernautAI has stronger authority and offer proof. Adaptive Strength Coach needs visual proof and sharper "no subjective effort scoring" differentiation.

### RP Hypertrophy App

RP positions around hypertrophy, Dr. Mike Israetel, personalized recommendations, pump/soreness/workload feedback, bodypart specialization, technique videos, premium pricing, testimonials, and guarantee.

Adaptive Strength Coach differentiation:

- strength + hypertrophy + meet prep, not hypertrophy only
- performance evidence rather than pump/soreness subjective feedback
- Strength Dashboard/e1RM/PR reporting
- Recovery & Capacity without fat-loss claims

Current site effectiveness: good on scope, weak on authority/testimonials.

### Spreadsheets

Spreadsheets are flexible, cheap, and familiar, but require manual updating and usually do not adapt intelligently.

Adaptive Strength Coach differentiation:

- automatic next-session decisions
- controlled exercise rotation
- set-range boundaries
- fatigue/re-entry/recovery logic
- reports and review

Current site effectiveness: good. "Not a static spreadsheet" is one of the best lines on the page.

## Download Flow

### `/download`

Status: works.

Good:

- stable route exists
- no dead end
- copy explains store listings are not final
- App Store and Google Play placeholders are visible
- future smart-link behavior is explained
- no Firebase Dynamic Links dependency

Issues:

- "Store links coming soon" is honest but kills conversion.
- The page does not capture email or waitlist interest.
- Desktop visitors get no "notify me" path.

Recommended fixes:

- Add real store links as soon as listings exist.
- Until then, add optional email capture or "Join preview list."
- Add "Available soon on iOS and Android" if launch is not public yet.

### CTA routing

Good:

- Hero CTA points to `/download`.
- Header Download points to `/download`.
- Features/Pricing/FAQ also point to `/download`.

No dead ends found in route checks:

- `/`: 200
- `/download`: 200
- `/features`: 200
- `/pricing`: 200
- `/faq`: 200
- `/support`: 200
- `/privacy`: 200
- `/terms`: 200
- `/delete-account`: 200
- missing route: 404

### Mobile flow

Likely acceptable from CSS and device-detection script, but needs physical/mobile visual QA after final store links are present.

Risk:

- large hero type and overlapping phone stack may be visually heavy on small screens.
- store placeholders may look like disabled buttons.

## Visual Quality

### Colors

Strong. Dark/gold feels aligned with the app and share-card aesthetic. It feels more premium than the previous blue/emerald site.

Risk: the gold-on-dark system is strong, but the page can become visually heavy. Use brighter screenshot panels and more white/cream whitespace within cards to keep sections readable.

### Typography

Strong but aggressive.

The hero headline is bold and premium. It also takes up a lot of vertical space. On desktop this feels dramatic; on mobile it may push the key screenshot/CTA below the fold.

Recommended:

- Slightly tighten hero height.
- Add a shorter hero line or smaller max font on mobile.

### Screenshots

Current state: useful but not final.

Problems:

- some screenshots show Design QA banners
- some are not the strongest current screens
- some are too dense to read in the phone stack
- share-card preview is not visibly present

Recommended:

- capture clean marketing screenshots with production-like data
- crop or frame fewer phones above the fold
- add dedicated screenshot rows with captions instead of relying entirely on overlapping phone stack

### Spacing

Generally good. Premium card rhythm works.

Potential issue:

- top hero is visually heavy and may feel like a wall on smaller screens.

### Branding

Good. Logo and name are consistent. The app name is now dominant.

## Page-by-Page Findings

### `/`

Working:

- clear product category
- strong premium feel
- current features represented
- CTAs are visible
- footer/legal links are correctly demoted

Needs:

- stronger outcome-driven headline
- final clean screenshots
- visible share-card preview
- trust/social proof section
- more explicit "why pay" preview

### `/download`

Working:

- route exists
- smart-link explanation is clear
- store placeholders are honest
- no dead end

Needs:

- real store URLs
- optional waitlist/email capture while stores are pending
- mobile visual QA
- app-store badge assets

### `/features`

Working:

- current feature set is accurately represented
- good distinction between tracker/program template/coaching system
- covers Strength Dashboard, PRs, recovery, meet mode, sharing

Needs:

- more visual proof per feature
- stronger "what this feels like in the gym" examples
- fewer abstract feature names if aimed at cold traffic

### `/pricing`

Working:

- honest about pending prices
- correctly frames monthly, annual, trial, store-managed billing

Needs:

- final prices
- trial length
- feature entitlement list
- annual value framing
- restore/cancel confidence copy
- stronger "why premium" stack

### `/faq`

Working:

- answers good buyer objections
- no-RPE/RIR answer is strong
- Recovery Window and cardio answers are useful
- does not make medical claims

Needs:

- "What do I get for free?"
- "What happens after trial?"
- "Can I use it without a powerlifting meet?"
- "What if equipment is unavailable?"
- "Does it work offline?" if true/false

### `/support`

Working:

- simple
- support email clear

Needs:

- keep as footer-only
- add expected response time if desired
- add restore purchase instruction after RevenueCat

### `/privacy`

Working:

- basic coverage
- no obvious red flags

Needs:

- final provider list after RevenueCat/store integration
- subscription provider naming
- analytics provider naming if used

### `/terms`

Working:

- simple and appropriate
- includes not-medical-advice language
- mentions store-managed subscriptions

Needs:

- final legal review before paid launch
- final trial/renewal terms once products are live

### `/delete-account`

Working:

- clear route
- correct footer utility page
- tells user store subscriptions are separate

Needs:

- add in-app deletion steps if/when available
- add expected deletion timeframe

## Copy Issues

High-priority copy improvements:

1. Replace mechanism-heavy hero with outcome-heavy hero.
   - Current: "Strength coaching that adapts to your actual performance."
   - Recommended: "Know what to lift next."
   - Alternate: "A strength coach for your next training decision."

2. Add one stronger value proposition near the top:
   - "Most apps track what happened. Adaptive Strength Coach decides what should happen next."

3. Add "No RPE/RIR required" explanation in a sentence, not just a pill:
   - "No subjective effort scoring. The app uses logged reps, loads, drop-off, history, and fatigue signals."

4. Add paid value stack:
   - adaptive plan
   - workout logging
   - Workout Review
   - progression decisions
   - Strength Dashboard
   - PR tracking
   - advanced reports
   - Recovery & Capacity

5. Clarify Recovery & Capacity:
   - "Cardio is here to help you recover from the lifting that matters."

## Visual Issues

Priority visual issues:

1. Replace Design QA screenshots.
2. Add share-card preview visual.
3. Add a clean Strength Dashboard screenshot near the first half of the page.
4. Reduce hero phone-stack density if screenshots are hard to read.
5. Confirm mobile hero and `/download` page visually on iPhone-width screens.

## CTA Issues

Current CTA structure:

- Header: Download
- Hero: Download the app
- Secondary: See how it works

Good structure.

Current blockers:

- no real app store links
- no waitlist fallback
- no trial language in CTA

Recommended final CTA ladder:

- pre-store: "Join preview list" + "See features"
- store live, pre-paywall: "Download free" + "See how it works"
- subscription live: "Start free trial" + "See how it works"

## Recommended Fixes

### Critical before paid launch

1. Add real store links to `/download`.
2. Replace QA screenshots with clean production screenshots.
3. Publish final pricing/trial terms.
4. Add final subscription terms/provider references.

### High priority before acquisition

5. Strengthen hero around outcome.
6. Add trust/proof section.
7. Add share-card preview section.
8. Add "why pay" premium feature stack.
9. Add mobile visual QA screenshots.

### Medium priority

10. Add dedicated Powerlifting Meet page/section with stronger CTA.
11. Add dedicated Strength Dashboard/reporting page/section.
12. Add FAQ items about free/trial/offline/equipment.
13. Add email/waitlist capture while store links are placeholders.

## Priority Order

1. Store links or waitlist fallback on `/download`
2. Clean app screenshots
3. Hero copy refinement
4. Pricing/trial copy
5. Trust/proof section
6. Share-card visual proof
7. Mobile visual QA
8. FAQ expansion
9. Dedicated Powerlifting Meet and Reports pages

## Build / No-Build Recommendation

No app build is required.

Do not start RevenueCat purely from this audit.

The website is truthful enough to stay live, but not yet ready for serious paid conversion. The next website pass should focus on conversion proof:

- clean screenshots
- real store/download flow
- final pricing/trial
- trust proof
- sharper hero payoff

