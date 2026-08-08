# Backup and restore verification

Candidate 111 uses one versioned canonical backup envelope for plan, canonical sessions, progress evidence and settings. It no longer queues canonical sessions under an unsupported second entity type. Queue acknowledgement now requires owner-scoped remote readback; partial/mismatched content remains local and retryable. Programme, exercise and workout writes also require owner-scoped presence/readback, including workout exercise/set IDs.

Automated restore tests prove newer populated local data wins, cloud-only legacy sessions can be recovered, and empty/partial cloud state does not silently replace populated local state. Genuine cross-device restore remains a device gate because the available test account cannot authenticate.
