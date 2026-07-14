# D4E3C4D10C5B — private selector guard revision map

The three former source-shape prohibitions were narrowed. The selector gate now permits a private implementation but requires a primitive exported façade and rejects duplicate façade branches. The sidecar gate permits private metadata but rejects external inference, duplicate evaluation and v2. The observation gate still rejects callbacks/options, telemetry and public provenance.

The exact captured production patch was reapplied without generated-settings or final-decision integration.
