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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      abandoned_checkouts: {
        Row: {
          buyer_city: string | null
          buyer_document: string | null
          buyer_email: string | null
          buyer_name: string | null
          buyer_phone: string | null
          buyer_state: string | null
          converted: boolean
          created_at: string
          id: string
          last_step: string
          pix_error: string | null
          session_id: string
          updated_at: string
        }
        Insert: {
          buyer_city?: string | null
          buyer_document?: string | null
          buyer_email?: string | null
          buyer_name?: string | null
          buyer_phone?: string | null
          buyer_state?: string | null
          converted?: boolean
          created_at?: string
          id?: string
          last_step?: string
          pix_error?: string | null
          session_id: string
          updated_at?: string
        }
        Update: {
          buyer_city?: string | null
          buyer_document?: string | null
          buyer_email?: string | null
          buyer_name?: string | null
          buyer_phone?: string | null
          buyer_state?: string | null
          converted?: boolean
          created_at?: string
          id?: string
          last_step?: string
          pix_error?: string | null
          session_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      cloaker_config: {
        Row: {
          enabled: boolean
          google_enabled: boolean
          id: string
          tiktok_enabled: boolean
          updated_at: string
        }
        Insert: {
          enabled?: boolean
          google_enabled?: boolean
          id?: string
          tiktok_enabled?: boolean
          updated_at?: string
        }
        Update: {
          enabled?: boolean
          google_enabled?: boolean
          id?: string
          tiktok_enabled?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      funnel_events: {
        Row: {
          created_at: string
          event: string
          id: string
          session_id: string | null
        }
        Insert: {
          created_at?: string
          event: string
          id?: string
          session_id?: string | null
        }
        Update: {
          created_at?: string
          event?: string
          id?: string
          session_id?: string | null
        }
        Relationships: []
      }
      gateway_config: {
        Row: {
          active_gateway: string
          centurionpay_company_id: string | null
          centurionpay_secret_key: string | null
          id: string
          ironpay_api_token: string | null
          mppagamentos_public_key: string | null
          mppagamentos_secret_key: string | null
          pagouai_public_key: string | null
          pagouai_secret_key: string | null
          payevo_api_key: string | null
          payevo_company_id: string | null
          payevo_receiver_id: string | null
          payevo_secret_key: string | null
          simpayout_client_id: string | null
          simpayout_client_secret: string | null
          updated_at: string | null
          vennox_company_id: string | null
          vennox_secret_key: string | null
        }
        Insert: {
          active_gateway?: string
          centurionpay_company_id?: string | null
          centurionpay_secret_key?: string | null
          id?: string
          ironpay_api_token?: string | null
          mppagamentos_public_key?: string | null
          mppagamentos_secret_key?: string | null
          pagouai_public_key?: string | null
          pagouai_secret_key?: string | null
          payevo_api_key?: string | null
          payevo_company_id?: string | null
          payevo_receiver_id?: string | null
          payevo_secret_key?: string | null
          simpayout_client_id?: string | null
          simpayout_client_secret?: string | null
          updated_at?: string | null
          vennox_company_id?: string | null
          vennox_secret_key?: string | null
        }
        Update: {
          active_gateway?: string
          centurionpay_company_id?: string | null
          centurionpay_secret_key?: string | null
          id?: string
          ironpay_api_token?: string | null
          mppagamentos_public_key?: string | null
          mppagamentos_secret_key?: string | null
          pagouai_public_key?: string | null
          pagouai_secret_key?: string | null
          payevo_api_key?: string | null
          payevo_company_id?: string | null
          payevo_receiver_id?: string | null
          payevo_secret_key?: string | null
          simpayout_client_id?: string | null
          simpayout_client_secret?: string | null
          updated_at?: string | null
          vennox_company_id?: string | null
          vennox_secret_key?: string | null
        }
        Relationships: []
      }
      orders: {
        Row: {
          amount_cents: number
          buyer_address: string | null
          buyer_address_number: string | null
          buyer_cep: string | null
          buyer_city: string | null
          buyer_complement: string | null
          buyer_document: string | null
          buyer_email: string | null
          buyer_ip: string | null
          buyer_ip_city: string | null
          buyer_name: string | null
          buyer_neighborhood: string | null
          buyer_phone: string | null
          buyer_state: string | null
          created_at: string
          external_id: string | null
          gateway: string
          gateway_response: Json | null
          id: string
          items_description: string | null
          pix_code: string | null
          pix_qr_code_base64: string | null
          qr_code_copied: boolean
          shipping_cost_cents: number | null
          shipping_method: string | null
          status: string
          updated_at: string
        }
        Insert: {
          amount_cents: number
          buyer_address?: string | null
          buyer_address_number?: string | null
          buyer_cep?: string | null
          buyer_city?: string | null
          buyer_complement?: string | null
          buyer_document?: string | null
          buyer_email?: string | null
          buyer_ip?: string | null
          buyer_ip_city?: string | null
          buyer_name?: string | null
          buyer_neighborhood?: string | null
          buyer_phone?: string | null
          buyer_state?: string | null
          created_at?: string
          external_id?: string | null
          gateway?: string
          gateway_response?: Json | null
          id?: string
          items_description?: string | null
          pix_code?: string | null
          pix_qr_code_base64?: string | null
          qr_code_copied?: boolean
          shipping_cost_cents?: number | null
          shipping_method?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          amount_cents?: number
          buyer_address?: string | null
          buyer_address_number?: string | null
          buyer_cep?: string | null
          buyer_city?: string | null
          buyer_complement?: string | null
          buyer_document?: string | null
          buyer_email?: string | null
          buyer_ip?: string | null
          buyer_ip_city?: string | null
          buyer_name?: string | null
          buyer_neighborhood?: string | null
          buyer_phone?: string | null
          buyer_state?: string | null
          created_at?: string
          external_id?: string | null
          gateway?: string
          gateway_response?: Json | null
          id?: string
          items_description?: string | null
          pix_code?: string | null
          pix_qr_code_base64?: string | null
          qr_code_copied?: boolean
          shipping_cost_cents?: number | null
          shipping_method?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      pixel_config: {
        Row: {
          config: Json
          id: string
          updated_at: string
        }
        Insert: {
          config?: Json
          id?: string
          updated_at?: string
        }
        Update: {
          config?: Json
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
        }
        Relationships: []
      }
      webhook_endpoints: {
        Row: {
          active: boolean
          created_at: string
          events: string[]
          id: string
          url: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          events?: string[]
          id?: string
          url: string
        }
        Update: {
          active?: boolean
          created_at?: string
          events?: string[]
          id?: string
          url?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      get_funnel_stats: {
        Args: { active_cutoff: string; cutoff_time: string }
        Returns: Json
      }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
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
