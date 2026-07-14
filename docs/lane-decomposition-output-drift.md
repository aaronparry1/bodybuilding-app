# Lane decomposition output drift

The D4E3C4D10C candidate lane refactor produced one additional failing file and test, but the uncommitted candidate patch and failure output were not retained. The drift cannot be reproduced or classified from the repository state without inventing evidence, so lane decomposition remains blocked.

The restored production tree is unchanged and verifies at 15 failing files, 43 failing tests and 1,711 passing tests. The next attempt must use an isolated worktree, preserve the candidate diff, capture the exact failure-ID delta, and introduce no rich lane contract until the first divergence is known.
