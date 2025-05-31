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
      leads: {
        Row: {
          assignee_email: string | null
          assignee_name: string | null
          batch_names: string | null
          city: string | null
          created_at: string | null
          created_on: string | null
          email: string | null
          facebook_ad: string | null
          fb_campaign: string | null
          fb_lead_id: string | null
          id: string
          lost_reason: string | null
          modified_on: string | null
          name: string | null
          phone: string | null
          status: string | null
          student_preference: string | null
          upload_session_id: string | null
          uploaded_by: string | null
        }
        Insert: {
          assignee_email?: string | null
          assignee_name?: string | null
          batch_names?: string | null
          city?: string | null
          created_at?: string | null
          created_on?: string | null
          email?: string | null
          facebook_ad?: string | null
          fb_campaign?: string | null
          fb_lead_id?: string | null
          id?: string
          lost_reason?: string | null
          modified_on?: string | null
          name?: string | null
          phone?: string | null
          status?: string | null
          student_preference?: string | null
          upload_session_id?: string | null
          uploaded_by?: string | null
        }
        Update: {
          assignee_email?: string | null
          assignee_name?: string | null
          batch_names?: string | null
          city?: string | null
          created_at?: string | null
          created_on?: string | null
          email?: string | null
          facebook_ad?: string | null
          fb_campaign?: string | null
          fb_lead_id?: string | null
          id?: string
          lost_reason?: string | null
          modified_on?: string | null
          name?: string | null
          phone?: string | null
          status?: string | null
          student_preference?: string | null
          upload_session_id?: string | null
          uploaded_by?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          created_by: string | null
          email: string
          full_name: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          email: string
          full_name?: string | null
          id: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          email?: string
          full_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Relationships: []
      }
      upload_logs: {
        Row: {
          created_at: string | null
          failed_rows: number | null
          file_size: number | null
          filename: string
          id: string
          processed_rows: number | null
          session_id: string
          total_rows: number | null
          upload_status: string | null
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string | null
          failed_rows?: number | null
          file_size?: number | null
          filename: string
          id?: string
          processed_rows?: number | null
          session_id: string
          total_rows?: number | null
          upload_status?: string | null
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string | null
          failed_rows?: number | null
          file_size?: number | null
          filename?: string
          id?: string
          processed_rows?: number | null
          session_id?: string
          total_rows?: number | null
          upload_status?: string | null
          uploaded_by?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
      has_any_role: {
        Args: {
          _user_id: string
          _roles: Database["public"]["Enums"]["user_role"][]
        }
        Returns: boolean
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["user_role"]
        }
        Returns: boolean
      }
    }
    Enums: {
      user_role: "super_admin" | "admin" | "digital_marketer" | "counsellor"
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
      user_role: ["super_admin", "admin", "digital_marketer", "counsellor"],
    },
  },
} as const
