// Tipo Json puro, sem undefined (JSON não aceita undefined, só null)
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[]

// Estrutura completa do banco
export type Database = {
  public: {
    Tables: {
      contract_events: {
        Row: {
          contract_id: string | null
          created_at: string | null
          event_data: Json | null
          event_type: string
          id: string
        }
        Insert: {
          contract_id?: string | null
          created_at?: string | null
          event_data?: Json | null
          event_type: string
          id?: string
        }
        Update: {
          contract_id?: string | null
          created_at?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contract_events_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          }
        ]
      }
      contract_templates: {
        Row: {
          category: string | null
          content: string
          created_at: string | null
          description: string | null
          id: string
          is_default: boolean | null
          is_public: boolean | null
          name: string
          variables: Json
        }
        Insert: {
          category?: string | null
          content: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_default?: boolean | null
          is_public?: boolean | null
          name: string
          variables?: Json
        }
        Update: {
          category?: string | null
          content?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_default?: boolean | null
          is_public?: boolean | null
          name?: string
          variables?: Json
        }
        Relationships: []
      }
      contracts: {
        Row: {
          content: string
          created_at: string | null
          expires_at: string | null
          id: string
          signature_token: string | null
          status: string | null
          title: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          signature_token?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          signature_token?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          contract_id: string | null
          created_at: string | null
          id: string
          message: string
          read: boolean | null
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          contract_id?: string | null
          created_at?: string | null
          id?: string
          message: string
          read?: boolean | null
          title: string
          type: string
          user_id?: string | null
        }
        Update: {
          contract_id?: string | null
          created_at?: string | null
          id?: string
          message?: string
          read?: boolean | null
          title?: string
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          }
        ]
      }
      subscription_plans: {
        Row: {
          api_access: boolean | null
          created_at: string | null
          description: string | null
          features: Json | null
          id: string
          max_contracts_per_month: number | null
          name: string
          price_monthly: number | null
          price_yearly: number | null
        }
        Insert: {
          api_access?: boolean | null
          created_at?: string | null
          description?: string | null
          features?: Json | null
          id?: string
          max_contracts_per_month?: number | null
          name: string
          price_monthly?: number | null
          price_yearly?: number | null
        }
        Update: {
          api_access?: boolean | null
          created_at?: string | null
          description?: string | null
          features?: Json | null
          id?: string
          max_contracts_per_month?: number | null
          name?: string
          price_monthly?: number | null
          price_yearly?: number | null
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          created_at: string | null
          email: string
          has_contratpro: boolean
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          email: string
          has_contratpro?: boolean
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          email?: string
          has_contratpro?: boolean
          id?: string
          name?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      handle_expired_contracts: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Tipo auxiliar para pegar o schema público
type DefaultSchema = Database["public"]

// Tipos genéricos para Rows, Insert e Update em qualquer tabela
export type Tables<
  T extends keyof DefaultSchema["Tables"] | { schema: keyof Database },
  TableName extends T extends { schema: keyof Database }
    ? keyof Database[T["schema"]]["Tables"]
    : never = never
> = T extends { schema: keyof Database }
  ? Database[T["schema"]]["Tables"][TableName] extends { Row: infer R }
    ? R
    : never
  : T extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][T] extends { Row: infer R }
    ? R
    : never
  : never

export type TablesInsert<
  T extends keyof DefaultSchema["Tables"] | { schema: keyof Database },
  TableName extends T extends { schema: keyof Database }
    ? keyof Database[T["schema"]]["Tables"]
    : never = never
> = T extends { schema: keyof Database }
  ? Database[T["schema"]]["Tables"][TableName] extends { Insert: infer I }
    ? I
    : never
  : T extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][T] extends { Insert: infer I }
    ? I
    : never
  : never

export type TablesUpdate<
  T extends keyof DefaultSchema["Tables"] | { schema: keyof Database },
  TableName extends T extends { schema: keyof Database }
    ? keyof Database[T["schema"]]["Tables"]
    : never = never
> = T extends { schema: keyof Database }
  ? Database[T["schema"]]["Tables"][TableName] extends { Update: infer U }
    ? U
    : never
  : T extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][T] extends { Update: infer U }
    ? U
    : never
  : never

export type Enums<
  T extends keyof DefaultSchema["Enums"] | { schema: keyof Database },
  EnumName extends T extends { schema: keyof Database }
    ? keyof Database[T["schema"]]["Enums"]
    : never = never
> = T extends { schema: keyof Database }
  ? Database[T["schema"]]["Enums"][EnumName]
  : T extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][T]
  : never

export type CompositeTypes<
  T extends keyof DefaultSchema["CompositeTypes"] | { schema: keyof Database },
  CompositeTypeName extends T extends { schema: keyof Database }
    ? keyof Database[T["schema"]]["CompositeTypes"]
    : never = never
> = T extends { schema: keyof Database }
  ? Database[T["schema"]]["CompositeTypes"][CompositeTypeName]
  : T extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][T]
  : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
