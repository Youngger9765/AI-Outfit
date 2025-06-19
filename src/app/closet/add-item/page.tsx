'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/AuthContext'
import Image from 'next/image'
import imageCompression from 'browser-image-compression'
import Link from 'next/link'
import { INPUT_LIMITS } from '@/lib/security'
import { supabase } from '@/lib/supabase'

export default function AddItemPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [formData, setFormData] = useState({
    name: '',
    category: 'top',
    color: '',
    season: 'all',
    description: '',
  })

  // 檢查用戶是否已登入
  useEffect(() => {
    const checkUser = async () => {
      if (!user) {
        console.log('未找到用戶，重新導向到登入頁面')
        router.push('/auth')
        return
      }

      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) {
          console.error('取得 session 錯誤:', error)
          router.push('/auth')
          return
        }
        
        if (!session) {
          console.log('未找到 session，嘗試重新整理 session')
          const { error: refreshError } = await supabase.auth.refreshSession()
          if (refreshError) {
            console.error('重新整理 session 失敗:', refreshError)
            router.push('/auth')
            return
          }
        } else {
          console.log('用戶已登入:', {
            id: session.user.id,
            email: session.user.email,
            sessionExpires: session.expires_at
          })
        }
      } catch (error) {
        console.error('檢查用戶狀態時發生錯誤:', error)
        router.push('/auth')
      }
    }

    checkUser()
  }, [user, router])

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 驗證檔案類型
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      alert('只允許上傳 JPG、PNG、WebP 或 GIF 圖片')
      return
    }

    // 設定預覽
    const objectUrl = URL.createObjectURL(file)
    setPreviewUrl(objectUrl)
    setSelectedFile(file)

    // 清理前一個預覽URL
    return () => URL.revokeObjectURL(objectUrl)
  }

  const compressImage = async (file: File): Promise<File> => {
    const options = {
      maxSizeMB: 0.2,
      maxWidthOrHeight: 1200,
      useWebWorker: true,
    }

    try {
      const compressedFile = await imageCompression(file, options)
      console.log('原始檔案大小:', file.size / 1024 / 1024, 'MB')
      console.log('壓縮後檔案大小:', compressedFile.size / 1024 / 1024, 'MB')
      return compressedFile
    } catch (error) {
      console.error('圖片壓縮失敗:', error)
      throw new Error('圖片壓縮失敗: ' + (error instanceof Error ? error.message : '未知錯誤'))
    }
  }

  const uploadImage = async (file: File): Promise<string> => {
    if (!user) {
      throw new Error('請先登入')
    }

    try {
      // 先取得最新的 session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      if (sessionError) {
        console.error('取得 session 錯誤:', sessionError)
        throw new Error('無法取得 session')
      }

      if (!session) {
        console.log('嘗試重新整理 session')
        const { error: refreshError } = await supabase.auth.refreshSession()
        if (refreshError) {
          console.error('重新整理 session 失敗:', refreshError)
          throw new Error('請重新登入')
        }
      }

      // 再次確認 session
      const { data: { session: currentSession } } = await supabase.auth.getSession()
      if (!currentSession) {
        throw new Error('無法取得有效的 session')
      }

      // 壓縮圖片
      const compressedFile = await compressImage(file)

      // 生成唯一的檔案名稱
      const timestamp = Date.now()
      const fileExt = file.name.split('.').pop()
      const fileName = `${timestamp}.${fileExt}`

      console.log('準備上傳檔案:', {
        fileName,
        fileSize: compressedFile.size,
        fileType: compressedFile.type,
        userId: currentSession.user.id,
        bucket: 'closet-images'
      })

      // 上傳到 Supabase Storage
      const { error: uploadError, data } = await supabase.storage
        .from('closet-images')
        .upload(fileName, compressedFile, {
          cacheControl: '3600',
          upsert: true,
          contentType: compressedFile.type
        })

      if (uploadError) {
        console.error('上傳錯誤詳情:', {
          message: uploadError.message,
          name: uploadError.name,
          stack: uploadError.stack
        })
        throw new Error(`上傳失敗: ${uploadError.message}`)
      }

      if (!data?.path) {
        throw new Error('上傳失敗：沒有收到檔案路徑')
      }

      // 取得公開 URL
      const { data: { publicUrl } } = supabase.storage
        .from('closet-images')
        .getPublicUrl(data.path)

      if (!publicUrl) {
        throw new Error('無法取得圖片 URL')
      }

      console.log('上傳成功:', {
        path: data.path,
        publicUrl,
        fileInfo: {
          size: compressedFile.size,
          type: compressedFile.type
        }
      })

      return publicUrl
    } catch (error) {
      console.error('圖片上傳失敗:', error)
      if (error instanceof Error) {
        console.error('錯誤詳情:', {
          message: error.message,
          name: error.name,
          stack: error.stack
        })
      }
      throw error
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedFile) {
      alert('請選擇衣物圖片')
      return
    }

    if (!user) {
      alert('請先登入')
      router.push('/auth')
      return
    }

    // 驗證必填欄位
    if (!formData.name.trim()) {
      alert('請輸入衣物名稱')
      return
    }

    if (!formData.category) {
      alert('請選擇衣物分類')
      return
    }

    if (!formData.color.trim()) {
      alert('請輸入衣物顏色')
      return
    }

    if (!formData.season) {
      alert('請選擇適合季節')
      return
    }

    // 驗證分類值是否符合資料庫約束
    const validCategories = ['top', 'bottom', 'dress', 'outerwear', 'shoes', 'accessories']
    if (!validCategories.includes(formData.category)) {
      alert('無效的衣物分類')
      return
    }

    // 驗證季節值是否符合資料庫約束
    const validSeasons = ['spring', 'summer', 'autumn', 'winter', 'all']
    if (!validSeasons.includes(formData.season)) {
      alert('無效的季節選擇')
      return
    }

    try {
      setLoading(true)

      console.log('準備新增衣物:', {
        ...formData,
        user_id: user.id
      })

      // 上傳圖片並取得 URL
      const imageUrl = await uploadImage(selectedFile)
      console.log('圖片上傳成功，URL:', imageUrl)

      // 新增衣物到資料庫
      const { error: insertError } = await supabase
        .from('clothing_items')
        .insert({
          ...formData,
          image_url: imageUrl,
          user_id: user.id
        })

      if (insertError) {
        console.error('新增衣物錯誤:', insertError)
        throw new Error(`新增衣物失敗: ${insertError.message}`)
      }

      console.log('衣物新增成功')
      // 成功後導向衣櫥頁面
      router.push('/closet')
      router.refresh()
    } catch (error) {
      console.error('新增衣物失敗:', error)
      alert(error instanceof Error ? error.message : '新增衣物失敗，請稍後再試')
    } finally {
      setLoading(false)
    }
  }

  // 如果正在檢查用戶狀態，顯示載入中
  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">新增衣物</h1>
      <form onSubmit={handleSubmit} className="max-w-2xl">
        <div className="mb-6">
          <label className="block mb-2">衣物圖片 *</label>
          <div className="flex items-center space-x-4">
            {previewUrl && (
              <div className="relative w-32 h-32">
                <Image
                  src={previewUrl}
                  alt="Preview"
                  fill
                  className="object-cover rounded-lg"
                />
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
              required
            />
          </div>
        </div>

        {/* 衣物名稱 */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            衣物名稱 * ({formData.name.length}/{INPUT_LIMITS.NAME_MAX_LENGTH})
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            maxLength={INPUT_LIMITS.NAME_MAX_LENGTH}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="例如：白色 T 恤"
          />
        </div>

        {/* 分類 */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">
            分類 *
          </label>
          <select
            id="category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="top">上衣</option>
            <option value="bottom">褲子</option>
            <option value="dress">洋裝</option>
            <option value="outerwear">外套</option>
            <option value="shoes">鞋子</option>
            <option value="accessories">配件</option>
          </select>
        </div>

        {/* 顏色 */}
        <div>
          <label htmlFor="color" className="block text-sm font-medium text-gray-700">
            顏色 * ({formData.color.length}/{INPUT_LIMITS.COLOR_MAX_LENGTH})
          </label>
          <input
            type="text"
            id="color"
            value={formData.color}
            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
            required
            maxLength={INPUT_LIMITS.COLOR_MAX_LENGTH}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="例如：白色、黑色、藍色"
          />
        </div>

        {/* 季節 */}
        <div>
          <label htmlFor="season" className="block text-sm font-medium text-gray-700">
            適合季節 *
          </label>
          <select
            id="season"
            value={formData.season}
            onChange={(e) => setFormData({ ...formData, season: e.target.value })}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="spring">春季</option>
            <option value="summer">夏季</option>
            <option value="autumn">秋季</option>
            <option value="winter">冬季</option>
            <option value="all">全年</option>
          </select>
        </div>

        {/* 描述 */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            描述 ({formData.description.length}/{INPUT_LIMITS.DESCRIPTION_MAX_LENGTH})
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            maxLength={INPUT_LIMITS.DESCRIPTION_MAX_LENGTH}
            rows={3}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="衣物的詳細描述..."
          />
        </div>

        {/* 提交按鈕 */}
        <div className="flex justify-end space-x-4">
          <Link
            href="/closet"
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            取消
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? '新增中...' : '新增衣物'}
          </button>
        </div>
      </form>
    </div>
  )
} 