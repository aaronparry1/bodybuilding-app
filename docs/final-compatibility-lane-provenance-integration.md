# Final compatibility lane provenance integration

D4E3C4D10C7 carries the private lane decision into the final compatibility decision without changing the primitive lane contract. Generated settings receive only the existing primitive lane value. The decision's source, branch ID, applied identity, planned-order class, role source, reason, and retention status remain internal and are copied at the final decision boundary.

There is one lane-selector evaluation per generated slot. No v2 resolver, persistence field, generated-workout field, formula input, or public API is introduced. Remaining authority-unavailable branches retain their explicit status.
