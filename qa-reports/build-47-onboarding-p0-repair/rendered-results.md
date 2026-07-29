# Rendered results

Rendered web checks used a 390 × 844 viewport and disposable local state.

| Journey | Result | Evidence |
| --- | --- | --- |
| Existing canonical plan with stale onboarding flag opens Home | **PARTIALLY PROVEN** | `screenshots/existing-user-home-390x844.png`; rendered offline/local path, not authenticated cloud restore |
| Explicit Settings restart opens onboarding | **PROVEN** | rendered route contained `restart=1` |
| Future schedule is 2–6 and visually distinct | **PROVEN** | `screenshots/onboarding-schedule-390x844.png` |
| Historical frequency is conditional and explanatory | **PROVEN** | `screenshots/onboarding-recent-routine-390x844.png`; break path removed the control |
| Review distinguishes “previously” from new schedule | **PROVEN** | `screenshots/onboarding-review-390x844.png` |
| Create Programme leaves onboarding and opens Home | **PROVEN** | `screenshots/programme-created-home-390x844.png` |
| Result is planned, Start workout, zero of five complete | **PROVEN** | rendered Home plus automated first-plan tests |
| Stale flag on ordinary root does not reopen onboarding | **PROVEN** | rendered navigation returned Home |
| Actionable failure state | **PARTIALLY PROVEN** | source and behavior tests; failure branch was not intentionally forced in rendered browser |
| Loading frame | **PARTIALLY PROVEN** | rAF yield and label verified; no mid-frame screenshot captured |
| Genuine new authenticated cloud user | **NOT PROVEN** | no isolated Supabase authentication environment was used |
| Genuine iPhone replacement | **NOT PROVEN** | no build or upload was authorized |

Browser console contained no critical uncaught errors. Missing Supabase configuration produced expected local/offline development information only.

