# 🔒 資安文件

## 概述

本文件說明 AI-Outfit 專案的資安措施和最佳實踐。

## 資安措施

### 1. 輸入驗證與清理

#### 檔案上傳安全
- **檔案類型驗證**: 只允許 `image/jpeg`, `image/jpg`, `image/png`, `image/webp`, `image/gif`
- **檔案大小限制**: 最大 10MB
- **檔案名稱安全**: 自動生成安全的檔案名稱，避免路徑遍歷攻擊
- **檔案內容驗證**: 檢查檔案 MIME 類型

#### 文字輸入安全
- **XSS 防護**: 所有用戶輸入都經過 HTML 實體編碼
- **輸入長度限制**: 
  - 衣物名稱: 100 字元
  - 描述: 500 字元
  - 顏色: 50 字元
  - 標籤: 50 字元，最多 20 個
- **特殊字元過濾**: 標籤中禁止危險字元

### 2. 權限控制

#### Row Level Security (RLS)
- 所有資料表都啟用 RLS
- 用戶只能存取自己的資料
- 自動檢查資源擁有權

#### 用戶身份驗證
- 所有 API 呼叫都驗證用戶身份
- 刪除操作前確認用戶權限
- 防止未授權存取

### 3. 資料庫安全

#### Supabase 安全設定
- 使用環境變數管理敏感資訊
- 匿名金鑰僅用於公開操作
- 服務端金鑰僅在服務端使用

#### SQL 注入防護
- 使用 Supabase 參數化查詢
- 避免直接字串拼接 SQL
- 輸入驗證和清理

### 4. 前端安全

#### Content Security Policy (CSP)
```javascript
default-src 'self';
script-src 'self' 'unsafe-eval' 'unsafe-inline' https://maps.googleapis.com;
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
font-src 'self' https://fonts.gstatic.com;
img-src 'self' data: https: blob:;
connect-src 'self' https://*.supabase.co https://maps.googleapis.com https://api.pexels.com;
frame-src 'self' https://accounts.google.com;
```

#### HTTP 安全標頭
- `X-Frame-Options: DENY` - 防止點擊劫持
- `X-Content-Type-Options: nosniff` - 防止 MIME 類型嗅探
- `X-XSS-Protection: 1; mode=block` - XSS 防護
- `Strict-Transport-Security` - 強制 HTTPS
- `Referrer-Policy: strict-origin-when-cross-origin` - 控制 referrer 資訊

### 5. 錯誤處理

#### 安全錯誤訊息
- 不暴露內部錯誤詳情給用戶
- 統一的錯誤訊息格式
- 記錄錯誤但不顯示敏感資訊

#### 異常處理
- 所有 API 呼叫都有錯誤處理
- 防止應用程式崩潰
- 優雅的錯誤恢復

### 6. 環境變數管理

#### 敏感資訊保護
```bash
# 必須設定
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# API 金鑰
GOOGLE_PLACES_API_KEY=your_google_places_key
PEXELS_API_KEY=your_pexels_key
```

### 7. 圖片安全

#### 圖片處理
- 安全的檔案名稱生成
- 圖片格式驗證
- 自動清理相關資源

#### 圖片儲存
- 使用 Supabase Storage
- 安全的存取控制
- 自動清理孤立檔案

## 資安檢查清單

### 部署前檢查
- [ ] 所有環境變數已設定
- [ ] Supabase RLS 政策已啟用
- [ ] CSP 標頭已配置
- [ ] 檔案上傳限制已設定
- [ ] 輸入驗證已實作
- [ ] 錯誤處理已完善

### 定期檢查
- [ ] 依賴套件安全性更新
- [ ] API 金鑰輪換
- [ ] 存取日誌檢查
- [ ] 資安漏洞掃描
- [ ] 備份資料完整性

## 資安最佳實踐

### 開發階段
1. **最小權限原則**: 只給予必要的權限
2. **防禦性程式設計**: 假設所有輸入都是惡意的
3. **安全預設值**: 預設拒絕，明確允許
4. **深度防禦**: 多層安全措施

### 部署階段
1. **HTTPS 強制**: 所有通訊都使用 HTTPS
2. **定期更新**: 保持依賴套件最新
3. **監控日誌**: 監控異常活動
4. **備份策略**: 定期備份重要資料

### 維護階段
1. **安全審計**: 定期進行安全審計
2. **滲透測試**: 定期進行滲透測試
3. **事件回應**: 建立資安事件回應流程
4. **用戶教育**: 教育用戶資安最佳實踐

## 報告資安問題

如果您發現資安問題，請：

1. **不要公開披露**: 避免在公開場合討論
2. **立即報告**: 透過安全管道報告
3. **提供詳細資訊**: 包含重現步驟和影響範圍
4. **配合修復**: 協助驗證修復方案

## 聯絡資訊

- 專案維護者: [您的聯絡資訊]
- 資安問題回報: [安全郵件地址]
- 緊急聯絡: [緊急聯絡方式]

---

**注意**: 此文件應定期更新以反映最新的資安措施和最佳實踐。 