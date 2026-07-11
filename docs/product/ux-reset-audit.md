# Iron Logic UX Reset Audit

## Target Journey

1. Start or resume training.
2. Log the next set with as little thought as possible.
3. See whether the exercise continues or stops.
4. Move to the next exercise or finish.
5. Review progress and the next useful coaching action.

## Information Architecture

The app should feel centred on training, not on navigation.

- Train: home, resume/start workout, active workout logger.
- Plan: preset programmes, current plan, custom plan, one-off session.
- Progress: recent workouts, coach actions, history, analytics.
- Library: exercise search, details, custom exercise creation.
- Account: subscription, sync, settings, diagnostics, logout.

Existing history and analytics detail routes stay available, but they should not compete as separate top-level tabs.

## Screen Audit

### Auth
- User goal: sign in, create account, or continue offline.
- Current friction: auth form appears before the product promise is clear.
- Unnecessary elements: Apple/Google placeholders compete with email and offline mode.
- Confusing elements: disabled login can feel broken before entering text.
- Primary action: continue offline or create account.
- Simplify: clearer promise, one email form, offline as a calm secondary path.

### Onboarding
- User goal: understand objective progression and set basic defaults.
- Current friction: too much concept text before action.
- Unnecessary elements: all principles receive equal visual weight.
- Confusing elements: long enum-like goal names.
- Primary action: start training.
- Simplify: three short principles, unit/experience choices, fewer words.

### Train
- User goal: know what to do now.
- Current friction: screen starts directly inside an exercise without a home decision.
- Unnecessary elements: links to several other areas compete with logging.
- Confusing elements: quick links make Train feel like navigation, not coaching.
- Primary action: resume workout / log next set.
- Simplify: make Train the home screen and active workout focus.

### Active Workout
- User goal: log the next set and know when to stop.
- Current friction: stats, prior session, and navigation all compete with the rep input.
- Unnecessary elements: quick links, previous session panel during active logging.
- Confusing elements: multiple status cards before the input.
- Primary action: log set.
- Simplify: exercise, load, current set, large reps, status, set history, next exercise.

### Programmes
- User goal: choose what to train.
- Current friction: reads like a catalogue.
- Unnecessary elements: too much programme metadata in list rows.
- Confusing elements: create programme and start session have equal weight.
- Primary action: start a plan/session.
- Simplify: rename to Plan, show continue/current plan first, then presets.

### Programme Detail
- User goal: inspect and start a day.
- Current friction: day/exercise data can overwhelm the start action.
- Unnecessary elements: excessive metadata before day start.
- Confusing elements: start programme vs start day wording.
- Primary action: start selected day.
- Simplify: make day CTAs obvious, keep exercise details compact.

### Programme Builder
- User goal: create a usable plan.
- Current friction: builder can feel like admin work.
- Unnecessary elements: dense controls on first view.
- Confusing elements: many fields appear equally important.
- Primary action: save plan.
- Simplify: keep as a secondary workflow, use clearer sections.

### Session Builder
- User goal: create a one-off workout quickly.
- Current friction: feels similar to programme creation.
- Unnecessary elements: persistent programme concepts.
- Confusing elements: save vs start.
- Primary action: start session.
- Simplify: choose exercises and start.

### Library
- User goal: find or add exercises.
- Current friction: library takes top-level weight equal to training.
- Unnecessary elements: full metadata in every row.
- Confusing elements: filters can dominate search.
- Primary action: search exercise.
- Simplify: search first, filters compact, details on tap.

### Exercise Detail
- User goal: understand settings and cues.
- Current friction: too many attributes can read like a database row.
- Unnecessary elements: repeated tags.
- Confusing elements: default settings vs workout settings.
- Primary action: use exercise.
- Simplify: cues and defaults first.

### History
- User goal: find recent completed workouts.
- Current friction: filters appear before any memory.
- Unnecessary elements: date/programme filters dominate empty history.
- Confusing elements: advanced filtering before there is data.
- Primary action: open recent workout.
- Simplify: move into Progress, recent workouts first, filters secondary.

### Workout Detail
- User goal: verify what happened.
- Current friction: detailed set data can be visually flat.
- Unnecessary elements: repeated labels.
- Confusing elements: progression result not prominent enough.
- Primary action: review exercise results.
- Simplify: exercise summaries first, set rows compact.

### Analytics
- User goal: know what to do next.
- Current friction: stat dump before advice.
- Unnecessary elements: too many metrics at equal priority.
- Confusing elements: advanced analytics lock appears mid-flow.
- Primary action: read coach action.
- Simplify: combine into Progress, advice first, charts below.

### Account
- User goal: subscription, sync, settings, logout.
- Current friction: account feels like an operations dashboard.
- Unnecessary elements: repeated status pills and dev controls too high.
- Confusing elements: mock/RevenueCat details are useful but not primary.
- Primary action: upgrade/manage settings depending state.
- Simplify: subscription, settings, sync diagnostics, logout.

### Paywall
- User goal: understand Pro and decide.
- Current friction: can feel like a generic SaaS wall.
- Unnecessary elements: too many benefit blocks.
- Confusing elements: placeholders vs real packages.
- Primary action: start/choose Pro.
- Simplify: promise, three benefits, package choices, restore secondary.

### Settings
- User goal: set defaults.
- Current friction: many app settings have equal weight.
- Unnecessary elements: account/subscription repeated.
- Confusing elements: technical defaults without training context.
- Primary action: save defaults automatically.
- Simplify: training defaults first, account/data lower.
