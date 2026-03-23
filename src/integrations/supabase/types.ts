export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      drug_info_chunks: {
        Row: {
          chunk_type: string
          content: string
          created_at: string
          id: string
          medication_id: string
          user_id: string
        }
        Insert: {
          chunk_type: string
          content?: string
          created_at?: string
          id?: string
          medication_id: string
          user_id: string
        }
        Update: {
          chunk_type?: string
          content?: string
          created_at?: string
          id?: string
          medication_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "drug_info_chunks_medication_id_fkey"
            columns: ["medication_id"]
            isOneToOne: false
            referencedRelation: "medications"
            referencedColumns: ["id"]
          },
        ]
      }
      interaction_matrix: {
        Row: {
          contraindication_type: string
          created_at: string
          drug_a: string
          drug_b: string
          id: string
          medication_id_a: string | null
          medication_id_b: string | null
          recommended_action: string
          risk_description: string
          severity: string
          user_id: string
        }
        Insert: {
          contraindication_type?: string
          created_at?: string
          drug_a: string
          drug_b: string
          id?: string
          medication_id_a?: string | null
          medication_id_b?: string | null
          recommended_action?: string
          risk_description?: string
          severity?: string
          user_id: string
        }
        Update: {
          contraindication_type?: string
          created_at?: string
          drug_a?: string
          drug_b?: string
          id?: string
          medication_id_a?: string | null
          medication_id_b?: string | null
          recommended_action?: string
          risk_description?: string
          severity?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "interaction_matrix_medication_id_a_fkey"
            columns: ["medication_id_a"]
            isOneToOne: false
            referencedRelation: "medications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interaction_matrix_medication_id_b_fkey"
            columns: ["medication_id_b"]
            isOneToOne: false
            referencedRelation: "medications"
            referencedColumns: ["id"]
          },
        ]
      }
      interaction_warnings: {
        Row: {
          created_at: string
          description: string
          id: string
          medication_ids: string[]
          severity: string
          source_snippet: string | null
          title: string
          type: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string
          id?: string
          medication_ids?: string[]
          severity?: string
          source_snippet?: string | null
          title: string
          type?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          medication_ids?: string[]
          severity?: string
          source_snippet?: string | null
          title?: string
          type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      medications: {
        Row: {
          created_at: string
          deposit_method: string | null
          dosage: string
          duration_days: number
          efcy: string | null
          entp_name: string | null
          frequency_per_day: number
          id: string
          intrc: string | null
          item_image: string | null
          item_seq: string | null
          name: string
          notes: string | null
          se: string | null
          use_method: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          deposit_method?: string | null
          dosage?: string
          duration_days?: number
          efcy?: string | null
          entp_name?: string | null
          frequency_per_day?: number
          id?: string
          intrc?: string | null
          item_image?: string | null
          item_seq?: string | null
          name: string
          notes?: string | null
          se?: string | null
          use_method?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          deposit_method?: string | null
          dosage?: string
          duration_days?: number
          efcy?: string | null
          entp_name?: string | null
          frequency_per_day?: number
          id?: string
          intrc?: string | null
          item_image?: string | null
          item_seq?: string | null
          name?: string
          notes?: string | null
          se?: string | null
          use_method?: string | null
          user_id?: string
        }
        Relationships: []
      }
      patient_links: {
        Row: {
          caregiver_id: string
          created_at: string
          id: string
          invite_code: string
          patient_id: string
        }
        Insert: {
          caregiver_id: string
          created_at?: string
          id?: string
          invite_code?: string
          patient_id: string
        }
        Update: {
          caregiver_id?: string
          created_at?: string
          id?: string
          invite_code?: string
          patient_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          allergies: string | null
          conditions: string | null
          created_at: string
          emergency_contact: string | null
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          allergies?: string | null
          conditions?: string | null
          created_at?: string
          emergency_contact?: string | null
          id?: string
          name?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          allergies?: string | null
          conditions?: string | null
          created_at?: string
          emergency_contact?: string | null
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      schedules: {
        Row: {
          created_at: string
          date: string
          id: string
          medication_id: string
          taken_status: boolean
          time_hhmm: string
          time_of_day: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date?: string
          id?: string
          medication_id: string
          taken_status?: boolean
          time_hhmm?: string
          time_of_day?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          medication_id?: string
          taken_status?: boolean
          time_hhmm?: string
          time_of_day?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "schedules_medication_id_fkey"
            columns: ["medication_id"]
            isOneToOne: false
            referencedRelation: "medications"
            referencedColumns: ["id"]
          },
        ]
      }
      terms: {
        Row: {
          content_url: string
          created_at: string
          id: string
          is_active: boolean
          is_required: boolean
          sort_order: number
          term_type: string
          title: string
          updated_at: string
        }
        Insert: {
          content_url?: string
          created_at?: string
          id?: string
          is_active?: boolean
          is_required?: boolean
          sort_order?: number
          term_type?: string
          title: string
          updated_at?: string
        }
        Update: {
          content_url?: string
          created_at?: string
          id?: string
          is_active?: boolean
          is_required?: boolean
          sort_order?: number
          term_type?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_term_consents: {
        Row: {
          agreed: boolean
          agreed_at: string
          id: string
          term_id: string
          user_id: string
        }
        Insert: {
          agreed?: boolean
          agreed_at?: string
          id?: string
          term_id: string
          user_id: string
        }
        Update: {
          agreed?: boolean
          agreed_at?: string
          id?: string
          term_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_term_consents_term_id_fkey"
            columns: ["term_id"]
            isOneToOne: false
            referencedRelation: "terms"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "patient" | "caregiver"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["patient", "caregiver"],
    },
  },
} as const
