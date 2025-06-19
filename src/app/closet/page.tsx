'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/lib/AuthContext'
import { getClothingItems, getOutfits, getTravelOutfits, deleteClothingItem, deleteOutfit, deleteTravelOutfit } from '@/lib/closet'
import { ClothingItem, Outfit, TravelOutfit } from '@/lib/supabase'
import Link from 'next/link'
import { Plus, Heart, MapPin, Camera, Trash2, Edit, User, LogOut, Home } from 'lucide-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'

export default function ClosetPage() {
  const { user } = useAuth()
  const [clothingItems, setClothingItems] = useState<ClothingItem[]>([])
  const [outfits, setOutfits] = useState<Outfit[]>([])
  const [travelOutfits, setTravelOutfits] = useState<TravelOutfit[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'clothing' | 'outfits' | 'travel'>('clothing')
  const [error, setError] = useState('')
  const router = useRouter()

  // 登出功能
  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/auth')
    } catch (error) {
      console.error('登出失敗:', error)
    }
  }

  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user, activeTab])

  const loadData = async () => {
    if (!user) return
    
    setLoading(true)
    setError('')
    
    try {
      switch (activeTab) {
        case 'clothing':
          const items = await getClothingItems(user.id)
          setClothingItems(items)
          break
        case 'outfits':
          const outfitData = await getOutfits(user.id)
          setOutfits(outfitData)
          break
        case 'travel':
          const travelData = await getTravelOutfits(user.id)
          setTravelOutfits(travelData)
          break
      }
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteClothing = async (id: string) => {
    if (!user || !confirm('確定要刪除此衣物嗎？')) return
    
    try {
      await deleteClothingItem(id, user.id)
      setClothingItems(clothingItems.filter(item => item.id !== id))
    } catch (error: any) {
      setError(error.message)
    }
  }

  const handleDeleteOutfit = async (id: string) => {
    if (!user || !confirm('確定要刪除此搭配嗎？')) return
    
    try {
      await deleteOutfit(id, user.id)
      setOutfits(outfits.filter(outfit => outfit.id !== id))
    } catch (error: any) {
      setError(error.message)
    }
  }

  const handleDeleteTravelOutfit = async (id: string) => {
    if (!user || !confirm('確定要刪除此旅行搭配嗎？')) return
    
    try {
      await deleteTravelOutfit(id, user.id)
      setTravelOutfits(travelOutfits.filter(outfit => outfit.id !== id))
    } catch (error: any) {
      setError(error.message)
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'top': return '👕'
      case 'bottom': return '👖'
      case 'dress': return '👗'
      case 'outerwear': return '🧥'
      case 'shoes': return '👠'
      case 'accessories': return '👜'
      default: return '👕'
    }
  }

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'top': return '上衣'
      case 'bottom': return '褲子'
      case 'dress': return '洋裝'
      case 'outerwear': return '外套'
      case 'shoes': return '鞋子'
      case 'accessories': return '配件'
      default: return '其他'
    }
  }

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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header active="closet" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 頁面標題 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">我的數位衣櫥</h1>
          <p className="text-gray-600 mt-2">管理您的衣物、搭配和旅行造型</p>
        </div>

        {/* 錯誤訊息 */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* 統計卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-2xl">👕</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">衣物總數</p>
                <p className="text-2xl font-bold text-gray-900">{clothingItems.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <span className="text-2xl">👗</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">搭配組合</p>
                <p className="text-2xl font-bold text-gray-900">{outfits.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-2xl">✈️</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">旅行造型</p>
                <p className="text-2xl font-bold text-gray-900">{travelOutfits.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 標籤頁 */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('clothing')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'clothing'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                衣物 ({clothingItems.length})
              </button>
              <button
                onClick={() => setActiveTab('outfits')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'outfits'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                搭配 ({outfits.length})
              </button>
              <button
                onClick={() => setActiveTab('travel')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'travel'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                旅行造型 ({travelOutfits.length})
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* 新增按鈕 */}
            <div className="mb-6">
              {activeTab === 'clothing' && (
                <Link
                  href="/closet/add-item"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  新增衣物
                </Link>
              )}
            </div>

            {/* 載入中狀態 */}
            {loading && (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            )}

            {/* 衣物列表 */}
            {!loading && activeTab === 'clothing' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {clothingItems.map((item) => (
                  <div key={item.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="relative h-48">
                      <Image
                        src={item.image_url}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">{item.name}</h3>
                        <span className="text-2xl">{getCategoryIcon(item.category)}</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{getCategoryName(item.category)}</p>
                      <p className="text-sm text-gray-600 mb-2">顏色：{item.color}</p>
                      <p className="text-sm text-gray-600 mb-3">季節：{item.season}</p>
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleDeleteClothing(item.id)}
                          className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 搭配列表 */}
            {!loading && activeTab === 'outfits' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {outfits.map((outfit) => (
                  <div key={outfit.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">{outfit.name}</h3>
                      {outfit.is_favorite && <Heart className="text-red-500" size={20} />}
                    </div>
                    {outfit.description && (
                      <p className="text-sm text-gray-600 mb-3">{outfit.description}</p>
                    )}
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleDeleteOutfit(outfit.id)}
                        className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 旅行造型列表 */}
            {!loading && activeTab === 'travel' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {travelOutfits.map((outfit) => (
                  <div key={outfit.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="relative h-48">
                      <Image
                        src={outfit.destination_image}
                        alt={outfit.destination_name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{outfit.destination_name}</h3>
                        {outfit.is_favorite && <Heart className="text-red-500" size={20} />}
                      </div>
                      <p className="text-sm text-gray-600 mb-2 flex items-center">
                        <MapPin size={14} className="mr-1" />
                        {outfit.destination_address}
                      </p>
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleDeleteTravelOutfit(outfit.id)}
                          className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 空狀態 */}
            {!loading && (
              (activeTab === 'clothing' && clothingItems.length === 0) ||
              (activeTab === 'outfits' && outfits.length === 0) ||
              (activeTab === 'travel' && travelOutfits.length === 0)
            ) && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">
                  {activeTab === 'clothing' && '👕'}
                  {activeTab === 'outfits' && '👗'}
                  {activeTab === 'travel' && '✈️'}
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {activeTab === 'clothing' && '還沒有衣物'}
                  {activeTab === 'outfits' && '還沒有搭配'}
                  {activeTab === 'travel' && '還沒有旅行造型'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {activeTab === 'clothing' && '開始新增您的第一件衣物吧！'}
                  {activeTab === 'outfits' && '開始建立您的第一個搭配吧！'}
                  {activeTab === 'travel' && '開始規劃您的第一個旅行造型吧！'}
                </p>
                {activeTab === 'clothing' && (
                  <Link
                    href="/closet/add-item"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    新增衣物
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 