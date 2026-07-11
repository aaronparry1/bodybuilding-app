# Apple Search Ads Readiness

Date: June 22, 2026

## Executive Summary

Adaptive Strength Coach is not quite ready for paid Apple Search Ads spend yet.

Verdict:

```text
Do not launch paid campaigns yet.
```

The app is live and the product page is much stronger than the original listing, but the current live App Store page still has conversion weaknesses that would waste early ad budget:

- 0 ratings / 0 reviews.
- Developer name still appears as `DAVID PARRY`, not `ARX Algorithms`.
- Subtitle is `Adaptive strength programming`, which is accurate but weak for high-intent search.
- First live screenshot appears to be `02-build-muscle-build-strength.png`, while the stronger direct-response screenshot `01-stop-guessing-start-progressing.png` appears later.
- No app preview video found.
- Public Apple lookup data shows no screenshot URLs, while the web page does show screenshots. This suggests listing propagation/metadata surfaces are not fully consistent yet.

Recommended launch state:

```text
Wait until the screenshot order is corrected, subtitle is improved, and the app has at least 5-10 honest early reviews.
```

Small test spend can start before 10 reviews only if the goal is learning rather than profit.

## Sources Checked

Live App Store listing:

```text
https://apps.apple.com/gb/app/adaptive-strength-coach/id6762462649
```

Apple lookup API:

```text
https://itunes.apple.com/lookup?id=6762462649&country=gb
```

Local marketing assets:

```text
docs/app-store-conversion-pack/
docs/app-store-metadata-batch-1.md
```

Apple Ads references:

- Apple Ads overview: `https://ads.apple.com/app-store`
- Apple Ads placements: `https://ads.apple.com/app-store/help/ad-placements/0081-ad-placement-options`
- Custom product pages: `https://developer.apple.com/app-store/custom-product-pages/`

Apple states that App Store ads can appear in Today tab, Search tab, Search Results, and Product Pages. Apple also states Search Results ads target people based on direct search intent, and that custom product pages can be used for tailored ad creative and destinations.

## Part 1 - App Store Listing Audit

### App Name

Live:

```text
Adaptive Strength Coach
```

Assessment:

Strong. It includes `Strength Coach`, which is high-intent and relevant.

Likely indexed terms:

- adaptive
- strength
- coach
- adaptive strength
- strength coach

Issue:

The word `Adaptive` can also attract irrelevant adaptive-fitness/disability-fitness searches. This is manageable with negative keywords later.

Grade:

```text
A-
```

### Subtitle

Live:

```text
Adaptive strength programming
```

Assessment:

Accurate but not aggressive enough for paid acquisition. It repeats `Adaptive` and `strength` from the title, which may waste subtitle space. It also does not include terms like `workout`, `gym`, `tracker`, `powerlifting`, `hypertrophy`, or `progressive overload`.

Better subtitle options:

```text
Gym Workout Planner
Strength & Hypertrophy
Progressive Gym Planner
Workout Tracker + Coach
Strength Training Plan
```

Best current recommendation:

```text
Strength & Hypertrophy
```

Reason:

It is concise, search-relevant, and clarifies the app is for serious lifting rather than general fitness.

Grade:

```text
C
```

### Promotional Text

Public listing surfaces do not reliably expose promotional text, but the local draft says:

```text
Train with evidence-based workouts that adapt to your performance, recovery, PRs, and strength trends.
```

Assessment:

Good feature coverage, but slightly technical. For Search Ads, promotional text matters less than title, subtitle, screenshots, ratings, and product page fit.

Suggested improvement:

```text
Stop guessing your training. Follow adaptive strength and hypertrophy workouts that adjust from your real performance.
```

Grade:

```text
B
```

### Keywords Field

The keyword field is not public, so this audit uses the local metadata draft.

Local draft:

```text
gym,workout tracker,hypertrophy,powerlifting,progressive overload,PR tracker,e1RM,1RM,training plan
```

Assessment:

Solid but could be tightened. Apple indexes title/subtitle separately, so avoid repeating terms already used in title/subtitle. If subtitle changes to `Strength & Hypertrophy`, the keyword field should avoid `strength` and possibly avoid `hypertrophy` if space is needed.

Recommended keyword field if subtitle stays as current:

```text
gym,workout tracker,hypertrophy,powerlifting,progressive overload,PR tracker,e1RM,1RM,training plan
```

