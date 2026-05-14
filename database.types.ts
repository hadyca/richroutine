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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      economy_indices: {
        Row: {
          base_date: string
          change_percent: number | null
          created_at: string
          current_price: number
          economy_indices_id: number
          ticker: string
          updated_at: string
        }
        Insert: {
          base_date: string
          change_percent?: number | null
          created_at?: string
          current_price: number
          economy_indices_id?: never
          ticker: string
          updated_at?: string
        }
        Update: {
          base_date?: string
          change_percent?: number | null
          created_at?: string
          current_price?: number
          economy_indices_id?: never
          ticker?: string
          updated_at?: string
        }
        Relationships: []
      }
      economy_news: {
        Row: {
          created_at: string
          economy_news_id: number
          headline: string
          news_key: string
          summary: string
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          economy_news_id?: never
          headline: string
          news_key: string
          summary: string
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          economy_news_id?: never
          headline?: string
          news_key?: string
          summary?: string
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      market_indices: {
        Row: {
          change_percent: number
          created_at: string
          market_indices_id: number
          name: string
          price: number
          symbol: string
          updated_at: string
        }
        Insert: {
          change_percent: number
          created_at?: string
          market_indices_id?: never
          name: string
          price: number
          symbol: string
          updated_at?: string
        }
        Update: {
          change_percent?: number
          created_at?: string
          market_indices_id?: never
          name?: string
          price?: number
          symbol?: string
          updated_at?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          approved_at: string
          created_at: string
          metadata: Json
          order_id: string
          order_name: string
          payment_id: number
          payment_key: string
          raw_data: Json
          receipt_url: string
          requested_at: string
          status: string
          total_amount: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          approved_at: string
          created_at?: string
          metadata: Json
          order_id: string
          order_name: string
          payment_id?: never
          payment_key: string
          raw_data: Json
          receipt_url: string
          requested_at: string
          status: string
          total_amount: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          approved_at?: string
          created_at?: string
          metadata?: Json
          order_id?: string
          order_name?: string
          payment_id?: never
          payment_key?: string
          raw_data?: Json
          receipt_url?: string
          requested_at?: string
          status?: string
          total_amount?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      portfolio_news: {
        Row: {
          created_at: string
          portfolio_news_id: number
          provider_publish_time: number | null
          publisher: string | null
          ticker: string
          title: string
          updated_at: string
          url: string
          uuid: string
        }
        Insert: {
          created_at?: string
          portfolio_news_id?: never
          provider_publish_time?: number | null
          publisher?: string | null
          ticker: string
          title: string
          updated_at?: string
          url: string
          uuid: string
        }
        Update: {
          created_at?: string
          portfolio_news_id?: never
          provider_publish_time?: number | null
          publisher?: string | null
          ticker?: string
          title?: string
          updated_at?: string
          url?: string
          uuid?: string
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_news_ticker_tickers_ticker_fk"
            columns: ["ticker"]
            isOneToOne: false
            referencedRelation: "tickers"
            referencedColumns: ["ticker"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          marketing_consent: boolean
          name: string
          profile_id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          marketing_consent?: boolean
          name: string
          profile_id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          marketing_consent?: boolean
          name?: string
          profile_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      stock_expert_opinions: {
        Row: {
          created_at: string
          market: string | null
          profile_id: string
          stock_expert_opinions_id: number
          strategy_tags: string[]
          summary: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          market?: string | null
          profile_id: string
          stock_expert_opinions_id?: never
          strategy_tags?: string[]
          summary: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          market?: string | null
          profile_id?: string
          stock_expert_opinions_id?: never
          strategy_tags?: string[]
          summary?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_expert_opinions_profile_id_profiles_profile_id_fk"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          created_at: string
          expires_at: string | null
          profile_id: string
          started_at: string
          status: string
          subscription_id: number
          subscription_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          profile_id: string
          started_at?: string
          status?: string
          subscription_id?: never
          subscription_type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          profile_id?: string
          started_at?: string
          status?: string
          subscription_id?: never
          subscription_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_profile_id_profiles_profile_id_fk"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      ticker_analysis: {
        Row: {
          created_at: string
          status: string
          summary: string
          ticker: string
          ticker_analysis_id: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          status: string
          summary: string
          ticker: string
          ticker_analysis_id?: never
          updated_at?: string
        }
        Update: {
          created_at?: string
          status?: string
          summary?: string
          ticker?: string
          ticker_analysis_id?: never
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticker_analysis_ticker_tickers_ticker_fk"
            columns: ["ticker"]
            isOneToOne: true
            referencedRelation: "tickers"
            referencedColumns: ["ticker"]
          },
        ]
      }
      tickers: {
        Row: {
          created_at: string
          exchange: string
          last_price: number | null
          logo_url: string | null
          market: string
          name_en: string | null
          name_ko: string | null
          price_updated_at: string | null
          ticker: string
          tickers_id: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          exchange: string
          last_price?: number | null
          logo_url?: string | null
          market: string
          name_en?: string | null
          name_ko?: string | null
          price_updated_at?: string | null
          ticker: string
          tickers_id?: never
          updated_at?: string
        }
        Update: {
          created_at?: string
          exchange?: string
          last_price?: number | null
          logo_url?: string | null
          market?: string
          name_en?: string | null
          name_ko?: string | null
          price_updated_at?: string | null
          ticker?: string
          tickers_id?: never
          updated_at?: string
        }
        Relationships: []
      }
      tokens: {
        Row: {
          access_token: string
          created_at: string
          expires_at: string
          provider: string
          tokens_id: number
          updated_at: string
        }
        Insert: {
          access_token: string
          created_at?: string
          expires_at: string
          provider: string
          tokens_id?: never
          updated_at?: string
        }
        Update: {
          access_token?: string
          created_at?: string
          expires_at?: string
          provider?: string
          tokens_id?: never
          updated_at?: string
        }
        Relationships: []
      }
      watchlists: {
        Row: {
          avg_price: number | null
          created_at: string
          is_ai_news_subscribed: boolean
          profile_id: string
          quantity: number | null
          ticker: string
          total_asset: number | null
          updated_at: string
          watchlist_id: number
        }
        Insert: {
          avg_price?: number | null
          created_at?: string
          is_ai_news_subscribed?: boolean
          profile_id: string
          quantity?: number | null
          ticker: string
          total_asset?: number | null
          updated_at?: string
          watchlist_id?: never
        }
        Update: {
          avg_price?: number | null
          created_at?: string
          is_ai_news_subscribed?: boolean
          profile_id?: string
          quantity?: number | null
          ticker?: string
          total_asset?: number | null
          updated_at?: string
          watchlist_id?: never
        }
        Relationships: [
          {
            foreignKeyName: "watchlists_profile_id_profiles_profile_id_fk"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "watchlists_ticker_tickers_ticker_fk"
            columns: ["ticker"]
            isOneToOne: false
            referencedRelation: "tickers"
            referencedColumns: ["ticker"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_total_user_count: { Args: never; Returns: number }
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
