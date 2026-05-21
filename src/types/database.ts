export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type UserRole = "customer" | "seller" | "admin" | "support"
export type ProductStatus = "draft" | "pending_review" | "active" | "sold" | "archived"
export type ProductCondition = "mint" | "excellent" | "very_good" | "good" | "fair"
export type OrderStatus =
  | "pending"
  | "payment_processing"
  | "confirmed"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded"
export type TicketStatus = "open" | "in_progress" | "resolved" | "closed"
export type TicketPriority = "low" | "medium" | "high" | "urgent"

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          role: UserRole
          full_name: string | null
          avatar_url: string | null
          bio: string | null
          phone: string | null
          stripe_customer_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          role?: UserRole
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          phone?: string | null
          stripe_customer_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>
        Relationships: []
      }
      seller_profiles: {
        Row: {
          id: string
          user_id: string
          business_name: string
          description: string | null
          logo_url: string | null
          banner_url: string | null
          website_url: string | null
          instagram_url: string | null
          total_sales: number
          total_revenue: number
          rating: number | null
          review_count: number
          stripe_account_id: string | null
          stripe_onboarding_complete: boolean
          verified: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          business_name: string
          description?: string | null
          logo_url?: string | null
          banner_url?: string | null
          website_url?: string | null
          instagram_url?: string | null
          total_sales?: number
          total_revenue?: number
          rating?: number | null
          review_count?: number
          stripe_account_id?: string | null
          stripe_onboarding_complete?: boolean
          verified?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database["public"]["Tables"]["seller_profiles"]["Insert"]>
        Relationships: [
          {
            foreignKeyName: "seller_profiles_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          image_url: string | null
          parent_id: string | null
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          image_url?: string | null
          parent_id?: string | null
          sort_order?: number
          created_at?: string
        }
        Update: Partial<Database["public"]["Tables"]["categories"]["Insert"]>
        Relationships: []
      }
      products: {
        Row: {
          id: string
          seller_id: string
          category_id: string
          title: string
          slug: string
          description: string | null
          condition: ProductCondition
          status: ProductStatus
          price: number
          original_price: number | null
          currency: string
          sku: string | null
          attributes: Json
          provenance_notes: string | null
          certificate_url: string | null
          is_featured: boolean
          is_trending: boolean
          view_count: number
          wishlist_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          seller_id: string
          category_id: string
          title: string
          slug: string
          description?: string | null
          condition?: ProductCondition
          status?: ProductStatus
          price: number
          original_price?: number | null
          currency?: string
          sku?: string | null
          attributes?: Json
          provenance_notes?: string | null
          certificate_url?: string | null
          is_featured?: boolean
          is_trending?: boolean
          view_count?: number
          wishlist_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database["public"]["Tables"]["products"]["Insert"]>
        Relationships: [
          {
            foreignKeyName: "products_seller_id_fkey"
            columns: ["seller_id"]
            referencedRelation: "seller_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      product_images: {
        Row: {
          id: string
          product_id: string
          url: string
          alt: string | null
          sort_order: number
          is_primary: boolean
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          url: string
          alt?: string | null
          sort_order?: number
          is_primary?: boolean
          created_at?: string
        }
        Update: Partial<Database["public"]["Tables"]["product_images"]["Insert"]>
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          id: string
          buyer_id: string
          status: OrderStatus
          total_amount: number
          platform_fee: number
          stripe_payment_intent_id: string | null
          stripe_payment_status: string | null
          shipping_address: Json | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          buyer_id: string
          status?: OrderStatus
          total_amount: number
          platform_fee?: number
          stripe_payment_intent_id?: string | null
          stripe_payment_status?: string | null
          shipping_address?: Json | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database["public"]["Tables"]["orders"]["Insert"]>
        Relationships: [
          {
            foreignKeyName: "orders_buyer_id_fkey"
            columns: ["buyer_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string
          seller_id: string
          title: string
          price: number
          quantity: number
          stripe_transfer_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          product_id: string
          seller_id: string
          title: string
          price: number
          quantity?: number
          stripe_transfer_id?: string | null
          created_at?: string
        }
        Update: Partial<Database["public"]["Tables"]["order_items"]["Insert"]>
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          id: string
          product_id: string
          reviewer_id: string
          order_id: string | null
          rating: number
          title: string | null
          body: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          product_id: string
          reviewer_id: string
          order_id?: string | null
          rating: number
          title?: string | null
          body?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database["public"]["Tables"]["reviews"]["Insert"]>
        Relationships: [
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      wishlist_items: {
        Row: {
          id: string
          user_id: string
          product_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          product_id: string
          created_at?: string
        }
        Update: Partial<Database["public"]["Tables"]["wishlist_items"]["Insert"]>
        Relationships: [
          {
            foreignKeyName: "wishlist_items_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wishlist_items_product_id_fkey"
            columns: ["product_id"]
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      cart_items: {
        Row: {
          id: string
          user_id: string
          product_id: string
          quantity: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          product_id: string
          quantity?: number
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database["public"]["Tables"]["cart_items"]["Insert"]>
        Relationships: [
          {
            foreignKeyName: "cart_items_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          id: string
          user_id: string
          assigned_to: string | null
          order_id: string | null
          subject: string
          status: TicketStatus
          priority: TicketPriority
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          assigned_to?: string | null
          order_id?: string | null
          subject: string
          status?: TicketStatus
          priority?: TicketPriority
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database["public"]["Tables"]["support_tickets"]["Insert"]>
        Relationships: [
          {
            foreignKeyName: "support_tickets_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      support_messages: {
        Row: {
          id: string
          ticket_id: string
          sender_id: string
          body: string
          is_internal: boolean
          created_at: string
        }
        Insert: {
          id?: string
          ticket_id: string
          sender_id: string
          body: string
          is_internal?: boolean
          created_at?: string
        }
        Update: Partial<Database["public"]["Tables"]["support_messages"]["Insert"]>
        Relationships: [
          {
            foreignKeyName: "support_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_messages_sender_id_fkey"
            columns: ["sender_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          body: string | null
          href: string | null
          read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          title: string
          body?: string | null
          href?: string | null
          read?: boolean
          created_at?: string
        }
        Update: Partial<Database["public"]["Tables"]["notifications"]["Insert"]>
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_subscribers: {
        Row: {
          id: string
          email: string
          subscribed_at: string
        }
        Insert: {
          id?: string
          email: string
          subscribed_at?: string
        }
        Update: Partial<Database["public"]["Tables"]["newsletter_subscribers"]["Insert"]>
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      user_role: UserRole
      product_status: ProductStatus
      product_condition: ProductCondition
      order_status: OrderStatus
      ticket_status: TicketStatus
      ticket_priority: TicketPriority
    }
    CompositeTypes: Record<string, never>
  }
}

// Convenience helpers
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"]
export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"]
export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"]
export type Enums<T extends keyof Database["public"]["Enums"]> =
  Database["public"]["Enums"][T]

// Entity aliases
export type Profile = Tables<"profiles">
export type SellerProfile = Tables<"seller_profiles">
export type Category = Tables<"categories">
export type Product = Tables<"products">
export type ProductImage = Tables<"product_images">
export type Order = Tables<"orders">
export type OrderItem = Tables<"order_items">
export type Review = Tables<"reviews">
export type WishlistItem = Tables<"wishlist_items">
export type CartItem = Tables<"cart_items">
export type SupportTicket = Tables<"support_tickets">
export type SupportMessage = Tables<"support_messages">
export type Notification = Tables<"notifications">
export type NewsletterSubscriber = Tables<"newsletter_subscribers">

// Joined / enriched types used across the UI
export type ProductWithRelations = Product & {
  product_images: ProductImage[]
  seller_profiles: Pick<SellerProfile, "business_name" | "verified" | "logo_url" | "rating">
  categories: Pick<Category, "name" | "slug">
}

export type OrderWithItems = Order & {
  order_items: (OrderItem & {
    products: Pick<Product, "title" | "slug">
  })[]
}

export type TicketWithMessages = SupportTicket & {
  support_messages: SupportMessage[]
  profiles: Pick<Profile, "full_name" | "avatar_url">
}
