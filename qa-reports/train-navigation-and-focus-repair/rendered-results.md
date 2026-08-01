# Rendered results

Verdict: **NOT PROVEN** for the repaired current source.

The production-root web development server successfully started and the same production bundle exported successfully. However, the configured in-app browser-control runtime reported no available browser. The locally available iOS Simulator did not contain a development binary built from this repair; its installed production app predates this source. Creating a current native binary is explicitly prohibited by this task.

Consequently no screenshots, tap traces or viewport measurements for the repaired source are claimed. In particular, these requested visual statements remain unverified by interaction:

- current set and Complete Set visible without scrolling;
- no safe-area, keyboard, rest-panel or overlay obstruction;
- switcher open/closed geometry;
- later-exercise selection;
- minimise/Resume rendered affordances;
- fully complete versus incomplete menu presentation.

Source structure and deterministic contracts establish compact ordering and interaction counts, but source inspection and unit tests are not substituted for rendered evidence. Genuine iPhone verification remains **NOT PROVEN** until a later authorised candidate contains repair commit `71333d4` and is physically exercised.
