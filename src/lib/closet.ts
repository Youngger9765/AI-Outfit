import { supabase, ClothingItem, Outfit, TravelOutfit } from './supabase'
import { 
  validateImageFile, 
  generateSafeFileName, 
  sanitizeHtml, 
  validateInputLength, 
  validateTags, 
  checkUserOwnership, 
  getSafeErrorMessage,
  INPUT_LIMITS 
} from './security'

// 新增衣物
export const addClothingItem = async (item: Omit<ClothingItem, 'id' | 'created_at' | 'updated_at'>) => {
  // 輸入驗證
  if (!validateInputLength(item.name, INPUT_LIMITS.NAME_MAX_LENGTH)) {
    throw new Error(`衣物名稱不能超過 ${INPUT_LIMITS.NAME_MAX_LENGTH} 個字元`)
  }
  
  if (!validateInputLength(item.color, INPUT_LIMITS.COLOR_MAX_LENGTH)) {
    throw new Error(`顏色不能超過 ${INPUT_LIMITS.COLOR_MAX_LENGTH} 個字元`)
  }
  
  if (item.description && !validateInputLength(item.description, INPUT_LIMITS.DESCRIPTION_MAX_LENGTH)) {
    throw new Error(`描述不能超過 ${INPUT_LIMITS.DESCRIPTION_MAX_LENGTH} 個字元`)
  }
  
  if (item.tags) {
    const tagValidation = validateTags(item.tags)
    if (!tagValidation.valid) {
      throw new Error(tagValidation.error)
    }
  }

  // 清理輸入內容
  const sanitizedItem = {
    ...item,
    name: sanitizeHtml(item.name),
    color: sanitizeHtml(item.color),
    description: item.description ? sanitizeHtml(item.description) : undefined,
    tags: item.tags ? item.tags.map(tag => sanitizeHtml(tag)) : undefined
  }

  const { data, error } = await supabase
    .from('clothing_items')
    .insert([sanitizedItem])
    .select()
    .single()
  
  if (error) throw new Error(getSafeErrorMessage(error))
  return data
}

// 取得用戶的所有衣物
export const getClothingItems = async (userId: string, category?: string) => {
  if (!userId) {
    throw new Error('用戶 ID 不能為空')
  }

  let query = supabase
    .from('clothing_items')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  
  if (category) {
    // 驗證分類是否有效
    const validCategories = ['top', 'bottom', 'dress', 'outerwear', 'shoes', 'accessories']
    if (!validCategories.includes(category)) {
      throw new Error('無效的分類')
    }
    query = query.eq('category', category)
  }
  
  const { data, error } = await query
  if (error) throw new Error(getSafeErrorMessage(error))
  return data
}

