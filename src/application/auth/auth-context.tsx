import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { createOptionalAuthService, type AuthService, type AuthState } from "@/application/auth/auth-provider";
import { elapsedSince, recordStartupTelemetry, STARTUP_AUTH_DEADLINE_MS, StartupDeadlineError, withStartupDeadline } from "@/application/startup/startup-observability";

interface AuthContextValue extends AuthState {
  isOfflineMode: boolean;
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
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(configError);

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
    try {
      await action(service);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Authentication failed.");
    } finally {
      setIsLoading(false);
    }
  }, [configError, service]);

  const signOut = useCallback(async () => {
    if (isOfflineMode && !session) {
      setIsOfflineMode(false);
      return;
    }
    setIsOfflineMode(false);
    await runAuthAction((authService) => authService.signOut());
  }, [isOfflineMode, runAuthAction, session]);

  const continueOffline = useCallback(() => setIsOfflineMode(true), []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      session,
      isLoading,
      error,
      isConfigured: Boolean(service),
      isOfflineMode,
      signUp: (email, password) => runAuthAction((authService) => authService.signUp({ email, password })),
      signIn: (email, password) => runAuthAction((authService) => authService.signIn({ email, password })),
      signOut,
      signInWithApple: () => runAuthAction((authService) => authService.signInWithApple()),
      signInWithGoogle: () => runAuthAction((authService) => authService.signInWithGoogle()),
      continueOffline,
    }),
    [continueOffline, error, isLoading, isOfflineMode, runAuthAction, service, session, signOut],
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
