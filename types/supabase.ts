export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      app_config: {
        Row: {
          created_at: string | null
          description: string | null
          key: string
          updated_at: string | null
          value: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          key: string
          updated_at?: string | null
          value: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          key?: string
          updated_at?: string | null
          value?: string
        }
        Relationships: []
      }
      circuit_breaker_state: {
        Row: {
          created_at: string | null
          failure_count: number | null
          failure_threshold: number | null
          last_failure_at: string | null
          last_success_at: string | null
          service_name: string
          status: string
          success_threshold: number | null
          timeout_seconds: number | null
          updated_at: string | null
          window_seconds: number | null
        }
        Insert: {
          created_at?: string | null
          failure_count?: number | null
          failure_threshold?: number | null
          last_failure_at?: string | null
          last_success_at?: string | null
          service_name: string
          status: string
          success_threshold?: number | null
          timeout_seconds?: number | null
          updated_at?: string | null
          window_seconds?: number | null
        }
        Update: {
          created_at?: string | null
          failure_count?: number | null
          failure_threshold?: number | null
          last_failure_at?: string | null
          last_success_at?: string | null
          service_name?: string
          status?: string
          success_threshold?: number | null
          timeout_seconds?: number | null
          updated_at?: string | null
          window_seconds?: number | null
        }
        Relationships: []
      }
      documents: {
        Row: {
          content: string | null
          created_at: string | null
          deal_id: string | null
          doc_type: string | null
          id: string
          title: string | null
          updated_at: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          deal_id?: string | null
          doc_type?: string | null
          id?: string
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          deal_id?: string | null
          doc_type?: string | null
          id?: string
          title?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      enrichment_audit_events: {
        Row: {
          correlation_id: string | null
          created_at: string | null
          event_data: Json
          event_type: string
          id: string
          job_id: string
          user_id: string | null
        }
        Insert: {
          correlation_id?: string | null
          created_at?: string | null
          event_data: Json
          event_type: string
          id?: string
          job_id: string
          user_id?: string | null
        }
        Update: {
          correlation_id?: string | null
          created_at?: string | null
          event_data?: Json
          event_type?: string
          id?: string
          job_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "enrichment_audit_events_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrichment_audit_events_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs_with_dimensional_scores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrichment_audit_events_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "top_job_recommendations"
            referencedColumns: ["id"]
          },
        ]
      }
      enrichment_audit_trails: {
        Row: {
          correlation_id: string
          created_at: string | null
          duration_ms: number
          end_time: string
          error_count: number | null
          event_count: number
          id: string
          job_id: string
          metadata: Json | null
          retry_count: number | null
          start_time: string
          success: boolean
        }
        Insert: {
          correlation_id: string
          created_at?: string | null
          duration_ms: number
          end_time: string
          error_count?: number | null
          event_count: number
          id?: string
          job_id: string
          metadata?: Json | null
          retry_count?: number | null
          start_time: string
          success: boolean
        }
        Update: {
          correlation_id?: string
          created_at?: string | null
          duration_ms?: number
          end_time?: string
          error_count?: number | null
          event_count?: number
          id?: string
          job_id?: string
          metadata?: Json | null
          retry_count?: number | null
          start_time?: string
          success?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "enrichment_audit_trails_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrichment_audit_trails_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs_with_dimensional_scores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrichment_audit_trails_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "top_job_recommendations"
            referencedColumns: ["id"]
          },
        ]
      }
      failed_enrichments: {
        Row: {
          created_at: string | null
          error: string
          id: string
          job_id: string | null
          payload: Json | null
          profile_uid: string | null
          retry_count: number | null
        }
        Insert: {
          created_at?: string | null
          error: string
          id?: string
          job_id?: string | null
          payload?: Json | null
          profile_uid?: string | null
          retry_count?: number | null
        }
        Update: {
          created_at?: string | null
          error?: string
          id?: string
          job_id?: string | null
          payload?: Json | null
          profile_uid?: string | null
          retry_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "failed_enrichments_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "failed_enrichments_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs_with_dimensional_scores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "failed_enrichments_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "top_job_recommendations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "failed_enrichments_profile_uid_fkey"
            columns: ["profile_uid"]
            isOneToOne: false
            referencedRelation: "user_profile"
            referencedColumns: ["uid"]
          },
        ]
      }
      job_documents: {
        Row: {
          content: string | null
          created_at: string | null
          doc_status: string | null
          doc_type: string
          file_size: number | null
          id: string
          job_id: string
          memo: string | null
          metadata: Json | null
          mime_type: string | null
          processed_at: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          doc_status?: string | null
          doc_type: string
          file_size?: number | null
          id?: string
          job_id: string
          memo?: string | null
          metadata?: Json | null
          mime_type?: string | null
          processed_at?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          doc_status?: string | null
          doc_type?: string
          file_size?: number | null
          id?: string
          job_id?: string
          memo?: string | null
          metadata?: Json | null
          mime_type?: string | null
          processed_at?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_documents_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_documents_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs_with_dimensional_scores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_documents_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "top_job_recommendations"
            referencedColumns: ["id"]
          },
        ]
      }
      job_enrichments: {
        Row: {
          ai_fit_score: number | null
          ai_resume_tips: string[] | null
          ai_tailored_summary: string | null
          comp_currency: string | null
          comp_max: number | null
          comp_min: number | null
          compensation_competitiveness_score: number | null
          concerns: string[] | null
          confidence_score: number | null
          correlation_id: string | null
          created_at: string | null
          culture_fit_score: number | null
          dealbreaker_hit: boolean | null
          enrichment_completed_at: string | null
          enrichment_started_at: string | null
          error_count: number | null
          extracted_fields: Json | null
          fit_reasoning: string | null
          growth_potential_score: number | null
          insights: string[] | null
          job_id: string
          key_strengths: string[] | null
          last_error: string | null
          metadata: Json | null
          overall_recommendation_score: number | null
          profile_uid: string | null
          raw_json: Json | null
          remote_policy: string | null
          resume_bullet: string | null
          risks: Json | null
          skill_coverage_pct: number | null
          skills_gap: Json | null
          skills_matched: Json | null
          skills_sought: Json | null
          status: Database["public"]["Enums"]["enrichment_status_enum"] | null
          tech_stack: Json | null
          updated_at: string | null
          work_life_balance_score: number | null
        }
        Insert: {
          ai_fit_score?: number | null
          ai_resume_tips?: string[] | null
          ai_tailored_summary?: string | null
          comp_currency?: string | null
          comp_max?: number | null
          comp_min?: number | null
          compensation_competitiveness_score?: number | null
          concerns?: string[] | null
          confidence_score?: number | null
          correlation_id?: string | null
          created_at?: string | null
          culture_fit_score?: number | null
          dealbreaker_hit?: boolean | null
          enrichment_completed_at?: string | null
          enrichment_started_at?: string | null
          error_count?: number | null
          extracted_fields?: Json | null
          fit_reasoning?: string | null
          growth_potential_score?: number | null
          insights?: string[] | null
          job_id: string
          key_strengths?: string[] | null
          last_error?: string | null
          metadata?: Json | null
          overall_recommendation_score?: number | null
          profile_uid?: string | null
          raw_json?: Json | null
          remote_policy?: string | null
          resume_bullet?: string | null
          risks?: Json | null
          skill_coverage_pct?: number | null
          skills_gap?: Json | null
          skills_matched?: Json | null
          skills_sought?: Json | null
          status?: Database["public"]["Enums"]["enrichment_status_enum"] | null
          tech_stack?: Json | null
          updated_at?: string | null
          work_life_balance_score?: number | null
        }
        Update: {
          ai_fit_score?: number | null
          ai_resume_tips?: string[] | null
          ai_tailored_summary?: string | null
          comp_currency?: string | null
          comp_max?: number | null
          comp_min?: number | null
          compensation_competitiveness_score?: number | null
          concerns?: string[] | null
          confidence_score?: number | null
          correlation_id?: string | null
          created_at?: string | null
          culture_fit_score?: number | null
          dealbreaker_hit?: boolean | null
          enrichment_completed_at?: string | null
          enrichment_started_at?: string | null
          error_count?: number | null
          extracted_fields?: Json | null
          fit_reasoning?: string | null
          growth_potential_score?: number | null
          insights?: string[] | null
          job_id?: string
          key_strengths?: string[] | null
          last_error?: string | null
          metadata?: Json | null
          overall_recommendation_score?: number | null
          profile_uid?: string | null
          raw_json?: Json | null
          remote_policy?: string | null
          resume_bullet?: string | null
          risks?: Json | null
          skill_coverage_pct?: number | null
          skills_gap?: Json | null
          skills_matched?: Json | null
          skills_sought?: Json | null
          status?: Database["public"]["Enums"]["enrichment_status_enum"] | null
          tech_stack?: Json | null
          updated_at?: string | null
          work_life_balance_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "job_enrichments_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: true
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_enrichments_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: true
            referencedRelation: "jobs_with_dimensional_scores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_enrichments_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: true
            referencedRelation: "top_job_recommendations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_enrichments_profile_uid_fkey"
            columns: ["profile_uid"]
            isOneToOne: false
            referencedRelation: "user_profile"
            referencedColumns: ["uid"]
          },
        ]
      }
      job_notes: {
        Row: {
          content: string
          created_at: string | null
          embedding_status: string | null
          id: string
          is_blocker: boolean | null
          job_id: string
          note_status: string | null
          note_type: string | null
          tags: string[] | null
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          embedding_status?: string | null
          id?: string
          is_blocker?: boolean | null
          job_id: string
          note_status?: string | null
          note_type?: string | null
          tags?: string[] | null
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          embedding_status?: string | null
          id?: string
          is_blocker?: boolean | null
          job_id?: string
          note_status?: string | null
          note_type?: string | null
          tags?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_notes_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_notes_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs_with_dimensional_scores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_notes_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "top_job_recommendations"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          ai_fit_score: number | null
          applicant_count: number | null
          company: string
          created_at: string | null
          description: string | null
          employment_type: string | null
          experience_level: string | null
          id: string
          location: string | null
          posted_date: string | null
          salary: string | null
          scraped_at: string
          scraper_raw_json: Json | null
          skills: string[] | null
          source: string | null
          status: string | null
          title: string
          updated_at: string | null
          url: string
        }
        Insert: {
          ai_fit_score?: number | null
          applicant_count?: number | null
          company: string
          created_at?: string | null
          description?: string | null
          employment_type?: string | null
          experience_level?: string | null
          id?: string
          location?: string | null
          posted_date?: string | null
          salary?: string | null
          scraped_at: string
          scraper_raw_json?: Json | null
          skills?: string[] | null
          source?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
          url: string
        }
        Update: {
          ai_fit_score?: number | null
          applicant_count?: number | null
          company?: string
          created_at?: string | null
          description?: string | null
          employment_type?: string | null
          experience_level?: string | null
          id?: string
          location?: string | null
          posted_date?: string | null
          salary?: string | null
          scraped_at?: string
          scraper_raw_json?: Json | null
          skills?: string[] | null
          source?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
          url?: string
        }
        Relationships: []
      }
      kb_embeddings: {
        Row: {
          chunk_hash: string | null
          chunk_idx: number | null
          classification_confidence: number | null
          content: string
          created_at: string | null
          document_subtypes: string[] | null
          document_type: string | null
          embedding: string | null
          entity_id: string
          entity_type: string
          id: string
          metadata: Json | null
          source_id: string | null
          tags: string[] | null
          updated_at: string | null
        }
        Insert: {
          chunk_hash?: string | null
          chunk_idx?: number | null
          classification_confidence?: number | null
          content: string
          created_at?: string | null
          document_subtypes?: string[] | null
          document_type?: string | null
          embedding?: string | null
          entity_id: string
          entity_type: string
          id?: string
          metadata?: Json | null
          source_id?: string | null
          tags?: string[] | null
          updated_at?: string | null
        }
        Update: {
          chunk_hash?: string | null
          chunk_idx?: number | null
          classification_confidence?: number | null
          content?: string
          created_at?: string | null
          document_subtypes?: string[] | null
          document_type?: string | null
          embedding?: string | null
          entity_id?: string
          entity_type?: string
          id?: string
          metadata?: Json | null
          source_id?: string | null
          tags?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      pipeline_traces: {
        Row: {
          correlation_id: string | null
          created_at: string | null
          duration_ms: number | null
          error_message: string | null
          id: string
          job_id: string | null
          metadata: Json | null
          operation: string
          service_name: string
          status: string
          worker_id: string | null
        }
        Insert: {
          correlation_id?: string | null
          created_at?: string | null
          duration_ms?: number | null
          error_message?: string | null
          id?: string
          job_id?: string | null
          metadata?: Json | null
          operation: string
          service_name: string
          status: string
          worker_id?: string | null
        }
        Update: {
          correlation_id?: string | null
          created_at?: string | null
          duration_ms?: number | null
          error_message?: string | null
          id?: string
          job_id?: string | null
          metadata?: Json | null
          operation?: string
          service_name?: string
          status?: string
          worker_id?: string | null
        }
        Relationships: []
      }
      skills_taxonomy: {
        Row: {
          category: string | null
          created_at: string | null
          skill: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          skill: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          skill?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      user_profile: {
        Row: {
          created_at: string | null
          current_title: string | null
          dealbreakers: Json | null
          embedding: string | null
          interview_style: string | null
          location: string | null
          min_base_comp: number | null
          name: string | null
          preferences: Json | null
          red_flags: Json | null
          remote_pref: Database["public"]["Enums"]["remote_preference"] | null
          seniority: string | null
          strengths: Json | null
          uid: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          current_title?: string | null
          dealbreakers?: Json | null
          embedding?: string | null
          interview_style?: string | null
          location?: string | null
          min_base_comp?: number | null
          name?: string | null
          preferences?: Json | null
          red_flags?: Json | null
          remote_pref?: Database["public"]["Enums"]["remote_preference"] | null
          seniority?: string | null
          strengths?: Json | null
          uid: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          current_title?: string | null
          dealbreakers?: Json | null
          embedding?: string | null
          interview_style?: string | null
          location?: string | null
          min_base_comp?: number | null
          name?: string | null
          preferences?: Json | null
          red_flags?: Json | null
          remote_pref?: Database["public"]["Enums"]["remote_preference"] | null
          seniority?: string | null
          strengths?: Json | null
          uid?: string
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      cron_job_health: {
        Row: {
          avg_duration_ms: number | null
          error_count: number | null
          executions_last_hour: number | null
          job_name: string | null
          last_execution: string | null
        }
        Relationships: []
      }
      enrichment_queue_status: {
        Row: {
          avg_age_seconds: number | null
          count: number | null
          newest_job: string | null
          oldest_job: string | null
          status: Database["public"]["Enums"]["enrichment_status_enum"] | null
        }
        Relationships: []
      }
      jobs_with_dimensional_scores: {
        Row: {
          company: string | null
          compensation_competitiveness_score: number | null
          confidence_score: number | null
          created_at: string | null
          culture_fit_score: number | null
          dealbreaker_hit: boolean | null
          enrichment_ai_fit_score: number | null
          growth_potential_score: number | null
          id: string | null
          job_ai_fit_score: number | null
          location: string | null
          overall_recommendation_score: number | null
          scraped_at: string | null
          source: string | null
          title: string | null
          updated_at: string | null
          url: string | null
          work_life_balance_score: number | null
        }
        Relationships: []
      }
      pipeline_performance: {
        Row: {
          avg_duration_ms: number | null
          error_count: number | null
          execution_count: number | null
          hour: string | null
          max_duration_ms: number | null
          min_duration_ms: number | null
          operation: string | null
          service_name: string | null
        }
        Relationships: []
      }
      recent_enrichment_audits: {
        Row: {
          correlation_id: string | null
          detailed_event_count: number | null
          duration_ms: number | null
          end_time: string | null
          error_count: number | null
          id: string | null
          job_company: string | null
          job_id: string | null
          job_title: string | null
          metadata: Json | null
          retry_count: number | null
          start_time: string | null
          success: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "enrichment_audit_trails_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrichment_audit_trails_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs_with_dimensional_scores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrichment_audit_trails_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "top_job_recommendations"
            referencedColumns: ["id"]
          },
        ]
      }
      stuck_enrichment_jobs: {
        Row: {
          company: string | null
          enrichment_started_at: string | null
          error_count: number | null
          job_id: string | null
          last_error: string | null
          minutes_stuck: number | null
          status: Database["public"]["Enums"]["enrichment_status_enum"] | null
          title: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_enrichments_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: true
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_enrichments_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: true
            referencedRelation: "jobs_with_dimensional_scores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_enrichments_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: true
            referencedRelation: "top_job_recommendations"
            referencedColumns: ["id"]
          },
        ]
      }
      top_job_recommendations: {
        Row: {
          ai_fit_score: number | null
          company: string | null
          compensation_competitiveness_score: number | null
          created_at: string | null
          culture_fit_score: number | null
          dealbreaker_hit: boolean | null
          growth_potential_score: number | null
          id: string | null
          location: string | null
          overall_recommendation_score: number | null
          title: string | null
          work_life_balance_score: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      binary_quantize: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      create_job_with_enrichment: {
        Args: {
          p_url: string
          p_title: string
          p_company: string
          p_description?: string
          p_location?: string
          p_employment_type?: string
          p_experience_level?: string
          p_salary?: string
          p_posted_date?: string
          p_applicant_count?: number
          p_skills?: string[]
          p_source?: string
          p_scraped_at?: string
          p_status?: string
          p_profile_uid?: string
          p_scraper_raw_json?: Json
        }
        Returns: string
      }
      dispatch_pass_a_edge_batch: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      dispatch_pass_b_edge_batch: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      fail_job_enrichment: {
        Args: { p_job_id: string; p_error_message: string; p_payload?: Json }
        Returns: undefined
      }
      halfvec_avg: {
        Args: { "": number[] }
        Returns: unknown
      }
      halfvec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      halfvec_send: {
        Args: { "": unknown }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      hnsw_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnswhandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflathandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      l2_norm: {
        Args: { "": unknown } | { "": unknown }
        Returns: number
      }
      l2_normalize: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: string
      }
      match_chunks: {
        Args: {
          query_embedding: string
          match_threshold?: number
          match_count?: number
          min_content_length?: number
          filter_entity_type?: string
        }
        Returns: {
          id: string
          entity_id: string
          content: string
          similarity: number
        }[]
      }
      refresh_top_job_recommendations: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      sparsevec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      sparsevec_send: {
        Args: { "": unknown }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      vector_avg: {
        Args: { "": number[] }
        Returns: string
      }
      vector_dims: {
        Args: { "": string } | { "": unknown }
        Returns: number
      }
      vector_norm: {
        Args: { "": string }
        Returns: number
      }
      vector_out: {
        Args: { "": string }
        Returns: unknown
      }
      vector_send: {
        Args: { "": string }
        Returns: string
      }
      vector_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
    }
    Enums: {
      enrichment_status_enum:
        | "pending"
        | "processing"
        | "pass_a_complete"
        | "completed"
        | "failed"
        | "permanently_failed"
      kb_source_type: "note" | "doc" | "summary" | "job"
      remote_preference: "remote" | "hybrid" | "onsite"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      enrichment_status_enum: [
        "pending",
        "processing",
        "pass_a_complete",
        "completed",
        "failed",
        "permanently_failed",
      ],
      kb_source_type: ["note", "doc", "summary", "job"],
      remote_preference: ["remote", "hybrid", "onsite"],
    },
  },
} as const