Recommended keyword field if subtitle becomes `Strength & Hypertrophy`:

```text
gym,workout tracker,powerlifting,progressive overload,PR tracker,e1RM,1RM,gym log,training plan
```

Grade:

```text
B
```

### Description

Live description:

The listing clearly explains:

- structured strength and hypertrophy coaching
- target zones
- performance-based recommendations
- e1RM tracking
- PRs and reports
- Recovery Windows
- Recovery & Capacity
- Powerlifting Meet planning
- no RPE/RIR requirement

Assessment:

The description is truthful and comprehensive. It is slightly feature-heavy, but it is credible. For cold paid traffic, the first two lines could be more emotional and outcome-led.

Recommended opening:

```text
Stop guessing what to do in the gym.

Adaptive Strength Coach gives you structured strength and hypertrophy workouts that adjust from your real logged performance.
```

Grade:

```text
B+
```

### Screenshots

Live screenshot filenames detected from the web listing:

```text
02-build-muscle-build-strength.png
07-built-for-real-lifters.png
06-powerlifting-covered.png
05-train-hard-recover-smart.png
04-know-when-youre-improving.png
01-stop-guessing-start-progressing.png
```

Local conversion pack includes valid screenshot sizes:

```text
1242x2688
1284x2778
1290x2796
1320x2868
```

Assessment:

The screenshots are outcome-led, which is good. However, the live order is not optimal. The strongest paid-traffic opener is:

```text
STOP GUESSING. START PROGRESSING.
```

That screenshot should be first. Paid App Store traffic often makes a very fast decision; the first screenshot must explain the core promise instantly.

Recommended order:

1. `01-stop-guessing-start-progressing.png`
2. `02-build-muscle-build-strength.png`
3. `03-your-roadmap-already-planned.png`
4. `04-know-when-youre-improving.png`
5. `05-train-hard-recover-smart.png`
6. `06-powerlifting-covered.png`
7. `07-built-for-real-lifters.png`

Current grade:

```text
B-
```

Potential grade after reorder:

```text
A-
```

### App Preview Video

No app preview video found in public data.

Assessment:

Not a blocker. For a new strength app, static screenshots are enough for the first Search Ads test. A video can come later once the funnel is proven.

Grade:

```text
B
```

### Ratings and Reviews

Live:

```text
0 ratings
0 reviews
```

Assessment:

This is the biggest conversion risk after screenshot order. For high-intent Search Ads, users may still install a new app with 0 reviews if the screenshots are excellent, but paid conversion rates are likely weaker.

Grade:

```text
D
```

### Developer Name

Live:

```text
DAVID PARRY
```

Assessment:

This is not fatal, but it weakens trust compared with `ARX Algorithms`. It makes the product feel less like a polished software brand.

Grade:

```text
C
```

## Likely Indexed Keywords

Based on public listing data and local keyword draft, Apple is likely indexing:

High relevance:

- adaptive strength coach
- strength coach
- adaptive strength programming
- strength programming
- strength
- hypertrophy
- powerlifting
- workout tracker
- gym
- training plan
- PR tracker
- 1RM
- e1RM
- progressive overload

Medium relevance:

- gym planner
- workout planner
- strength training
- workout log
- gym log
- recovery
- fitness coach

Potentially irrelevant:

- adaptive fitness
- disability fitness
- physical therapy style adaptive exercise
- rehab
- mobility workout

The word `adaptive` is valuable for product positioning but may create irrelevant search impressions unless negative keywords are used.

## Part 2 - Search Intent Mapping

### Group A - Strength

Example keywords:

- strength training app
- strength coach
- strength program
- progressive overload
- powerlifting app
- 1rm tracker
- e1rm tracker
- PR tracker

Intent quality:

```text
High
```

Competition:

```text
Medium to high
```

Likely acquisition cost:

```text
Medium
```

Why:

These users are closest to the product. They understand structured training and are more likely to value progression, e1RM, PRs, and planning.

Priority:

```text
Highest
```

### Group B - Workout Tracker

Example keywords:

- workout tracker
- gym log
- gym tracker
- workout planner
- gym workout app
- workout log

Intent quality:

```text
Medium to high
```

Competition:

```text
High
```

Likely acquisition cost:

```text
Medium to high
```

Why:

This is a large market, but users may only want logging, not coaching. Adaptive Strength Coach must position itself as “more than a workout tracker.”

Priority:

