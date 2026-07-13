# D4E3C4D3 final production authority observation map — blocked

## Six active non-observable categories

1. explicit slot override;
2. advanced method;
3. exercise-family collision;
4. explicit/inferred role collision;
5. corrective/recovery/power family branches;
6. planned-order lane and final generated-settings projection.

## Authority-point audit

The production path does not expose one immutable decision object. `resolveGeneratedSettings` selects lane, invokes set prescription, selects rep range, and assembles settings; `createGeneratedSlot` then consumes those settings while resolving load and downstream metadata. Rep and lane are therefore assigned in separate helper calls, and the final generated-settings object is mutable assembly data rather than a retained authority trace.

Adding an observer to an earlier helper would observe provisional values. Adding a callback to the final settings assembly would require threading it through an internal function that also owns deferred set/load/drop-off/suitability coupling. That is a structural decomposition, not output-neutral instrumentation. No safe narrow seam was identified without changing production control flow or creating a second authority model.

## Decision

No production observer was added. Existing test-only observations remain valid for ordinary branches. The six categories remain `final_authority_not_observable`; D4E3C4E caller migration remains blocked. A future decomposition must create one immutable final prescription decision boundary before observation can be safely attached.
