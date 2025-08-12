export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type Database = {

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
                    application_deadline: string | null
                    created_at: string
                    degree_level: string | null
                    delivery_mode: string | null
                    description: string | null
                    duration: string | null
                    id: string
                    is_published: boolean
                    title: string
                    tuition_fee: string | null
                    university_id: string
                    updated_at: string
                }
                Insert: {
                    applica
                    university_id: string
                    updated_at?: string
                }
                Update: {
                    application_deadline?: string | null
                    created_at?: string
                    degree_level?: string | null
                    delivery_mode?: string | null
                    description?: string | null
                    duration?: string | null
                    id?: string
                    is_published?: boolean
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
