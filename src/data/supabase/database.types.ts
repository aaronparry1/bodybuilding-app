export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: { id: string; email: string | null; display_name: string | null; created_at: string; updated_at: string };
        Insert: { id: string; email?: string | null; display_name?: string | null; created_at?: string; updated_at?: string };
        Update: { email?: string | null; display_name?: string | null; updated_at?: string };
        Relationships: [];
      };
      exercises: {
        Row: {
          id: string;
          user_id: string | null;
          created_by_user_id: string | null;
          name: string;
          category: string;
          primary_muscles: string[];
          secondary_muscles: string[];
          equipment: string[];
          movement_pattern: string;
          default_rep_range: Json;
          default_rep_range_min: number;
          default_rep_range_max: number;
          default_load_jump: number;
          unit_compatibility: string[];
          kind: string;
          exercise_kind: string;
          exercise_role: string;
          exercise_roles: string[];
          exercise_family: string;
          exercise_tier: string;
          fatigue_cost: string;
          joint_stress: string;
          suitability: string[];
          is_beginner_friendly: boolean;
          is_advanced: boolean;
          notes: string[];
          suitable_blocks: string[];
          swap_tags: string[];
          is_custom: boolean;
          default_settings: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          created_by_user_id?: string | null;
          name: string;
          category?: string;
          primary_muscles?: string[];
          secondary_muscles?: string[];
          equipment?: string[];
          movement_pattern?: string;
          default_rep_range?: Json;
          default_rep_range_min?: number;
          default_rep_range_max?: number;
          default_load_jump?: number;
          unit_compatibility?: string[];
          kind?: string;
          exercise_kind?: string;
          exercise_role?: string;
          exercise_roles?: string[];
          exercise_family?: string;
          exercise_tier?: string;
          fatigue_cost?: string;
          joint_stress?: string;
          suitability?: string[];
          is_beginner_friendly?: boolean;
          is_advanced?: boolean;
          notes?: string[];
          suitable_blocks?: string[];
          swap_tags?: string[];
          is_custom?: boolean;
          default_settings: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["exercises"]["Insert"]>;
        Relationships: [];
      };
      programmes: {
        Row: {
          id: string;
          user_id: string;
          created_by_user_id: string | null;
          name: string;
          description: string | null;
          goal: string;
          experience_level: string;
          days_per_week: number;
          notes: string | null;
          is_custom: boolean;
          is_preset: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          created_by_user_id?: string | null;
          name: string;
          description?: string | null;
          goal?: string;
          experience_level?: string;
          days_per_week?: number;
          notes?: string | null;
          is_custom?: boolean;
          is_preset?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["programmes"]["Insert"]>;
        Relationships: [];
      };
      programme_days: {
        Row: { id: string; user_id: string; programme_id: string; name: string; day_order: number; created_at: string };
        Insert: { id?: string; user_id: string; programme_id: string; name: string; day_order: number; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["programme_days"]["Insert"]>;
        Relationships: [];
      };
      planned_exercises: {
        Row: {
          id: string;
          user_id: string;
          programme_day_id: string;
          exercise_id: string;
          planned_order: number;
          settings: Json;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          programme_day_id: string;
          exercise_id: string;
          planned_order: number;
          settings: Json;
          notes?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["planned_exercises"]["Insert"]>;
        Relationships: [];
      };
      workout_sessions: {
        Row: {
          id: string;
          user_id: string;
          template_id: string | null;
          programme_id: string | null;
          name: string;
          started_at: string;
          completed_at: string | null;
          sync_state: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          user_id: string;
          template_id?: string | null;
          programme_id?: string | null;
          name: string;
          started_at: string;
          completed_at?: string | null;
          sync_state?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["workout_sessions"]["Insert"]>;
        Relationships: [];
      };
      performed_exercises: {
        Row: {
          id: string;
          user_id: string;
          workout_session_id: string;
          exercise_id: string;
          exercise_name: string;
          settings: Json;
          load: number;
          load_known: boolean;
          status: string;
          shutdown_reason: string | null;
          exercise_order: number;
          exercise_origin: string;
          swapped_from_exercise_id: string | null;
          swapped_from_exercise_name: string | null;
          swapped_to_exercise_id: string | null;
          swapped_to_exercise_name: string | null;
          archived_swapped_sets: Json;
          added_at: string | null;
          swapped_at: string | null;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          user_id: string;
          workout_session_id: string;
          exercise_id: string;
          exercise_name: string;
          settings: Json;
          load: number;
          load_known?: boolean;
          status: string;
          shutdown_reason?: string | null;
          exercise_order: number;
          exercise_origin?: string;
          swapped_from_exercise_id?: string | null;
          swapped_from_exercise_name?: string | null;
          swapped_to_exercise_id?: string | null;
          swapped_to_exercise_name?: string | null;
          archived_swapped_sets?: Json;
          added_at?: string | null;
          swapped_at?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["performed_exercises"]["Insert"]>;
        Relationships: [];
      };
      performed_sets: {
        Row: {
          id: string;
          user_id: string;
          performed_exercise_id: string;
          set_number: number;
          reps: number;
          load: number;
          set_type: string;
          logged_at: string;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id: string;
          user_id: string;
          performed_exercise_id: string;
          set_number: number;
          reps: number;
          load: number;
          set_type?: string;
          logged_at: string;
          metadata?: Json;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["performed_sets"]["Insert"]>;
        Relationships: [];
      };
      user_settings: {
        Row: { user_id: string; settings: Json; created_at: string; updated_at: string };
        Insert: { user_id: string; settings: Json; created_at?: string; updated_at?: string };
        Update: { settings?: Json; updated_at?: string };
        Relationships: [];
      };
      subscription_statuses: {
        Row: {
          user_id: string;
          entitlement: string;
          provider: string | null;
          provider_customer_id: string | null;
          renews_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          entitlement?: string;
          provider?: string | null;
          provider_customer_id?: string | null;
          renews_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["subscription_statuses"]["Insert"]>;
        Relationships: [];
      };
      sync_queue: {
        Row: { id: string; user_id: string; entity_type: string; entity_id: string; payload: Json; created_at: string };
        Insert: { id?: string; user_id: string; entity_type: string; entity_id: string; payload: Json; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["sync_queue"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
