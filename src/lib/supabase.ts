import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// 建立單一的 Supabase client 實例
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // 自動重新整理 session
    autoRefreshToken: true,
    // 持久化 session
    persistSession: true,
    // 偵測 session 變化
    detectSessionInUrl: true
  }
})

// 資料庫類型定義
export interface User {
  id: string
  email: string
  created_at: string
  updated_at: string
  name?: string
  avatar_url?: string
}

export interface ClothingItem {
  id: string
  user_id: string
  name: string
  category: 'top' | 'bottom' | 'dress' | 'outerwear' | 'shoes' | 'accessories'
  color: string
  season: 'spring' | 'summer' | 'autumn' | 'winter' | 'all'
  image_url: string
  created_at: string
  updated_at: string
  tags?: string[]
  description?: string
}

export interface Outfit {
  id: string
  user_id: string
  name: string
  description?: string
  clothing_items: string[] // clothing_item IDs
  created_at: string
  updated_at: string
  is_favorite: boolean
  tags?: string[]
}

export interface TravelOutfit {
  id: string
  user_id: string
  destination_name: string
  destination_address: string
  destination_image: string
  generated_outfit_image: string
  created_at: string
  updated_at: string
  is_favorite: boolean
  weather_info?: string
  notes?: string
} 