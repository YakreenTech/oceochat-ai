export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          role: 'user' | 'researcher' | 'educator' | 'admin'
          preferences: Json
          institution: string | null
          research_area: string | null
          expertise_level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'user' | 'researcher' | 'educator' | 'admin'
          preferences?: Json
          institution?: string | null
          research_area?: string | null
          expertise_level?: 'beginner' | 'intermediate' | 'advanced' | 'expert'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'user' | 'researcher' | 'educator' | 'admin'
          preferences?: Json
          institution?: string | null
          research_area?: string | null
          expertise_level?: 'beginner' | 'intermediate' | 'advanced' | 'expert'
          created_at?: string
          updated_at?: string
        }
      }
      user_sessions: {
        Row: {
          id: string
          user_id: string
          session_data: Json
          ip_address: string | null
          user_agent: string | null
          expires_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          session_data?: Json
          ip_address?: string | null
          user_agent?: string | null
          expires_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          session_data?: Json
          ip_address?: string | null
          user_agent?: string | null
          expires_at?: string | null
          created_at?: string
        }
      }
      research_projects: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          research_area: string | null
          status: 'active' | 'completed' | 'archived' | 'paused'
          collaborators: string[] | null
          data_sources: string[] | null
          tags: string[] | null
          visibility: 'private' | 'team' | 'public'
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          research_area?: string | null
          status?: 'active' | 'completed' | 'archived' | 'paused'
          collaborators?: string[] | null
          data_sources?: string[] | null
          tags?: string[] | null
          visibility?: 'private' | 'team' | 'public'
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          research_area?: string | null
          status?: 'active' | 'completed' | 'archived' | 'paused'
          collaborators?: string[] | null
          data_sources?: string[] | null
          tags?: string[] | null
          visibility?: 'private' | 'team' | 'public'
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
      conversations: {
        Row: {
          id: string
          user_id: string
          project_id: string | null
          title: string
          summary: string | null
          tags: string[] | null
          is_archived: boolean
          is_shared: boolean
          share_token: string | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          project_id?: string | null
          title?: string
          summary?: string | null
          tags?: string[] | null
          is_archived?: boolean
          is_shared?: boolean
          share_token?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          project_id?: string | null
          title?: string
          summary?: string | null
          tags?: string[] | null
          is_archived?: boolean
          is_shared?: boolean
          share_token?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          role: 'user' | 'assistant' | 'system'
          content: string
          metadata: Json
          ocean_data: Json | null
          processing_time_ms: number | null
          model_used: string | null
          token_count: number | null
          is_edited: boolean
          parent_message_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          role: 'user' | 'assistant' | 'system'
          content: string
          metadata?: Json
          ocean_data?: Json | null
          processing_time_ms?: number | null
          model_used?: string | null
          token_count?: number | null
          is_edited?: boolean
          parent_message_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          role?: 'user' | 'assistant' | 'system'
          content?: string
          metadata?: Json
          ocean_data?: Json | null
          processing_time_ms?: number | null
          model_used?: string | null
          token_count?: number | null
          is_edited?: boolean
          parent_message_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      ocean_data_cache: {
        Row: {
          id: string
          query_hash: string
          query_params: Json
          data_source: 'argo' | 'noaa' | 'nasa' | 'copernicus' | 'incois'
          data: Json
          quality_score: number
          expires_at: string
          access_count: number
          last_accessed: string
          created_at: string
        }
        Insert: {
          id?: string
          query_hash: string
          query_params: Json
          data_source: 'argo' | 'noaa' | 'nasa' | 'copernicus' | 'incois'
          data: Json
          quality_score?: number
          expires_at: string
          access_count?: number
          last_accessed?: string
          created_at?: string
        }
        Update: {
          id?: string
          query_hash?: string
          query_params?: Json
          data_source?: 'argo' | 'noaa' | 'nasa' | 'copernicus' | 'incois'
          data?: Json
          quality_score?: number
          expires_at?: string
          access_count?: number
          last_accessed?: string
          created_at?: string
        }
      }
      bookmarks: {
        Row: {
          id: string
          user_id: string
          conversation_id: string
          message_id: string
          title: string
          description: string | null
          query: string
          response_data: Json | null
          ocean_data: Json | null
          visualization_config: Json | null
          citation_info: Json | null
          tags: string[] | null
          research_notes: string | null
          is_public: boolean
          bookmark_type: 'conversation' | 'message' | 'data' | 'visualization'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          conversation_id: string
          message_id: string
          title: string
          description?: string | null
          query: string
          response_data?: Json | null
          ocean_data?: Json | null
          visualization_config?: Json | null
          citation_info?: Json | null
          tags?: string[] | null
          research_notes?: string | null
          is_public?: boolean
          bookmark_type?: 'conversation' | 'message' | 'data' | 'visualization'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          conversation_id?: string
          message_id?: string
          title?: string
          description?: string | null
          query?: string
          response_data?: Json | null
          ocean_data?: Json | null
          visualization_config?: Json | null
          citation_info?: Json | null
          tags?: string[] | null
          research_notes?: string | null
          is_public?: boolean
          bookmark_type?: 'conversation' | 'message' | 'data' | 'visualization'
          created_at?: string
          updated_at?: string
        }
      }
      research_exports: {
        Row: {
          id: string
          user_id: string
          conversation_id: string | null
          export_type: 'csv' | 'json' | 'netcdf' | 'matlab' | 'pdf' | 'docx' | 'latex'
          data_sources: string[]
          file_path: string | null
          file_size_bytes: number | null
          status: 'pending' | 'processing' | 'completed' | 'failed'
          metadata: Json
          download_count: number
          expires_at: string | null
          created_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          conversation_id?: string | null
          export_type: 'csv' | 'json' | 'netcdf' | 'matlab' | 'pdf' | 'docx' | 'latex'
          data_sources: string[]
          file_path?: string | null
          file_size_bytes?: number | null
          status?: 'pending' | 'processing' | 'completed' | 'failed'
          metadata?: Json
          download_count?: number
          expires_at?: string | null
          created_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          conversation_id?: string | null
          export_type?: 'csv' | 'json' | 'netcdf' | 'matlab' | 'pdf' | 'docx' | 'latex'
          data_sources?: string[]
          file_path?: string | null
          file_size_bytes?: number | null
          status?: 'pending' | 'processing' | 'completed' | 'failed'
          metadata?: Json
          download_count?: number
          expires_at?: string | null
          created_at?: string
          completed_at?: string | null
        }
      }
      team_memberships: {
        Row: {
          id: string
          project_id: string
          user_id: string
          role: 'owner' | 'admin' | 'researcher' | 'member' | 'viewer'
          permissions: Json
          invited_by: string | null
          joined_at: string
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          user_id: string
          role?: 'owner' | 'admin' | 'researcher' | 'member' | 'viewer'
          permissions?: Json
          invited_by?: string | null
          joined_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          user_id?: string
          role?: 'owner' | 'admin' | 'researcher' | 'member' | 'viewer'
          permissions?: Json
          invited_by?: string | null
          joined_at?: string
          created_at?: string
        }
      }
      annotations: {
        Row: {
          id: string
          project_id: string
          user_id: string
          conversation_id: string
          message_id: string
          content: string
          annotation_type: 'comment' | 'highlight' | 'question' | 'insight'
          location: Json | null
          is_resolved: boolean
          parent_annotation_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          user_id: string
          conversation_id: string
          message_id: string
          content: string
          annotation_type?: 'comment' | 'highlight' | 'question' | 'insight'
          location?: Json | null
          is_resolved?: boolean
          parent_annotation_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          user_id?: string
          conversation_id?: string
          message_id?: string
          content?: string
          annotation_type?: 'comment' | 'highlight' | 'question' | 'insight'
          location?: Json | null
          is_resolved?: boolean
          parent_annotation_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      shared_resources: {
        Row: {
          id: string
          project_id: string
          user_id: string
          title: string
          description: string | null
          resource_type: 'link' | 'file' | 'dataset' | 'paper' | 'tool'
          url: string | null
          file_path: string | null
          metadata: Json
          permissions: Json
          access_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          user_id: string
          title: string
          description?: string | null
          resource_type: 'link' | 'file' | 'dataset' | 'paper' | 'tool'
          url?: string | null
          file_path?: string | null
          metadata?: Json
          permissions?: Json
          access_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          user_id?: string
          title?: string
          description?: string | null
          resource_type?: 'link' | 'file' | 'dataset' | 'paper' | 'tool'
          url?: string | null
          file_path?: string | null
          metadata?: Json
          permissions?: Json
          access_count?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      handle_new_user: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      handle_updated_at: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      generate_share_token: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      cleanup_expired_cache: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_conversation_summary: {
        Args: { conversation_uuid: string }
        Returns: Json
      }
      search_conversations: {
        Args: { search_query: string; user_uuid?: string }
        Returns: {
          conversation_id: string
          title: string
          relevance: number
          snippet: string
          message_count: number
          last_message_at: string
        }[]
      }
      get_ocean_data_stats: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      increment_cache_access: {
        Args: { cache_id: string }
        Returns: undefined
      }
      get_user_activity_summary: {
        Args: { user_uuid?: string }
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
}
