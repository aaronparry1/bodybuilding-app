import { useEffect, useState } from "react";
import { canonicalActivePlanState } from "@/application/training/canonical-active-plan-state";
import { readCanonicalPlanPresentation, type CanonicalPlanPresentation } from "@/application/training/canonical-plan-presentation";
import { readCanonicalProgressPresentation, type CanonicalProgressPresentation } from "@/application/training/canonical-progress-presentation";

export function useCanonicalPlanPresentation(input: Readonly<{
  displayUnit: "kg" | "lb";
  previewStatus?: "generating" | "recoverable_error" | "storage_error" | "empty";
}>): CanonicalPlanPresentation {
  const [projection, setProjection] = useState(() => readCanonicalPlanPresentation(input));
  useEffect(() => {
    const refresh = () => setProjection(readCanonicalPlanPresentation(input));
    canonicalActivePlanState.hydrate();
    refresh();
    return canonicalActivePlanState.subscribe(refresh);
  }, [input.displayUnit, input.previewStatus]);
  return projection;
}

export function useCanonicalProgressPresentation(input: Readonly<{
  displayUnit: "kg" | "lb";
  previewStatus?: "recoverable_error" | "storage_error" | "empty";
}>): CanonicalProgressPresentation {
  const [projection, setProjection] = useState(() => readCanonicalProgressPresentation(input));
  useEffect(() => {
    const refresh = () => setProjection(readCanonicalProgressPresentation(input));
    canonicalActivePlanState.hydrate();
    refresh();
    return canonicalActivePlanState.subscribe(refresh);
  }, [input.displayUnit, input.previewStatus]);
  return projection;
}