```text
Second
```

### Group C - Hypertrophy

Example keywords:

- hypertrophy
- hypertrophy app
- bodybuilding workout
- muscle building app
- build muscle app
- strength hypertrophy

Intent quality:

```text
High
```

Competition:

```text
Medium
```

Likely acquisition cost:

```text
Medium
```

Why:

These users understand goal-specific training and may be willing to pay if the app feels more structured than a generic tracker.

Priority:

```text
High
```

### Group D - Recovery & Capacity

Example keywords:

- recovery training
- mobility workout
- strength recovery
- low back strength
- recovery workout

Intent quality:

```text
Low to medium
```

Competition:

```text
Medium
```

Likely acquisition cost:

```text
Unknown / likely inefficient initially
```

Why:

This group may attract users looking for rehab, mobility, pain relief, or general wellness. That does not match the core paid promise strongly enough yet.

Priority:

```text
Defer
```

## Part 3 - Conversion Readiness Grades

```text
Screenshots: B-
Subtitle: C
Description: B+
Keyword coverage: B
Trust signals: D+
Overall Apple Search Ads readiness: C+
```

### Why Not Ready Yet

The app is close, but not ready to spend meaningful money.

Blocking or near-blocking issues:

1. Screenshot order is wrong for ad traffic.
2. Subtitle is not search-efficient.
3. 0 reviews creates trust friction.
4. Developer name is still personal rather than brand.

Not blockers:

- Description is solid.
- App name is strong.
- Product feature set is legitimate.
- Screenshots exist in valid App Store dimensions.
- Subscription/legal requirements appear covered.

## Part 4 - Campaign Structure

Do not start campaigns until the launch recommendation items are complete.

When ready, use Apple Ads Advanced, not Basic.

Apple Search Results should be the first placement because it captures direct intent. Avoid Today tab, Search tab, and Product Page placements until the Search Results economics are proven.

### Campaign 1 - Brand

Purpose:

Protect brand searches and capture people who hear about the app elsewhere.

Daily budget:

```text
£2-£5/day
```

Keywords:

- adaptive strength coach
- A.S.C.
- asc strength coach
- adaptive strength

Match:

```text
Exact
```

### Campaign 2 - Strength

Purpose:

Primary acquisition.

Daily budget:

```text
£10/day initially
```

Keywords:

- strength training app
- strength coach
- strength program
- progressive overload
- powerlifting app
- 1rm tracker
- e1rm tracker
- PR tracker

Match:

```text
Exact first, then controlled broad after data.
```

### Campaign 3 - Workout Tracker

Purpose:

Compete against logbook apps by positioning ASC as a smarter tracker.

Daily budget:

```text
£5-£10/day initially
```

Keywords:

- workout tracker
- gym tracker
- gym log
- workout log
- workout planner
- gym workout app

Match:

```text
Exact only at launch.
```

### Campaign 4 - Hypertrophy

Purpose:

Capture muscle-building users who want structured training.

Daily budget:

```text
£5-£10/day initially
```

Keywords:

- hypertrophy app
- hypertrophy
- bodybuilding workout
- muscle building app
- build muscle app
- strength hypertrophy

Match:

```text
Exact first.
```

### Do Not Launch Yet - Recovery & Capacity

Reason:

Too likely to pull rehab/mobility/pain-intent traffic. This feature supports the core app; it should not be the first paid acquisition hook.

### Negative Keyword Ideas

Add as negatives if Apple starts matching broadly:

- free
- home only
- yoga
- pilates
- running
- cycling
- weight loss
- calories
- diet
- meal plan
- rehab
- physiotherapy
- physical therapy
- injury
- disability
- adaptive disability
- kids
- senior
- chair workout
- no equipment
- bodyweight only
- crossfit

Use negatives carefully. Do not block `powerlifting`, `hypertrophy`, `bodybuilding`, `gym`, or `strength`.

## Part 5 - First 30-Day Plan

### Before Day 1

Required:

1. Reorder screenshots so `STOP GUESSING. START PROGRESSING.` is first.
2. Change subtitle to a higher-intent version.
3. Confirm the first screenshot appears correctly on the live App Store page.
4. Get at least 5 honest early reviews if possible.
5. Confirm subscription pricing/trial display is clean in-app.
6. Confirm App Store product page shows current icon and not placeholders.

### Starting Budget

Conservative learning budget:

```text
£20/day total for 7 days
```

