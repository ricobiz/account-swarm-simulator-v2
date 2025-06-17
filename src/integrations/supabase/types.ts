export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      accounts: {
        Row: {
          created_at: string
          id: string
          last_action: string | null
          password: string
          platform: string
          proxy_id: string | null
          status: string
          updated_at: string
          user_id: string
          username: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_action?: string | null
          password: string
          platform: string
          proxy_id?: string | null
          status?: string
          updated_at?: string
          user_id: string
          username: string
        }
        Update: {
          created_at?: string
          id?: string
          last_action?: string | null
          password?: string
          platform?: string
          proxy_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_accounts_proxy"
            columns: ["proxy_id"]
            isOneToOne: false
            referencedRelation: "proxies"
            referencedColumns: ["id"]
          },
        ]
      }
      logs: {
        Row: {
          account_id: string | null
          action: string
          created_at: string
          details: string | null
          id: string
          scenario_id: string | null
          status: string
          user_id: string
        }
        Insert: {
          account_id?: string | null
          action: string
          created_at?: string
          details?: string | null
          id?: string
          scenario_id?: string | null
          status?: string
          user_id: string
        }
        Update: {
          account_id?: string | null
          action?: string
          created_at?: string
          details?: string | null
          id?: string
          scenario_id?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "logs_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "logs_scenario_id_fkey"
            columns: ["scenario_id"]
            isOneToOne: false
            referencedRelation: "scenarios"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          accounts_limit: number | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          scenarios_limit: number | null
          subscription_end: string | null
          subscription_status: Database["public"]["Enums"]["subscription_status"]
          subscription_tier: string | null
          trial_end: string | null
          updated_at: string
        }
        Insert: {
          accounts_limit?: number | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          role?: Database["public"]["Enums"]["app_role"]
          scenarios_limit?: number | null
          subscription_end?: string | null
          subscription_status?: Database["public"]["Enums"]["subscription_status"]
          subscription_tier?: string | null
          trial_end?: string | null
          updated_at?: string
        }
        Update: {
          accounts_limit?: number | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          scenarios_limit?: number | null
          subscription_end?: string | null
          subscription_status?: Database["public"]["Enums"]["subscription_status"]
          subscription_tier?: string | null
          trial_end?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      proxies: {
        Row: {
          country: string | null
          created_at: string
          id: string
          ip: string
          password: string | null
          port: number
          speed: string | null
          status: string
          updated_at: string
          usage: number | null
          user_id: string
          username: string | null
        }
        Insert: {
          country?: string | null
          created_at?: string
          id?: string
          ip: string
          password?: string | null
          port: number
          speed?: string | null
          status?: string
          updated_at?: string
          usage?: number | null
          user_id: string
          username?: string | null
        }
        Update: {
          country?: string | null
          created_at?: string
          id?: string
          ip?: string
          password?: string | null
          port?: number
          speed?: string | null
          status?: string
          updated_at?: string
          usage?: number | null
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
      scenarios: {
        Row: {
          accounts_count: number | null
          config: Json | null
          created_at: string
          id: string
          name: string
          next_run: string | null
          platform: string
          progress: number | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          accounts_count?: number | null
          config?: Json | null
          created_at?: string
          id?: string
          name: string
          next_run?: string | null
          platform: string
          progress?: number | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          accounts_count?: number | null
          config?: Json | null
          created_at?: string
          id?: string
          name?: string
          next_run?: string | null
          platform?: string
          progress?: number | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "premium" | "basic"
      subscription_status: "active" | "inactive" | "trial" | "expired"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "premium", "basic"],
      subscription_status: ["active", "inactive", "trial", "expired"],
    },
  },
} as const
