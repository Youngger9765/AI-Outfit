// 資安相關的 utility 函式

// 檔案類型驗證
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  // 檢查檔案類型
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: '不支援的檔案類型。請上傳 JPG、PNG、WebP 或 GIF 格式的圖片。'
    }
  }

  // 檢查檔案大小
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: '檔案大小超過限制。請上傳小於 10MB 的圖片。'
    }
  }

  return { valid: true }
}

// 安全的檔案名稱生成
export const generateSafeFileName = (originalName: string, userId: string): string => {
  const timestamp = Date.now()
  const randomString = Math.random().toString(36).substring(2, 15)
  const extension = originalName.split('.').pop()?.toLowerCase() || 'jpg'
  
  // 只允許安全的字元
  const safeExtension = extension.replace(/[^a-zA-Z0-9]/g, '')
  
  return `${userId}/${timestamp}-${randomString}.${safeExtension}`
}

// XSS 防護 - 清理 HTML 內容
export const sanitizeHtml = (input: string): string => {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}

// 輸入長度限制
export const validateInputLength = (input: string, maxLength: number): boolean => {
  return input.length <= maxLength
}

// 標籤驗證
export const validateTags = (tags: string[]): { valid: boolean; error?: string } => {
  if (tags.length > 20) {
    return {
      valid: false,
      error: '標籤數量不能超過 20 個'
    }
  }

  for (const tag of tags) {
    if (tag.length > 50) {
      return {
        valid: false,
        error: '每個標籤不能超過 50 個字元'
      }
    }
    
    // 檢查標籤是否包含危險字元
    if (/[<>\"'&]/.test(tag)) {
      return {
        valid: false,
        error: '標籤包含不安全的字元'
      }
    }
  }

  return { valid: true }
}

// 用戶權限檢查
export const checkUserOwnership = (userId: string, resourceUserId: string): boolean => {
  return userId === resourceUserId
}

// 安全的錯誤訊息
export const getSafeErrorMessage = (error: any): string => {
  // 不要暴露內部錯誤訊息給用戶
  if (error?.message?.includes('duplicate key')) {
    return '資料已存在，請檢查輸入內容'
  }
  
  if (error?.message?.includes('foreign key')) {
    return '相關資料不存在'
  }
  
  if (error?.message?.includes('permission denied')) {
    return '權限不足'
  }
  
  return '操作失敗，請稍後再試'
}

// 輸入驗證常數
export const INPUT_LIMITS = {
  NAME_MAX_LENGTH: 100,
  DESCRIPTION_MAX_LENGTH: 500,
  COLOR_MAX_LENGTH: 50,
  TAG_MAX_LENGTH: 50,
  MAX_TAGS_COUNT: 20
} as const 