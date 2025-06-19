'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/AuthContext'
import { addClothingItem, uploadImage } from '@/lib/closet'
import { ClothingItem } from '@/lib/supabase'
import Link from 'next/link'
import { ArrowLeft, Upload, X, Plus, Tag } from 'lucide-react'
import { validateImageFile, validateInputLength, validateTags, INPUT_LIMITS } from '@/lib/security'

export default function AddItemPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  // 表單狀態
  const [name, setName] = useState('')
  const [category, setCategory] = useState<ClothingItem['category']>('top')
  const [color, setColor] = useState('')
  const [season, setSeason] = useState<ClothingItem['season']>('all')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState('')
  
  // 圖片上傳
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">請先登入</h2>
          <Link href="/auth" className="text-blue-600 hover:text-blue-500">
            前往登入
          </Link>
        </div>
      </div>
    )
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 檔案驗證
    const validation = validateImageFile(file)
    if (!validation.valid) {
      setError(validation.error!)
      return
    }

    setImageFile(file)
    setError('')
    
    // 建立預覽
    const reader = new FileReader()
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleAddTag = () => {
    if (!newTag.trim()) return

    // 標籤驗證
    if (!validateInputLength(newTag, INPUT_LIMITS.TAG_MAX_LENGTH)) {
      setError(`標籤不能超過 ${INPUT_LIMITS.TAG_MAX_LENGTH} 個字元`)
      return
    }

    if (tags.length >= INPUT_LIMITS.MAX_TAGS_COUNT) {
      setError(`標籤數量不能超過 ${INPUT_LIMITS.MAX_TAGS_COUNT} 個`)
      return
    }

    if (tags.includes(newTag.trim())) {
      setError('標籤已存在')
      return
    }

    setTags([...tags, newTag.trim()])
    setNewTag('')
    setError('')
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!imageFile) {
      setError('請選擇衣物圖片')
      return
    }

    // 輸入驗證
    if (!validateInputLength(name, INPUT_LIMITS.NAME_MAX_LENGTH)) {
      setError(`衣物名稱不能超過 ${INPUT_LIMITS.NAME_MAX_LENGTH} 個字元`)
      return
    }

    if (!validateInputLength(color, INPUT_LIMITS.COLOR_MAX_LENGTH)) {
      setError(`顏色不能超過 ${INPUT_LIMITS.COLOR_MAX_LENGTH} 個字元`)
      return
    }

    if (description && !validateInputLength(description, INPUT_LIMITS.DESCRIPTION_MAX_LENGTH)) {
      setError(`描述不能超過 ${INPUT_LIMITS.DESCRIPTION_MAX_LENGTH} 個字元`)
      return
    }

    const tagValidation = validateTags(tags)
    if (!tagValidation.valid) {
      setError(tagValidation.error!)
      return
    }

    setLoading(true)
    setError('')

    try {
      // 上傳圖片
      const imageUrl = await uploadImage(imageFile, user.id)

      // 新增衣物到資料庫
      await addClothingItem({
        user_id: user.id,
        name,
        category,
        color,
        season,
        image_url: imageUrl,
        description: description || undefined,
        tags: tags.length > 0 ? tags : undefined
      })

      router.push('/closet')
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 頁面標題 */}
        <div className="mb-8">
          <Link href="/closet" className="inline-flex items-center text-blue-600 hover:text-blue-500 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回衣櫥
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">新增衣物</h1>
          <p className="text-gray-600 mt-2">為您的數位衣櫥添加新衣物</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 錯誤訊息 */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {/* 圖片上傳 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                衣物圖片 *
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                {imagePreview ? (
                  <div className="space-y-4">
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="mx-auto h-64 w-auto rounded-lg object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImageFile(null)
                          setImagePreview('')
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-sm text-gray-600">圖片已選擇</p>
                  </div>
                ) : (
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="image-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                      >
                        <span>上傳圖片</span>
                        <input
                          id="image-upload"
                          name="image-upload"
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          onChange={handleImageChange}
                          required
                        />
                      </label>
                      <p className="pl-1">或拖拽到這裡</p>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, WebP, GIF 最大 10MB</p>
                  </div>
                )}
              </div>
            </div>

            {/* 衣物名稱 */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                衣物名稱 * ({name.length}/{INPUT_LIMITS.NAME_MAX_LENGTH})
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
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
                value={category}
                onChange={(e) => setCategory(e.target.value as ClothingItem['category'])}
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
                顏色 * ({color.length}/{INPUT_LIMITS.COLOR_MAX_LENGTH})
              </label>
              <input
                type="text"
                id="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
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
                value={season}
                onChange={(e) => setSeason(e.target.value as ClothingItem['season'])}
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
                描述 ({description.length}/{INPUT_LIMITS.DESCRIPTION_MAX_LENGTH})
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={INPUT_LIMITS.DESCRIPTION_MAX_LENGTH}
                rows={3}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="衣物的詳細描述..."
              />
            </div>

            {/* 標籤 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                標籤 ({tags.length}/{INPUT_LIMITS.MAX_TAGS_COUNT})
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  maxLength={INPUT_LIMITS.TAG_MAX_LENGTH}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="新增標籤..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddTag()
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                    >
                      <Tag className="w-3 h-3 mr-1" />
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
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
      </div>
    </div>
  )
} 