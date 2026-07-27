# Receipt and CAS

The application intent persists expected pre-state fingerprint, exact intended material deltas, target prescription identities, resulting-state fingerprint, and truthful receipt before CAS.

The numeric crash probe interrupted after CAS and before receipt persistence. Restart:

- identified the exact resulting carrier fingerprint;
- independently reconstructed committed structural deltas;
- verified those deltas were represented by the durable field-level intent;
- verified the intent and receipt delta fingerprints agreed;
- persisted one applied receipt containing actual committed numeric fields;
- removed the intent;
- did not apply another revision.

Protected P0 crash-window tests remain green. Numeric crash paths independently exercised here: 1/1 converged.
