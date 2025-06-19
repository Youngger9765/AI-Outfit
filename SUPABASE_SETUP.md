# Supabase 設置指南

## 1. 建立 Supabase 專案

1. 前往 [Supabase](https://supabase.com) 並註冊帳號
2. 建立新專案
3. 記下專案的 URL 和 anon key

## 2. 設置資料庫

1. 在 Supabase Dashboard 中，前往 SQL Editor
2. 複製 `supabase-schema.sql` 的內容並執行
3. 這會建立所有必要的資料表和 RLS 政策

## 3. 設置 Storage

1. 在 Supabase Dashboard 中，前往 Storage
2. 建立新的 bucket 名為 `closet-images`
3. 設置 bucket 為公開（public）
4. 建立以下 RLS 政策：

```sql
-- 允許用戶上傳自己的圖片
CREATE POLICY "Users can upload own images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'closet-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 允許用戶查看所有圖片
CREATE POLICY "Users can view all images" ON storage.objects
  FOR SELECT USING (bucket_id = 'closet-images');

-- 允許用戶刪除自己的圖片
CREATE POLICY "Users can delete own images" ON storage.objects
  FOR DELETE USING (bucket_id = 'closet-images' AND auth.uid()::text = (storage.foldername(name))[1]);
```

## 4. 設置環境變數

1. 複製 `env.example` 為 `.env.local`
2. 填入您的 Supabase 專案資訊：

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

## 5. 測試設置

1. 啟動開發伺服器：`npm run dev`
2. 前往 `/auth` 頁面測試註冊/登入功能
3. 前往 `/closet` 頁面測試數位衣櫥功能

## 資料庫結構

### 用戶資料表 (users)
- `id`: 用戶 ID（關聯 auth.users）
- `email`: 電子郵件
- `name`: 姓名
- `avatar_url`: 頭像 URL
- `created_at`: 建立時間
- `updated_at`: 更新時間

### 衣物資料表 (clothing_items)
- `id`: 衣物 ID
- `user_id`: 用戶 ID
- `name`: 衣物名稱
- `category`: 分類（top, bottom, dress, outerwear, shoes, accessories）
- `color`: 顏色
- `season`: 季節（spring, summer, autumn, winter, all）
- `image_url`: 圖片 URL
- `description`: 描述
- `tags`: 標籤陣列
- `created_at`: 建立時間
- `updated_at`: 更新時間

### 搭配資料表 (outfits)
- `id`: 搭配 ID
- `user_id`: 用戶 ID
- `name`: 搭配名稱
- `description`: 描述
- `clothing_items`: 衣物 ID 陣列
- `is_favorite`: 是否收藏
- `tags`: 標籤陣列
- `created_at`: 建立時間
- `updated_at`: 更新時間

### 旅行搭配資料表 (travel_outfits)
- `id`: 旅行搭配 ID
- `user_id`: 用戶 ID
- `destination_name`: 目的地名稱
- `destination_address`: 目的地地址
- `destination_image`: 目的地圖片
- `generated_outfit_image`: 生成的搭配圖片
- `weather_info`: 天氣資訊
- `notes`: 備註
- `is_favorite`: 是否收藏
- `created_at`: 建立時間
- `updated_at`: 更新時間

## 安全性

- 所有資料表都啟用了 Row Level Security (RLS)
- 用戶只能存取自己的資料
- 圖片上傳有適當的權限控制
- 自動觸發器處理用戶註冊和時間戳記更新 