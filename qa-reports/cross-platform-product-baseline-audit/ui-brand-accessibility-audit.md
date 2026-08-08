# UI, brand and accessibility audit

## Observed direction

Retained native captures show near-black backgrounds, graphite/navy cards, cream primary type, muted blue-grey secondary type and warm gold calls to action. This reads as premium strength coaching rather than a neon game. Large headings and set-completion targets are legible under fatigue. [directly verified from repository captures]

## Findings

| Severity | Finding | Evidence |
|---|---|---|
| High | Android appearance, keyboard, TalkBack, back gesture, safe areas and haptics have no visual/device evidence. | no Android capture/report found |
| High | Active Train introduces cyan and green as equally strong semantic/brand colors; gold disappears from the primary execution state, weakening identity and increasing semantic-color load. | native Train capture |
| High | Dense workout cards contain policy text, calibration status, set inputs and state labels simultaneously; useful information competes with the immediate “what do I do now?” action. | native Train capture |
| Medium | Muted grey labels and small uppercase metric labels may fail contrast/large-text legibility; no automated contrast calculation or Android large-text gate exists. | captures; static tokens |
| Medium | Nine-step onboarding review is a long scroll and duplicates “Your Programme” hierarchy; fatigue and small-screen completion risk. | onboarding capture |
| Medium | Hard-coded inline dimensions/styles remain in route screens; token primitives exist but are bypassed. | static scan: 40 direct hex occurrences in production UI/features |
| Medium | iPad is declared supported while product assumptions and captures are phone-first; layout/orientation has no iPad evidence. | app config/plist/captures |
| Medium | Reduced-motion behavior is not explicitly represented in the audited production UI. | static search |
| Low | Home and Plan repeat large explanatory blocks; clarity is high but vertical density delays later information. | captures |

Static scan found accessibility properties/max-font controls, but only 45 matching occurrences across production UI/features. Labels alone do not prove VoiceOver/TalkBack order, actions, focus restoration or dynamic-type layout.

## Proposed premium direction (not implemented)

- Keep black/graphite/cream and reserve restrained gold for brand/primary actions.
- Use cyan only for “current/interactive” and green only for confirmed completion; never as decorative accents.
- Make the current set the dominant one-handed control; collapse rationale into an accessible “Why this?” disclosure.
- Minimum 44x44 pt iOS / 48x48 dp Android targets, high-contrast numeric inputs, no color-only state.
- Define type ramps with tested 200% scaling, a sweat-mode large-control layout, reduced-motion substitutions, and platform-specific keyboard/back adapters.
- Certify 320x568, current small/large iPhones, representative compact/large Android, iPad portrait/landscape, VoiceOver and TalkBack.
