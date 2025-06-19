'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from './supabase'

interface AuthContextType {
  user: User | null
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 檢查初始 session
    const checkUser = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) {
          console.error('取得 session 錯誤:', error)
          return
        }

        if (session?.user) {
          console.log('已找到 session:', {
            id: session.user.id,
            email: session.user.email,
            sessionExpires: session.expires_at
          })
          setUser(session.user)
        }
      } catch (error) {
        console.error('檢查用戶狀態時發生錯誤:', error)
      } finally {
        setLoading(false)
      }
    }

    checkUser()

    // 監聽認證狀態變化
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('認證狀態變化:', event, session?.user?.email)
      
      if (session?.user) {
        console.log('用戶已登入/更新:', {
          id: session.user.id,
          email: session.user.email,
          sessionExpires: session.expires_at
        })
        setUser(session.user)
      } else {
        console.log('用戶已登出或 session 無效')
        setUser(null)
      }
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 