Suggested split:

```text
Brand: £2/day
Strength: £8/day
Workout Tracker: £5/day
Hypertrophy: £5/day
```

If installs/trials are poor, stop quickly rather than waiting 30 days.

### Metrics to Watch

Track:

- impressions
- taps
- tap-through rate
- downloads
- tap-to-download conversion
- trial starts
- trial-start rate from download
- paid conversions
- cost per trial
- cost per subscriber
- keyword-level spend
- keyword-level trial starts

Minimum viable reporting:

```text
Keyword -> Taps -> Downloads -> Trial starts -> Paid conversions
```

### Pause Rules

Pause a keyword if:

- 20+ taps and 0 downloads.
- 10+ downloads and 0 trial starts.
- Spend reaches 2x expected monthly subscription revenue with no trial.
- Tap-through rate is very low relative to other keywords.
- Search term clearly mismatches serious lifting intent.

### Scaling Rules

Increase budget only when:

- a keyword produces trial starts at acceptable cost;
- install-to-trial behavior is visible;
- the product page conversion rate is stable;
- no single keyword is spending without trials.

Increase slowly:

```text
+20-30% budget every 3-4 days
```

Do not scale from installs alone.

### 30-Day Milestones

Week 1:

- Test exact-match Strength, Workout Tracker, and Hypertrophy.
- Identify obvious waste.
- Pause non-converting keywords.

Week 2:

- Keep winners.
- Add Search Match or broad match only in separate discovery ad groups with low budget.
- Start testing one custom product page if available.

Week 3:

- Build specific product pages:
  - Strength / powerlifting page
  - Hypertrophy page
  - Workout tracker replacement page

Week 4:

- Compare conversion by page.
- Keep only keywords that produce trials or strong download-to-trial behavior.
- Decide whether Apple Ads can scale.

## Part 6 - Review Acquisition

Do not buy reviews, gate features for reviews, or incentivize ratings.

### First 10 Reviews

Use real users:

- beta testers
- current gym contacts
- friends who genuinely train and use the app
- early subscribers

Ask after they have completed at least one real workout.

Good wording:

```text
If the app is helping your training, an honest App Store review would really help us improve and reach more lifters.
```

### First 25 Reviews

Add in-app review prompt timing:

- after completing 3-5 workouts;
- after a PR;
- after a positive Workout Review;
- not immediately after onboarding;
- not after a crash, restore issue, failed purchase, or fatigue/recovery warning.

Use Apple’s native review prompt, not a custom review-gating flow.

### First 50 Reviews

Build lightweight lifecycle asks:

- TestFlight-to-App-Store migration note.
- Email/support follow-up after positive interaction.
- Social post asking real users for honest feedback.
- Prompt users who share a PR card and return to the app.

Avoid:

- “Leave 5 stars.”
- “Review us for a reward.”
- blocking features until review.
- prompting too early.

## Expected Risks

### 1. Search Ads Before Reviews

0 reviews may suppress conversion, especially for a paid/trial subscription app.

Risk:

```text
High
```

### 2. Screenshot Order

The live first screenshot is not the strongest direct-response screenshot.

Risk:

```text
High
```

### 3. Keyword Competition

Workout tracker terms are competitive and may pull users who only want free logging.

Risk:

```text
Medium-high
```

### 4. Adaptive Keyword Ambiguity

`Adaptive` may attract adaptive-fitness/disability-fitness searches.

Risk:

```text
Medium
```

### 5. Subscription Trust

New app, 0 reviews, individual developer name, and subscription model together can reduce paid conversion.

Risk:

```text
Medium-high
```

## Launch Recommendation

Recommendation:

```text
Do not start Apple Search Ads yet.
```

Move to limited Search Ads only after:

1. First screenshot is `STOP GUESSING. START PROGRESSING.`
2. Subtitle is changed to a higher-intent phrase.
3. At least 5 honest reviews are collected, ideally 10.
4. App Store page confirms screenshots are live in the correct order.
5. Trial/paywall/subscription flow remains stable in production.

Then launch:

```text
Apple Ads Advanced
Search Results only
Exact match only
£20/day total
7-day learning phase
```

## Final Grade

Current Apple Search Ads readiness:

```text
C+
```

After screenshot reorder, subtitle improvement, and 5-10 reviews:

```text
B+ / A-
```

That is the point where spending becomes sensible rather than hopeful.
