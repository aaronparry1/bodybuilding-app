import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { createOptionalAuthService, type AuthService, type AuthState } from "@/application/auth/auth-provider";
import { elapsedSince, recordStartupTelemetry, STARTUP_AUTH_DEADLINE_MS, StartupDeadlineError, withStartupDeadline } from "@/application/startup/startup-observability";
import { jsonStore } from "@/data/local/json-store";

// "Continue offline" used to live only in React state, so every cold launch
// dropped offline users back on the sign-in screen. Persist the choice.
const offlineModeKey = "iron-logic.auth-offline-mode-v1";

function readPersistedOfflineMode(): boolean {
  try {
    return jsonStore.get<boolean>(offlineModeKey, false) === true;
  } catch {
    return false;
  }
}

function persistOfflineMode(enabled: boolean): void {
  try {
    if (enabled) jsonStore.set(offlineModeKey, true);
    else jsonStore.remove(offlineModeKey);
  } catch {
    // Persistence is a convenience; the in-memory flag still governs this launch.
  }
}

interface AuthContextValue extends AuthState {
  isOfflineMode: boolean;
  /** Non-error guidance for the auth screen, e.g. "check your email". */
  notice: string | null;
  signUp(email: string, password: string): Promise<void>;
  signIn(email: string, password: string): Promise<void>;
  signOut(): Promise<void>;
  signInWithApple(): Promise<void>;
  signInWithGoogle(): Promise<void>;
  continueOffline(): void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function logAuthStage(stage: string) {
  if (process.env.NODE_ENV !== "production") {
    console.info(`[startup:auth] ${stage}`);
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [{ service, configError }] = useState(() => createOptionalAuthService());
  const [session, setSession] = useState<Session | null>(null);
  const [isOfflineMode, setIsOfflineMode] = useState(() => readPersistedOfflineMode());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(configError);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!service) {
      setIsLoading(false);
      setIsOfflineMode(true);
      logAuthStage("offline mode: no auth service");
      return;
    }

    let mounted = true;
    const startedAt = Date.now();
    recordStartupTelemetry({ stage: "auth", outcome: "started" });
    withStartupDeadline(service.getSession(), STARTUP_AUTH_DEADLINE_MS, "auth")
      .then((nextSession) => {
        if (mounted) setSession(nextSession);
        recordStartupTelemetry({ stage: "auth", outcome: "ready", durationMs: elapsedSince(startedAt) });
        logAuthStage(nextSession ? "session restored" : "no session");
      })
      .catch((nextError: unknown) => {
        if (mounted) {
          setError(nextError instanceof StartupDeadlineError ? "Session check timed out. Sign in again or continue offline." : "Unable to load session.");
          setIsOfflineMode(nextError instanceof StartupDeadlineError);
        }
        recordStartupTelemetry({ stage: "auth", outcome: nextError instanceof StartupDeadlineError ? "timeout" : "failed", durationMs: elapsedSince(startedAt), reason: nextError instanceof StartupDeadlineError ? "deadline" : "unknown" });
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    const unsubscribe = service.onAuthStateChange((nextSession) => {
      setSession(nextSession);
      if (nextSession) {
        setIsOfflineMode(false);
        persistOfflineMode(false);
      }
      setIsLoading(false);
      logAuthStage(nextSession ? "auth state: signed in" : "auth state: signed out");
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [service]);

  const runAuthAction = useCallback(async (action: (authService: AuthService) => Promise<void>) => {
    if (!service) {
      setError(configError ?? "Supabase is not configured.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setNotice(null);
    try {
      await action(service);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Authentication failed.");
    } finally {
      setIsLoading(false);
    }
  }, [configError, service]);

  const signOut = useCallback(async () => {
    persistOfflineMode(false);
    if (isOfflineMode && !session) {
      setIsOfflineMode(false);
      return;
    }
    setIsOfflineMode(false);
    await runAuthAction((authService) => authService.signOut());
  }, [isOfflineMode, runAuthAction, session]);

  const continueOffline = useCallback(() => {
    persistOfflineMode(true);
    setIsOfflineMode(true);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      session,
      isLoading,
      error,
      notice,
      isConfigured: Boolean(service),
      isOfflineMode,
      signUp: (email, password) => runAuthAction(async (authService) => {
        const outcome = await authService.signUp({ email, password });
        if (outcome?.requiresEmailConfirmation) {
          setNotice("Account created. Check your email for a confirmation link, then come back and log in.");
        }
      }),
      signIn: (email, password) => runAuthAction((authService) => authService.signIn({ email, password })),
      signOut,
      signInWithApple: () => runAuthAction((authService) => authService.signInWithApple()),
      signInWithGoogle: () => runAuthAction((authService) => authService.signInWithGoogle()),
      continueOffline,
    }),
    [continueOffline, error, isLoading, isOfflineMode, notice, runAuthAction, service, session, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider.");
  return context;
}

export function getUserId(user: User | null) {
  return user?.id ?? null;
}
