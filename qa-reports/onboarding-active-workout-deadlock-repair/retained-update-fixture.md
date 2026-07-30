# Retained-update fixture

The deterministic fixture models an update over the failed candidate without reinstalling or clearing storage:

- authenticated existing user identity;
- stale `onboardingCompleted: false`;
- canonical five-day hypertrophy carrier;
- planned first session;
- durable `started` or `paused` recorded session;
- plan-to-session identity;
- legacy unowned carrier requiring the established one-time owner binding;
- process/cache restart;
- no storage reset.

## Cases covered

The mounted regression suite covers:

1. stale flag plus plan;
2. stale flag plus active workout;
3. ledger-first hydration;
4. plan-first hydration;
5. onboarding metadata first;
6. delayed auth;
7. legacy ownership binding;
8. temporarily missing parent carrier;
9. unreadable relationship;
10. account mismatch;
11. failed read then retry;
12. duplicate effects;
13. termination during restore;
14. direct retained-data update;
15. two later restarts;
16. genuine new user;
17. signed-out user;
18. shared startup/create classification;
19. absent impossible warning;
20. Home/Plan/Train identity consistency;
21. byte-for-byte training-state preservation.

The fixture creates its plan and workout through canonical production applications. It does not pass isolated component props or fabricate a view model.
