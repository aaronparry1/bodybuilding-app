import type { CurrentProgressRecoveryContext } from "@/domain/training/current-progress-recovery-context";

/** Read-only recovery presentation input. It distinguishes warning evidence from an authorised recovery action. */
export type CurrentProgressRecoveryPresentationInput = Readonly<{
  context: CurrentProgressRecoveryContext;
  priority: boolean;
}>;

export function buildCurrentProgressRecoveryPresentationInput(context: CurrentProgressRecoveryContext): CurrentProgressRecoveryPresentationInput {
  return {
    context,
    priority: context.status === "recovery_recommended" || context.status === "recovery_active",
  };
}

export function isCurrentRecoveryAction(input: CurrentProgressRecoveryPresentationInput): boolean {
  return input.context.status === "recovery_recommended" || input.context.status === "recovery_active";
}
