import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { createOptionalAuthService, type AuthService, type AuthState } from "@/application/auth/auth-provider";
import { getAppEnvironment, isDesignQaModeAvailable, isDesignQaModeRequested } from "@/application/runtime/app-environment";
import { ensureDesignQaLocalWorkoutReadyState } from "@/application/design-qa/design-qa-fixtures";

interface AuthContextValue extends AuthState {
  isOfflineMode: boolean;
  signUp(email: string, password: string): Promise<void>;
  signIn(email: string, password: string): Promise<void>;
  signOut(): Promise<void>;
  signInWithApple(): Promise<void>;
  signInWithGoogle(): Promise<void>;
  continueOffline(): void;
  enterDesignQaMode(): void;
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
    if (isDesignQaModeRequested() && isDesignQaModeAvailable()) {
      ensureDesignQaLocalWorkoutReadyState(getAppEnvironment());
      setIsLoading(false);
      setIsOfflineMode(true);
      logAuthStage("design qa mode: auto-entered local protected app access");
      return;
    }

    if (!service) {
      setIsLoading(false);
      setIsOfflineMode(true);
      logAuthStage("offline mode: no auth service");
      return;
    }

    let mounted = true;
    service
      .getSession()
      .then((nextSession) => {
        if (mounted) setSession(nextSession);
        logAuthStage(nextSession ? "session restored" : "no session");
      })
      .catch((nextError: unknown) => {
        if (mounted) setError(nextError instanceof Error ? nextError.message : "Unable to load session.");
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

  const enterDesignQaMode = useCallback(() => {
    if (!isDesignQaModeAvailable()) {
      setError("Design QA Mode is only available in development and staging builds.");
      return;
    }

    ensureDesignQaLocalWorkoutReadyState(getAppEnvironment());
    setIsOfflineMode(true);
    logAuthStage("design qa mode: local protected app access");
  }, []);

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
      enterDesignQaMode,
    }),
    [continueOffline, enterDesignQaMode, error, isLoading, isOfflineMode, runAuthAction, service, session, signOut],
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
