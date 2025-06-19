'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/lib/AuthContext'
import { getClothingItems, getOutfits, getTravelOutfits, deleteClothingItem, deleteOutfit, deleteTravelOutfit } from '@/lib/closet'
import { ClothingItem, Outfit, TravelOutfit } from '@/lib/supabase'
import Link from 'next/link'
import { Plus, Heart, MapPin, Camera, Trash2, Edit } from 'lucide-react'

export default function ClosetPage() {
  const { user } = useAuth()
  const [clothingItems, setClothingItems] = useState<ClothingItem[]>([])
  const [outfits, setOutfits] = useState<Outfit[]>([])
  const [travelOutfits, setTravelOutfits] = useState<TravelOutfit[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'clothing' | 'outfits' | 'travel'>('clothing')
  const [error, setError] = useState('')

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
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              </div>
            ) : (
              <>
                {/* 衣物標籤頁 */}
                {activeTab === 'clothing' && (
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-medium text-gray-900">我的衣物</h3>
                      <Link
                        href="/closet/add-item"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        新增衣物
                      </Link>
                    </div>
                    
                    {clothingItems.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="text-6xl mb-4">👕</div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">還沒有衣物</h3>
                        <p className="text-gray-600 mb-4">開始新增您的第一件衣物吧！</p>
                        <Link
                          href="/closet/add-item"
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          新增衣物
                        </Link>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {clothingItems.map((item) => (
                          <div key={item.id} className="bg-gray-50 rounded-lg overflow-hidden">
                            <div className="aspect-w-1 aspect-h-1">
                              <img
                                src={item.image_url}
                                alt={item.name}
                                className="w-full h-48 object-cover"
                              />
                            </div>
                            <div className="p-4">
                              <h3 className="font-medium text-gray-900 mb-1">{item.name}</h3>
                              <p className="text-sm text-gray-600 mb-2">{item.color}</p>
                              <div className="flex justify-between items-center">
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  {item.category}
                                </span>
                                <div className="flex space-x-1">
                                  <button
                                    onClick={() => handleDeleteClothing(item.id)}
                                    className="text-red-600 hover:text-red-800"
                                    title="刪除"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* 搭配標籤頁 */}
                {activeTab === 'outfits' && (
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-medium text-gray-900">我的搭配</h3>
                      <Link
                        href="/closet/create-outfit"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        建立搭配
                      </Link>
                    </div>
                    
                    {outfits.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="text-6xl mb-4">👗</div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">還沒有搭配</h3>
                        <p className="text-gray-600 mb-4">開始建立您的第一個搭配吧！</p>
                        <Link
                          href="/closet/create-outfit"
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          建立搭配
                        </Link>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {outfits.map((outfit) => (
                          <div key={outfit.id} className="bg-gray-50 rounded-lg p-4">
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="font-medium text-gray-900">{outfit.name}</h3>
                              <div className="flex space-x-1">
                                <button
                                  onClick={() => handleDeleteOutfit(outfit.id)}
                                  className="text-red-600 hover:text-red-800"
                                  title="刪除"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                            {outfit.description && (
                              <p className="text-sm text-gray-600 mb-2">{outfit.description}</p>
                            )}
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-500">
                                {outfit.clothing_items.length} 件衣物
                              </span>
                              {outfit.is_favorite && (
                                <Heart className="w-4 h-4 text-red-500 fill-current" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* 旅行造型標籤頁 */}
                {activeTab === 'travel' && (
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-medium text-gray-900">旅行造型</h3>
                      <Link
                        href="/"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                      >
                        <Camera className="w-4 h-4 mr-2" />
                        生成旅行造型
                      </Link>
                    </div>
                    
                    {travelOutfits.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="text-6xl mb-4">✈️</div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">還沒有旅行造型</h3>
                        <p className="text-gray-600 mb-4">開始生成您的第一個旅行造型吧！</p>
                        <Link
                          href="/"
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                        >
                          <Camera className="w-4 h-4 mr-2" />
                          生成旅行造型
                        </Link>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {travelOutfits.map((outfit) => (
                          <div key={outfit.id} className="bg-gray-50 rounded-lg overflow-hidden">
                            <div className="aspect-w-16 aspect-h-9">
                              <img
                                src={outfit.generated_outfit_image}
                                alt={outfit.destination_name}
                                className="w-full h-48 object-cover"
                              />
                            </div>
                            <div className="p-4">
                              <div className="flex justify-between items-start mb-2">
                                <h3 className="font-medium text-gray-900">{outfit.destination_name}</h3>
                                <div className="flex space-x-1">
                                  <button
                                    onClick={() => handleDeleteTravelOutfit(outfit.id)}
                                    className="text-red-600 hover:text-red-800"
                                    title="刪除"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                              <div className="flex items-center text-sm text-gray-600 mb-2">
                                <MapPin className="w-4 h-4 mr-1" />
                                {outfit.destination_address}
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500">
                                  {new Date(outfit.created_at).toLocaleDateString()}
                                </span>
                                {outfit.is_favorite && (
                                  <Heart className="w-4 h-4 text-red-500 fill-current" />
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 