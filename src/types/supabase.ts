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
      Cocktail: {
        Row: {
          created_at: string
          creator_id: string | null
          difficulty: Database["public"]["Enums"]["difficulty"]
          id: string
          image_url: string | null
          ingredients: Json | null
          instructions: Json | null
          is_public: boolean | null
          name: string | null
          origin_type: Database["public"]["Enums"]["cocktail_origin"] | null
        }
        Insert: {
          created_at?: string
          creator_id?: string | null
          difficulty?: Database["public"]["Enums"]["difficulty"]
          id?: string
          image_url?: string | null
          ingredients?: Json | null
          instructions?: Json | null
          is_public?: boolean | null
          name?: string | null
          origin_type?: Database["public"]["Enums"]["cocktail_origin"] | null
        }
        Update: {
          created_at?: string
          creator_id?: string | null
          difficulty?: Database["public"]["Enums"]["difficulty"]
          id?: string
          image_url?: string | null
          ingredients?: Json | null
          instructions?: Json | null
          is_public?: boolean | null
          name?: string | null
          origin_type?: Database["public"]["Enums"]["cocktail_origin"] | null
        }
        Relationships: [
          {
            foreignKeyName: "Cocktail_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "Profile"
            referencedColumns: ["id"]
          },
        ]
      }
      DrinkLog: {
        Row: {
          caption: string | null
          cocktail_id: string | null
          created_at: string
          id: string
          image_url: string | null
          location_id: string | null
          rating: number | null
          user_id: string
          visibility: Database["public"]["Enums"]["log_permissions"] | null
        }
        Insert: {
          caption?: string | null
          cocktail_id?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          location_id?: string | null
          rating?: number | null
          user_id: string
          visibility?: Database["public"]["Enums"]["log_permissions"] | null
        }
        Update: {
          caption?: string | null
          cocktail_id?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          location_id?: string | null
          rating?: number | null
          user_id?: string
          visibility?: Database["public"]["Enums"]["log_permissions"] | null
        }
        Relationships: [
          {
            foreignKeyName: "DrinkLog_cocktail_id_fkey"
            columns: ["cocktail_id"]
            isOneToOne: false
            referencedRelation: "Cocktail"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "DrinkLog_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "Location"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "DrinkLog_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "Profile"
            referencedColumns: ["id"]
          },
        ]
      }
      DrinkLogComment: {
        Row: {
          content: string
          created_at: string | null
          drink_log_id: string
          id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          drink_log_id: string
          id?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          drink_log_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "DrinkLogComment_drink_log_id_fkey"
            columns: ["drink_log_id"]
            isOneToOne: false
            referencedRelation: "DrinkLog"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "DrinkLogComment_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "Profile"
            referencedColumns: ["id"]
          },
        ]
      }
      DrinkLogLike: {
        Row: {
          created_at: string | null
          drink_log_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          drink_log_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          drink_log_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "DrinkLogLike_drink_log_id_fkey"
            columns: ["drink_log_id"]
            isOneToOne: false
            referencedRelation: "DrinkLog"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "DrinkLogLike_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "Profile"
            referencedColumns: ["id"]
          },
        ]
      }
      Event: {
        Row: {
          cover_image: string | null
          created_at: string
          description: string | null
          end_time: string | null
          id: string
          isApprovalRequired: boolean
          isPublic: boolean
          location_id: string | null
          max_attendees: number | null
          name: string | null
          organiser_id: string | null
          party_type: Database["public"]["Enums"]["party_type"]
          price: number | null
          start_time: string | null
          type: Database["public"]["Enums"]["event_type"]
          user_location_id: string | null
        }
        Insert: {
          cover_image?: string | null
          created_at?: string
          description?: string | null
          end_time?: string | null
          id?: string
          isApprovalRequired: boolean
          isPublic: boolean
          location_id?: string | null
          max_attendees?: number | null
          name?: string | null
          organiser_id?: string | null
          party_type: Database["public"]["Enums"]["party_type"]
          price?: number | null
          start_time?: string | null
          type?: Database["public"]["Enums"]["event_type"]
          user_location_id?: string | null
        }
        Update: {
          cover_image?: string | null
          created_at?: string
          description?: string | null
          end_time?: string | null
          id?: string
          isApprovalRequired?: boolean
          isPublic?: boolean
          location_id?: string | null
          max_attendees?: number | null
          name?: string | null
          organiser_id?: string | null
          party_type?: Database["public"]["Enums"]["party_type"]
          price?: number | null
          start_time?: string | null
          type?: Database["public"]["Enums"]["event_type"]
          user_location_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Event_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "Location"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Event_organiser_id_fkey"
            columns: ["organiser_id"]
            isOneToOne: false
            referencedRelation: "Profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Event_user_location_id_fkey"
            columns: ["user_location_id"]
            isOneToOne: false
            referencedRelation: "UserLocations"
            referencedColumns: ["id"]
          },
        ]
      }
      EventRegistration: {
        Row: {
          created_at: string
          event_id: string | null
          id: string
          status: Database["public"]["Enums"]["registration_status"] | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_id?: string | null
          id?: string
          status?: Database["public"]["Enums"]["registration_status"] | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_id?: string | null
          id?: string
          status?: Database["public"]["Enums"]["registration_status"] | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "EventRegistration_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "Event"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "EventRegistration_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "Profile"
            referencedColumns: ["id"]
          },
        ]
      }
      Friendship: {
        Row: {
          created_at: string
          friend_id: string
          id: string
          status: Database["public"]["Enums"]["friendship_status"] | null
          user_id: string
        }
        Insert: {
          created_at?: string
          friend_id: string
          id?: string
          status?: Database["public"]["Enums"]["friendship_status"] | null
          user_id: string
        }
        Update: {
          created_at?: string
          friend_id?: string
          id?: string
          status?: Database["public"]["Enums"]["friendship_status"] | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "Friendship_friend_id_fkey"
            columns: ["friend_id"]
            isOneToOne: false
            referencedRelation: "Profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Friendship_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "Profile"
            referencedColumns: ["id"]
          },
        ]
      }
      Location: {
        Row: {
          city: string | null
          country: string | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          name: string | null
          rating: number | null
          street_name: string | null
          street_nr: string | null
        }
        Insert: {
          city?: string | null
          country?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string | null
          rating?: number | null
          street_name?: string | null
          street_nr?: string | null
        }
        Update: {
          city?: string | null
          country?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string | null
          rating?: number | null
          street_name?: string | null
          street_nr?: string | null
        }
        Relationships: []
      }
      Notification: {
        Row: {
          actor_id: string | null
          created_at: string
          drink_log_id: string | null
          friendship_id: string | null
          id: string
          is_read: boolean
          message: string | null
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          actor_id?: string | null
          created_at?: string
          drink_log_id?: string | null
          friendship_id?: string | null
          id?: string
          is_read?: boolean
          message?: string | null
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          actor_id?: string | null
          created_at?: string
          drink_log_id?: string | null
          friendship_id?: string | null
          id?: string
          is_read?: boolean
          message?: string | null
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "Notification_drink_log_id_fkey"
            columns: ["drink_log_id"]
            isOneToOne: false
            referencedRelation: "DrinkLog"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Notification_friendship_id_fkey"
            columns: ["friendship_id"]
            isOneToOne: false
            referencedRelation: "Friendship"
            referencedColumns: ["id"]
          },
        ]
      }
      Profile: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at: string
          email?: string | null
          full_name?: string | null
          id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
        }
        Relationships: []
      }
      ShopItem: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          image: string | null
          name: string | null
          price: number | null
          store_url: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image?: string | null
          name?: string | null
          price?: number | null
          store_url?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image?: string | null
          name?: string | null
          price?: number | null
          store_url?: string | null
        }
        Relationships: []
      }
      UserLocations: {
        Row: {
          city: string | null
          created_at: string
          creator_id: string | null
          house_nr: number | null
          id: string
          label: string | null
          street: string | null
        }
        Insert: {
          city?: string | null
          created_at?: string
          creator_id?: string | null
          house_nr?: number | null
          id?: string
          label?: string | null
          street?: string | null
        }
        Update: {
          city?: string | null
          created_at?: string
          creator_id?: string | null
          house_nr?: number | null
          id?: string
          label?: string | null
          street?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "UserLocations_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "Profile"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      ingredient_usage: {
        Args: { p_limit?: number }
        Returns: {
          count: number
          name: string
        }[]
      }
    }
    Enums: {
      cocktail_origin: "system" | "user"
      difficulty: "easy" | "medium" | "hard"
      event_type: "party" | "event"
      friendship_status: "pending" | "accepted" | "declined" | "blocked"
      log_permissions: "private" | "public" | "friends" | "only_me"
      notification_type:
        | "like"
        | "comment"
        | "friend_request"
        | "friend_accepted"
        | "close_friend_post"
      party_type:
        | "house party"
        | "outdoor event"
        | "bar meetup"
        | "themed party"
      registration_status: "registered" | "cancelled" | "waitlisted"
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
      cocktail_origin: ["system", "user"],
      difficulty: ["easy", "medium", "hard"],
      event_type: ["party", "event"],
      friendship_status: ["pending", "accepted", "declined", "blocked"],
      log_permissions: ["private", "public", "friends", "only_me"],
      notification_type: [
        "like",
        "comment",
        "friend_request",
        "friend_accepted",
        "close_friend_post",
      ],
      party_type: [
        "house party",
        "outdoor event",
        "bar meetup",
        "themed party",
      ],
      registration_status: ["registered", "cancelled", "waitlisted"],
    },
  },
} as const
