# resolveTrainingLane characterization harness

D4E3C4D10C2 adds test-only characterization for every reachable branch of the restored primitive `resolveTrainingLane` selector. The 17 fixtures lock current lane values, nullish tolerance, input immutability and planned-order/role precedence. No v2 expectations or authority inference are used.

Before any future candidate patch, capture `git diff --binary`, status, HEAD, focused results and full failure IDs. Compare candidate IDs with:

```sh
node scripts/compare-failure-ids.mjs baseline-failures.json candidate-failures.json
```

The candidate must be preserved under `qa-reports/legacy-migration-change-control/candidates/d4e3c4d10c/<candidate-id>/` before rollback. The next experiment is a sidecar-only lane observation, with primitive projection unchanged.
