# Current volume migration design

Volume migration cannot be a Progress-only context swap. `volume-adjustments.ts` combines formula mechanics, eligibility, event/taper policy, record identity, and programme mutation. The approved sequence first extracts those boundaries, then migrates read-only Progress presentation last. Pending deload, watch, and eligibility never change volume; only an active deload may provide existing reduced-stress formula context.