// 更新衣物
export const updateClothingItem = async (id: string, updates: Partial<ClothingItem>, userId: string) => {
  if (!id || !userId) {
    throw new Error('缺少必要參數')
  }

  // 先檢查用戶是否擁有此衣物
  const { data: existingItem } = await supabase
    .from('clothing_items')
    .select('user_id')
    .eq('id', id)
    .single()

  if (!existingItem || !checkUserOwnership(userId, existingItem.user_id)) {
    throw new Error('權限不足')
  }

  // 輸入驗證
  if (updates.name && !validateInputLength(updates.name, INPUT_LIMITS.NAME_MAX_LENGTH)) {
    throw new Error(`衣物名稱不能超過 ${INPUT_LIMITS.NAME_MAX_LENGTH} 個字元`)
  }
  
  if (updates.color && !validateInputLength(updates.color, INPUT_LIMITS.COLOR_MAX_LENGTH)) {
    throw new Error(`顏色不能超過 ${INPUT_LIMITS.COLOR_MAX_LENGTH} 個字元`)
  }
  
  if (updates.description && !validateInputLength(updates.description, INPUT_LIMITS.DESCRIPTION_MAX_LENGTH)) {
    throw new Error(`描述不能超過 ${INPUT_LIMITS.DESCRIPTION_MAX_LENGTH} 個字元`)
  }
  
  if (updates.tags) {
    const tagValidation = validateTags(updates.tags)
    if (!tagValidation.valid) {
      throw new Error(tagValidation.error)
    }
  }

  // 清理輸入內容
  const sanitizedUpdates = {
    ...updates,
    name: updates.name ? sanitizeHtml(updates.name) : undefined,
    color: updates.color ? sanitizeHtml(updates.color) : undefined,
    description: updates.description ? sanitizeHtml(updates.description) : undefined,
    tags: updates.tags ? updates.tags.map(tag => sanitizeHtml(tag)) : undefined
  }

  const { data, error } = await supabase
    .from('clothing_items')
    .update(sanitizedUpdates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw new Error(getSafeErrorMessage(error))
  return data
}

// 刪除衣物
export const deleteClothingItem = async (id: string, userId: string) => {
  if (!id || !userId) {
    throw new Error('缺少必要參數')
  }

  // 先檢查用戶是否擁有此衣物
  const { data: existingItem } = await supabase
    .from('clothing_items')
    .select('user_id, image_url')
    .eq('id', id)
    .single()

  if (!existingItem || !checkUserOwnership(userId, existingItem.user_id)) {
    throw new Error('權限不足')
  }

  // 刪除相關圖片
  if (existingItem.image_url) {
    try {
      const path = existingItem.image_url.split('/').pop()
      if (path) {
        await deleteImage(path)
      }
    } catch (error) {
      console.error('刪除圖片失敗:', error)
    }
  }

  const { error } = await supabase
    .from('clothing_items')
    .delete()
    .eq('id', id)
  
  if (error) throw new Error(getSafeErrorMessage(error))
}

// 新增搭配
export const addOutfit = async (outfit: Omit<Outfit, 'id' | 'created_at' | 'updated_at'>) => {
  // 輸入驗證
  if (!validateInputLength(outfit.name, INPUT_LIMITS.NAME_MAX_LENGTH)) {
    throw new Error(`搭配名稱不能超過 ${INPUT_LIMITS.NAME_MAX_LENGTH} 個字元`)
  }
  
  if (outfit.description && !validateInputLength(outfit.description, INPUT_LIMITS.DESCRIPTION_MAX_LENGTH)) {
    throw new Error(`描述不能超過 ${INPUT_LIMITS.DESCRIPTION_MAX_LENGTH} 個字元`)
  }
  
  if (outfit.tags) {
    const tagValidation = validateTags(outfit.tags)
    if (!tagValidation.valid) {
      throw new Error(tagValidation.error)
    }
  }

  // 清理輸入內容
  const sanitizedOutfit = {
    ...outfit,
    name: sanitizeHtml(outfit.name),
    description: outfit.description ? sanitizeHtml(outfit.description) : undefined,
    tags: outfit.tags ? outfit.tags.map(tag => sanitizeHtml(tag)) : undefined
  }

  const { data, error } = await supabase
    .from('outfits')
    .insert([sanitizedOutfit])
    .select()
    .single()
  
  if (error) throw new Error(getSafeErrorMessage(error))
  return data
}

// 取得用戶的所有搭配
export const getOutfits = async (userId: string) => {
  if (!userId) {
    throw new Error('用戶 ID 不能為空')
  }

  const { data, error } = await supabase
    .from('outfits')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  
  if (error) throw new Error(getSafeErrorMessage(error))
  return data
}

// 更新搭配
export const updateOutfit = async (id: string, updates: Partial<Outfit>, userId: string) => {
  if (!id || !userId) {
    throw new Error('缺少必要參數')
  }

  // 先檢查用戶是否擁有此搭配
  const { data: existingOutfit } = await supabase
    .from('outfits')
    .select('user_id')
    .eq('id', id)
    .single()

  if (!existingOutfit || !checkUserOwnership(userId, existingOutfit.user_id)) {
    throw new Error('權限不足')
  }

  // 輸入驗證
  if (updates.name && !validateInputLength(updates.name, INPUT_LIMITS.NAME_MAX_LENGTH)) {
    throw new Error(`搭配名稱不能超過 ${INPUT_LIMITS.NAME_MAX_LENGTH} 個字元`)
  }
  
  if (updates.description && !validateInputLength(updates.description, INPUT_LIMITS.DESCRIPTION_MAX_LENGTH)) {
    throw new Error(`描述不能超過 ${INPUT_LIMITS.DESCRIPTION_MAX_LENGTH} 個字元`)
  }
  
  if (updates.tags) {
    const tagValidation = validateTags(updates.tags)
    if (!tagValidation.valid) {
      throw new Error(tagValidation.error)
    }
  }

  // 清理輸入內容
  const sanitizedUpdates = {
    ...updates,
    name: updates.name ? sanitizeHtml(updates.name) : undefined,
    description: updates.description ? sanitizeHtml(updates.description) : undefined,
    tags: updates.tags ? updates.tags.map(tag => sanitizeHtml(tag)) : undefined
  }

  const { data, error } = await supabase
    .from('outfits')
    .update(sanitizedUpdates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw new Error(getSafeErrorMessage(error))
  return data
}

// 刪除搭配
export const deleteOutfit = async (id: string, userId: string) => {
  if (!id || !userId) {
    throw new Error('缺少必要參數')
  }

  // 先檢查用戶是否擁有此搭配
  const { data: existingOutfit } = await supabase
    .from('outfits')
    .select('user_id')
    .eq('id', id)
    .single()

  if (!existingOutfit || !checkUserOwnership(userId, existingOutfit.user_id)) {
    throw new Error('權限不足')
  }

  const { error } = await supabase
    .from('outfits')
    .delete()
    .eq('id', id)
  
  if (error) throw new Error(getSafeErrorMessage(error))
}

// 新增旅行搭配
export const addTravelOutfit = async (outfit: Omit<TravelOutfit, 'id' | 'created_at' | 'updated_at'>) => {
  // 輸入驗證
  if (!validateInputLength(outfit.destination_name, INPUT_LIMITS.NAME_MAX_LENGTH)) {
    throw new Error(`目的地名稱不能超過 ${INPUT_LIMITS.NAME_MAX_LENGTH} 個字元`)
  }
  
  if (!validateInputLength(outfit.destination_address, INPUT_LIMITS.DESCRIPTION_MAX_LENGTH)) {
    throw new Error(`目的地地址不能超過 ${INPUT_LIMITS.DESCRIPTION_MAX_LENGTH} 個字元`)
  }
  
  if (outfit.weather_info && !validateInputLength(outfit.weather_info, INPUT_LIMITS.DESCRIPTION_MAX_LENGTH)) {
    throw new Error(`天氣資訊不能超過 ${INPUT_LIMITS.DESCRIPTION_MAX_LENGTH} 個字元`)
  }
  
  if (outfit.notes && !validateInputLength(outfit.notes, INPUT_LIMITS.DESCRIPTION_MAX_LENGTH)) {
    throw new Error(`備註不能超過 ${INPUT_LIMITS.DESCRIPTION_MAX_LENGTH} 個字元`)
  }

  // 清理輸入內容
  const sanitizedOutfit = {
    ...outfit,
    destination_name: sanitizeHtml(outfit.destination_name),
    destination_address: sanitizeHtml(outfit.destination_address),
    weather_info: outfit.weather_info ? sanitizeHtml(outfit.weather_info) : undefined,
    notes: outfit.notes ? sanitizeHtml(outfit.notes) : undefined
  }

  const { data, error } = await supabase
    .from('travel_outfits')
    .insert([sanitizedOutfit])
    .select()
    .single()
  
  if (error) throw new Error(getSafeErrorMessage(error))
  return data
}

// 取得用戶的所有旅行搭配
export const getTravelOutfits = async (userId: string) => {
  if (!userId) {
    throw new Error('用戶 ID 不能為空')
  }

  const { data, error } = await supabase
    .from('travel_outfits')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  
  if (error) throw new Error(getSafeErrorMessage(error))
  return data
}

// 更新旅行搭配
export const updateTravelOutfit = async (id: string, updates: Partial<TravelOutfit>, userId: string) => {
  if (!id || !userId) {
    throw new Error('缺少必要參數')
  }

  // 先檢查用戶是否擁有此旅行搭配
  const { data: existingOutfit } = await supabase
    .from('travel_outfits')
    .select('user_id')
    .eq('id', id)
    .single()

  if (!existingOutfit || !checkUserOwnership(userId, existingOutfit.user_id)) {
    throw new Error('權限不足')
  }

  // 輸入驗證
  if (updates.destination_name && !validateInputLength(updates.destination_name, INPUT_LIMITS.NAME_MAX_LENGTH)) {
    throw new Error(`目的地名稱不能超過 ${INPUT_LIMITS.NAME_MAX_LENGTH} 個字元`)
  }
  
  if (updates.destination_address && !validateInputLength(updates.destination_address, INPUT_LIMITS.DESCRIPTION_MAX_LENGTH)) {
    throw new Error(`目的地地址不能超過 ${INPUT_LIMITS.DESCRIPTION_MAX_LENGTH} 個字元`)
  }
  
  if (updates.weather_info && !validateInputLength(updates.weather_info, INPUT_LIMITS.DESCRIPTION_MAX_LENGTH)) {
    throw new Error(`天氣資訊不能超過 ${INPUT_LIMITS.DESCRIPTION_MAX_LENGTH} 個字元`)
  }
  
  if (updates.notes && !validateInputLength(updates.notes, INPUT_LIMITS.DESCRIPTION_MAX_LENGTH)) {
    throw new Error(`備註不能超過 ${INPUT_LIMITS.DESCRIPTION_MAX_LENGTH} 個字元`)
  }

  // 清理輸入內容
  const sanitizedUpdates = {
    ...updates,
    destination_name: updates.destination_name ? sanitizeHtml(updates.destination_name) : undefined,
    destination_address: updates.destination_address ? sanitizeHtml(updates.destination_address) : undefined,
    weather_info: updates.weather_info ? sanitizeHtml(updates.weather_info) : undefined,
    notes: updates.notes ? sanitizeHtml(updates.notes) : undefined
  }

  const { data, error } = await supabase
    .from('travel_outfits')
    .update(sanitizedUpdates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw new Error(getSafeErrorMessage(error))
  return data
}

// 刪除旅行搭配
export const deleteTravelOutfit = async (id: string, userId: string) => {
  if (!id || !userId) {
    throw new Error('缺少必要參數')
  }

  // 先檢查用戶是否擁有此旅行搭配
  const { data: existingOutfit } = await supabase
    .from('travel_outfits')
    .select('user_id, generated_outfit_image')
    .eq('id', id)
    .single()

  if (!existingOutfit || !checkUserOwnership(userId, existingOutfit.user_id)) {
    throw new Error('權限不足')
  }

  // 刪除相關圖片
  if (existingOutfit.generated_outfit_image) {
    try {
      const path = existingOutfit.generated_outfit_image.split('/').pop()
      if (path) {
        await deleteImage(path)
      }
    } catch (error) {
      console.error('刪除圖片失敗:', error)
    }
  }

  const { error } = await supabase
    .from('travel_outfits')
    .delete()
    .eq('id', id)
  
  if (error) throw new Error(getSafeErrorMessage(error))
}

// 上傳圖片到 Supabase Storage
export const uploadImage = async (file: File, userId: string) => {
  // 檔案驗證
  const validation = validateImageFile(file)
  if (!validation.valid) {
    throw new Error(validation.error)
  }

  // 生成安全的檔案名稱
  const safeFileName = generateSafeFileName(file.name, userId)

  const { data, error } = await supabase.storage
    .from('closet-images')
    .upload(safeFileName, file, {
      cacheControl: '3600',
      upsert: false
    })
  
  if (error) throw new Error(getSafeErrorMessage(error))
  
  // 取得公開 URL
  const { data: { publicUrl } } = supabase.storage
    .from('closet-images')
    .getPublicUrl(data.path)
  
  return publicUrl
}

// 刪除圖片
export const deleteImage = async (path: string) => {
  if (!path) {
    throw new Error('圖片路徑不能為空')
  }

  const { error } = await supabase.storage
    .from('closet-images')
    .remove([path])
  
  if (error) throw new Error(getSafeErrorMessage(error))
} 