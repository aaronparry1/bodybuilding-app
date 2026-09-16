import type { Session, User } from "@supabase/supabase-js";
import { getSupabaseClient, getOptionalSupabaseClient, type AppSupabaseClient } from "@/lib/supabase/client";

export interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  error: string | null;
  isConfigured: boolean;
}

export interface EmailPasswordCredentials {
  email: string;
  password: string;
}

export interface SignUpOutcome {
  /** True when Supabase created the account but requires the user to confirm their email before a session exists. */
  requiresEmailConfirmation: boolean;
}

export interface AuthService {
  getSession(): Promise<Session | null>;
  signUp(credentials: EmailPasswordCredentials): Promise<SignUpOutcome | void>;
  signIn(credentials: EmailPasswordCredentials): Promise<void>;
  signOut(): Promise<void>;
  signInWithApple(): Promise<void>;
  signInWithGoogle(): Promise<void>;
  onAuthStateChange(listener: (session: Session | null) => void): () => void;
}

export class SupabaseAuthService implements AuthService {
  constructor(private readonly client: AppSupabaseClient = getSupabaseClient()) {}

  async getSession(): Promise<Session | null> {
    const { data, error } = await this.client.auth.getSession();
    if (error) throw error;
    return data.session;
  }

  async signUp({ email, password }: EmailPasswordCredentials): Promise<SignUpOutcome> {
    const { data, error } = await this.client.auth.signUp({
      email,
      password,
      options: { data: { onboarding_source: "mobile" } },
    });
    if (error) throw error;
    return { requiresEmailConfirmation: !data.session };
  }

  async signIn({ email, password }: EmailPasswordCredentials): Promise<void> {
    const { error } = await this.client.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }

  async signOut(): Promise<void> {
    const { error } = await this.client.auth.signOut();
    if (error) throw error;
  }

  async signInWithApple(): Promise<void> {
    // Future integration point: use expo-apple-authentication on iOS, exchange the identity token with Supabase.
    throw new Error("Apple login is architected but not enabled yet.");
  }

  async signInWithGoogle(): Promise<void> {
    // Future integration point: use expo-auth-session Google provider, then exchange the OAuth token with Supabase.
    throw new Error("Google login is architected but not enabled yet.");
  }

  onAuthStateChange(listener: (session: Session | null) => void): () => void {
    const { data } = this.client.auth.onAuthStateChange((_event, session) => listener(session));
    return () => data.subscription.unsubscribe();
  }
}

export function createOptionalAuthService(): { service: AuthService | null; configError: string | null } {
  const { client, error } = getOptionalSupabaseClient();
  return client ? { service: new SupabaseAuthService(client), configError: null } : { service: null, configError: error };
}
