# Current recommended set guidance slot persistence

E2E3D introduces a stable, versioned guidance-slot contract and pure exact lookup/update helpers. A slot owns one future recommended-min/max set pair and is identified by stable slot and parent programme IDs, never an array position. Updates require the expected target version and increment it once.

Active-plan integration is intentionally compatibility-safe: plans without persisted slots are explicitly unavailable to current guidance application. Constructor/repository migration remains E2E3E work; no legacy plan is upgraded lazily.
