# Crash-window results

Tested transaction states:

1. CAS conflict before commit.
2. Process termination immediately before CAS.
3. Process termination immediately after CAS/before receipt.
4. Returned receipt persistence failure.
5. Restart from prepared pre-state.
6. Restart from exact committed result.
7. Duplicate restart after receipt reconstruction.
8. Concurrent equivalent application replay.
9. Semantic no-op.
10. Missing intent after committed decision.
11. Newer coaching carrier wins.
12. Conflicting committed state.
13. Receipt already persisted.

Converging paths: **13/13** reach applied, unchanged, or a truthful terminal
block. Non-converging paths: **0**. Duplicate applications: **0**.

An exact committed result reconstructs the receipt using the actual current
carrier and stored pre-carrier; it retains the one committed revision. Missing
or ambiguous evidence never fabricates a receipt and instead terminalises the
work item.
