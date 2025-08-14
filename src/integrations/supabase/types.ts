export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      student_applications: {
        Row: {
          application_date: string
          created_at: string
          id: string
          notes: string | null
          program_id: string | null
          status: string
          university_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          application_date?: string
          created_at?: string
          id?: string
          notes?: string | null
          program_id?: string | null
          status?: string
          university_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          application_date?: string
          created_at?: string
          id?: string
          notes?: string | null
          program_id?: string | null
          status?: string
          university_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      student_documents: {
        Row: {
          created_at: string
          document_type: string
          file_name: string | null
          file_url: string | null
          id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          document_type: string
          file_name?: string | null
          file_url?: string | null
          id?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          document_type?: string
          file_name?: string | null
          file_url?: string | null
          id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      student_profiles: {
        Row: {
          bio: string | null
          country: string | null
          created_at: string
          email: string | null
          full_name: string | null
          gpa: string | null
          id: string
          phone: string | null
          specialization: string | null
          updated_at: string
          user_id: string
          year_of_study: string | null
        }
        Insert: {
          bio?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          gpa?: string | null
          id?: string
          phone?: string | null
          specialization?: string | null
          updated_at?: string
          user_id: string
          year_of_study?: string | null
        }
        Update: {
          bio?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          gpa?: string | null
          id?: string
          phone?: string | null
          specialization?: string | null
          updated_at?: string
          user_id?: string
          year_of_study?: string | null
        }
        Relationships: []
      }
      student_university_shared_documents: {
        Row: {
          id: string
          student_id: string
          university_id: string
          application_id: string | null
          document_id: string
          shared_at: string
          status: string
          university_notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          student_id: string
          university_id: string
          application_id?: string | null
          document_id: string
          shared_at?: string
          status?: string
          university_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          university_id?: string
          application_id?: string | null
          document_id?: string
          shared_at?: string
          status?: string
          university_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_university_shared_documents_student_id_fkey"
            columns: ["student_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_university_shared_documents_university_id_fkey"
            columns: ["university_id"]
            referencedRelation: "university_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_university_shared_documents_application_id_fkey"
            columns: ["application_id"]
            referencedRelation: "student_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_university_shared_documents_document_id_fkey"
            columns: ["document_id"]
            referencedRelation: "student_documents"
            referencedColumns: ["id"]
          }
        ]
      }
      student_saved_universities: {
        Row: {
          created_at: string
          id: string
          university_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          university_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          university_id?: string
          user_id?: string
        }
        Relationships: []
      }
      university_analytics_events: {
        Row: {
          actor_id: string | null
          created_at: string
          event_type: string
          id: string
          metadata: Json
          program_id: string | null
          university_id: string
        }
        Insert: {
          actor_id?: string | null
          created_at?: string
          event_type: string
          id?: string
          metadata?: Json
          program_id?: string | null
          university_id: string
        }
        Update: {
          actor_id?: string | null
          created_at?: string
          event_type?: string
          id?: string
          metadata?: Json
          program_id?: string | null
          university_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "university_analytics_events_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "university_programs"
            referencedColumns: ["id"]
          },
        ]
      }
      university_profiles: {
        Row: {
          banner_url: string | null
          contact_email: string | null
          created_at: string
          description: string | null
          id: string
          is_published: boolean
          location: string | null
          logo_url: string | null
          name: string
          phone: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          banner_url?: string | null
          contact_email?: string | null
          created_at?: string
          description?: string | null
          id: string
          is_published?: boolean
          location?: string | null
          logo_url?: string | null
          name: string
          phone?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          banner_url?: string | null
          contact_email?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_published?: boolean
          location?: string | null
          logo_url?: string | null
          name?: string
          phone?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      university_programs: {
        Row: {
          additional_criteria: string | null
          application_deadline: string | null
          created_at: string
          degree_level: string | null
          delivery_mode: string | null
          description: string | null
          duration: string | null
          has_scholarships: boolean | null
          id: string
          is_published: boolean
          scholarship_amount: string | null
          scholarship_criteria: string | null
          scholarship_percentage: string | null
          scholarship_type: string | null
          special_requirements: string | null
          title: string
          tuition_fee: string | null
          university_id: string
          updated_at: string
        }
        Insert: {
          additional_criteria?: string | null
          application_deadline?: string | null
          created_at?: string
          degree_level?: string | null
          delivery_mode?: string | null
          description?: string | null
          duration?: string | null
          has_scholarships?: boolean | null
          id?: string
          is_published?: boolean
          scholarship_amount?: string | null
          scholarship_criteria?: string | null
          scholarship_percentage?: string | null
          scholarship_type?: string | null
          special_requirements?: string | null
          title: string
          tuition_fee?: string | null
          university_id: string
          updated_at?: string
        }
        Update: {
          additional_criteria?: string | null
          application_deadline?: string | null
          created_at?: string
          degree_level?: string | null
          delivery_mode?: string | null
          description?: string | null
          duration?: string | null
          has_scholarships?: boolean | null
          id?: string
          is_published?: boolean
          scholarship_amount?: string | null
          scholarship_criteria?: string | null
          scholarship_percentage?: string | null
          scholarship_type?: string | null
          special_requirements?: string | null
          title?: string
          tuition_fee?: string | null
          university_id?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
