# 旅行穿搭助手 - 產品需求文件 (PRD)

## 1. 產品概述

### 1.1 產品願景
打造一款智能穿搭應用程式，模擬穿搭教練，提供讚美與回饋，幫助用戶快速規劃旅行與日常穿搭，優化行李整理。通過4步驟簡單流程，為用戶生成專屬的旅行穿搭照片。

### 1.2 產品定位
- **核心功能**：AI驅動的旅行穿搭生成器
- **目標用戶**：18-35歲熱衷旅行與時尚的年輕族群
- **使用場景**：出門前一晚的穿搭規劃、旅行前的穿搭準備

### 1.3 核心價值主張
- 節省用戶穿搭決策時間
- 提供個人化與情感化的穿搭體驗
- 結合旅行目的地特色的智能推薦
- 簡單4步驟完成專業級穿搭建議

## 2. 用戶研究

### 2.1 目標用戶畫像
**主要用戶群體：**
- 年齡：18-35歲
- 性別：不限（女性為主要族群）
- 收入：中等收入以上
- 行為特徵：
  - 活躍於社群媒體
  - 注重個人風格與形象
  - 經常旅行或嚮往旅行
  - 對穿搭有一定興趣但缺乏專業知識

### 2.2 用戶痛點
1. **決策疲勞**：面對衣櫃不知道如何搭配
2. **時間壓力**：旅行前匆忙準備，沒時間仔細規劃穿搭
3. **缺乏專業知識**：不了解不同目的地的穿搭風格
4. **重複搭配**：總是穿同樣的組合，缺乏新意
5. **行李困擾**：不知道該帶哪些衣物，行李過重或不夠

### 2.3 使用場景
- **旅行前夜**：規劃整趟旅行的穿搭
- **日常出門前**：快速獲得穿搭建議
- **購物前**：了解目的地適合的服裝風格
- **社群分享**：生成美觀的穿搭照片用於分享

## 3. 功能需求

### 3.1 核心功能流程

#### 步驟1：衣物上傳
**功能描述：**
- 用戶拍照或從相簿選擇衣物照片
- 支援多張照片同時上傳
- 實時預覽已上傳的衣物

**技術需求：**
- 支援 JPG, PNG 格式
- 圖片壓縮處理
- 本地儲存預覽功能
- 拖拽式上傳界面

**驗收標準：**
- 可同時選擇多張照片
- 上傳成功後立即顯示預覽
- 支援刪除已上傳的照片
- 顯示已上傳衣物數量

#### 步驟2：自拍照上傳
**功能描述：**
- 上傳一張自拍照供AI分析身形和風格
- 支援全身照或半身照
- 即時預覽功能

**技術需求：**
- 單張照片上傳
- 圖片格式驗證
- 圖片尺寸優化

**驗收標準：**
- 成功上傳後顯示預覽圖
- 支援重新上傳替換照片
- 有上傳成功的視覺確認

#### 步驟3：目的地選擇
**功能描述：**
- 智能搜尋目的地功能
- 支援中英文和注音輸入法
- 豐富的目的地資料庫
- 每個目的地包含風格、天氣、標籤資訊

**技術需求：**
- 搜尋演算法支援模糊匹配
- 支援 onComposition 事件處理注音輸入
- 別名系統支援多種搜尋方式
- 即時搜尋結果顯示

**目的地資料庫：**
包含16個主要目的地：
- 熱門城市：巴黎、首爾、東京、倫敦、紐約、峇里島
- 擴展城市：米蘭、洛杉磯、上海、雪梨、曼谷、柏林、新加坡、杜拜、冰島、里約

每個目的地包含：
- 基本資訊：名稱、國家、天氣
- 風格標籤：風格特色、適合場合
- 搜尋別名：中英文別名、俗稱
- 視覺元素：emoji圖標、漸變色彩

**驗收標準：**
- 搜尋功能支援中英文輸入
- 注音輸入法正常工作，不會提前送出
- 搜尋結果準確匹配
- 選中目的地有明確視覺回饋
- 顯示搜尋結果數量

#### 步驟4：AI生成穿搭照片
**功能描述：**
- AI分析用戶衣物、身形和目的地特色
- 生成個人化穿搭照片
- 提供AI教練評語和建議
- 詳細的穿搭分析報告

**技術需求：**
- 圖像生成演算法
- 根據目的地動態調整色彩風格
- 進度顯示和loading動畫
- 錯誤處理和重試機制

**生成內容：**
- 穿搭圖片：SVG格式，根據目的地風格生成
- AI教練評語：個人化讚美和建議
- 穿搭分析：包含風格、天氣、使用衣物統計
- 操作選項：下載、分享、生成影片版本

**驗收標準：**
- 生成過程有清晰的進度指示
- 2秒內完成生成（模擬版本）
- 生成結果包含所有必要元素
- 支援重新生成功能
- 提供下載和分享選項

### 3.2 搜尋功能詳細規格

#### 3.2.1 搜尋輸入支援
- **中文搜尋**：城市名稱、國家、風格描述
- **英文搜尋**：英文城市名、國家代碼
- **注音輸入法**：完整支援台灣注音輸入
- **別名搜尋**：俗稱、暱稱（如：花都→巴黎、魔都→上海）

#### 3.2.2 搜尋演算法
- 部分匹配：支援模糊搜尋
- 標籤匹配：搜尋風格標籤
- 別名匹配：搜尋預設別名
- 權重排序：根據匹配度排序結果

#### 3.2.3 搜尋體驗
- 即時搜尋：非注音輸入時即時顯示結果
- 手動搜尋：支援按鈕提交和Enter鍵
- 快速標籤：預設標籤按鈕快速搜尋
- 搜尋建議：無結果時提供搜尋建議

### 3.3 AI生成功能規格

#### 3.3.1 圖像生成
- **格式**：SVG向量圖形
- **尺寸**：300x450像素
- **風格**：根據目的地動態調整色彩主題
- **元素**：人物輪廓、服裝、配件、背景

#### 3.3.2 色彩系統
每個目的地對應獨特的色彩主題：
- 巴黎：粉紫色系（典雅優雅）
- 首爾：藍粉色系（韓系時尚）
- 東京：溫暖色系（日系簡約）
- 倫敦：清新色系（英倫復古）
- 紐約：活力色系（都市摩登）
- 峇里島：熱帶色系（度假休閒）

#### 3.3.3 AI教練系統
- **評語庫**：預設5-10條個人化評語
- **變數替換**：根據目的地和風格動態生成
- **情感要素**：包含emoji和讚美詞彙
- **個人化**：結合用戶上傳的衣物數量

## 4. 技術規格

### 4.1 前端技術棧
- **框架**：React 18+
- **樣式**：Tailwind CSS
- **圖標**：Lucide React
- **狀態管理**：React Hooks (useState)
- **圖片處理**：FileReader API
- **響應式設計**：支援手機、平板、桌面

### 4.1.1 後端 Google Gemini 串接方式（2024/6更新）
- **AI 生成（Gemini）**：支援直接以 Google Gemini API 金鑰（`GOOGLE_GENAI_API_KEY`）串接，不再強制需要 service account json。
- **Storage（GCS）**：仍可用 service account json 物件初始化。
- **環境變數**：
  - `GOOGLE_GENAI_API_KEY`：用於 Gemini 影像生成
  - `GOOGLE_SERVICE_ACCOUNT_JSON`：用於 GCS 上傳

### 4.2 核心技術功能

#### 4.2.1 圖片處理
```javascript
// 圖片上傳和預覽
const handleImageUpload = (files) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    // 處理圖片預覽
  };
  reader.readAsDataURL(file);
};
```

#### 4.2.2 搜尋演算法
```javascript
// 多層次搜尋匹配
const searchAlgorithm = (query) => {
  return destinations.filter(dest => 
    dest.name.includes(query) ||
    dest.country.includes(query) ||
    dest.style.includes(query) ||
    dest.tags.some(tag => tag.includes(query)) ||
    dest.aliases.some(alias => alias.includes(query))
  );
};
```

#### 4.2.3 注音輸入支援
```javascript
// 注音輸入法處理
const handleComposition = {
  onCompositionStart: () => setIsComposing(true),
  onCompositionEnd: () => {
    setIsComposing(false);
    // 延遲執行搜尋
    setTimeout(() => performSearch(), 0);
  }
};
```

#### 4.2.4 SVG圖像生成
```javascript
// 動態SVG生成
const generateOutfitSVG = (destination) => {
  const colors = colorSchemes[destination.id];
  return `data:image/svg+xml;base64,${btoa(svgContent)}`;
};
```

### 4.3 性能要求
- **載入時間**：首次載入 < 3秒
- **圖片生成**：< 2秒完成生成
- **搜尋響應**：< 500ms 顯示結果
- **圖片上傳**：支援單張最大5MB

### 4.4 瀏覽器支援
- **現代瀏覽器**：Chrome 90+, Firefox 88+, Safari 14+
- **移動瀏覽器**：iOS Safari 14+, Chrome Mobile 90+
- **關鍵功能**：FileReader API, SVG支援, Flexbox/Grid

## 5. 用戶體驗設計

### 5.1 設計原則
- **簡潔直觀**：4步驟清晰流程
- **視覺回饋**：每個操作都有明確回饋
- **現代美感**：漸變色彩和圓角設計
- **響應式**：適配各種螢幕尺寸

### 5.2 色彩系統
- **主色調**：紫色漸變 (from-pink-500 to-purple-600)
- **輔助色**：灰色系用於文字和邊框
- **狀態色**：綠色(成功)、黃色(警告)、紅色(錯誤)
- **背景色**：淺色漸變 (from-purple-50 via-pink-50 to-blue-50)

### 5.3 交互設計
- **進度指示**：4步驟進度條
- **按鈕狀態**：懸停、點擊效果
- **載入動畫**：旋轉loading和進度條
- **卡片設計**：陰影和懸停效果

### 5.4 響應式佈局
- **手機**：單欄佈局，大按鈕設計
- **平板**：2欄網格佈局
- **桌面**：3欄網格佈局，最大寬度限制

## 6. 數據結構

### 6.1 目的地數據模型
```javascript
const destination = {
  id: Number,           // 唯一識別碼
  name: String,         // 城市名稱
  country: String,      // 國家
  style: String,        // 風格描述
  weather: String,      // 天氣資訊
  image: String,        // emoji圖標
  color: String,        // Tailwind漸變類
  tags: Array<String>,  // 標籤陣列
  aliases: Array<String> // 別名陣列
};
```

### 6.2 用戶上傳數據
```javascript
const userUpload = {
  clothes: [{
    id: Number,
    file: File,
    preview: String,
    name: String
  }],
  selfie: {
    file: File,
    preview: String
  },
  destination: destination
};
```

### 6.3 生成結果數據
```javascript
const generatedContent = {
  type: 'image',
  url: String,              // 生成圖片的 data URL
  description: String,      // 穿搭描述
  coachMessage: String,     // AI教練評語
  outfitDetails: {
    climate: String,        // 天氣適應性
    style: String,          // 風格標籤
    clothesUsed: Number,    // 使用衣物數量
    recommendation: String  // 推薦說明
  }
};
```

## 7. 測試規格

### 7.1 功能測試
- **圖片上傳**：測試各種格式和大小
- **搜尋功能**：測試中英文和注音輸入
- **目的地選擇**：測試所有16個目的地
- **圖片生成**：驗證生成結果的完整性

### 7.2 兼容性測試
- **輸入法測試**：台灣注音、簡體拼音、英文
- **瀏覽器測試**：主流桌面和手機瀏覽器
- **設備測試**：不同螢幕尺寸和解析度

### 7.3 性能測試
- **載入速度**：首次載入和後續操作
- **圖片處理**：大檔案上傳和處理速度
- **記憶體使用**：長時間使用的記憶體占用

### 7.4 用戶體驗測試
- **流程完整性**：4步驟完整流程測試
- **錯誤處理**：異常情況的用戶體驗
- **視覺一致性**：不同狀態的視覺回饋

## 8. 發布計劃

### 8.1 開發階段
**第1個月：測試網站**
- 完成4步驟核心流程
- 基本搜尋功能
- 簡單圖片生成
- 用戶測試和反饋收集

**第2-3個月：功能完善**
- 優化搜尋演算法
- 擴展目的地資料庫
- 改善圖片生成品質
- 增加AI教練評語

**第4-6個月：體驗優化**
- 完善響應式設計
- 優化載入速度
- 增加互動動效
- 大規模用戶測試

### 8.2 測試計劃
- **Alpha測試**：內部團隊測試
- **Beta測試**：邀請100-200名目標用戶
- **公開測試**：開放公測收集反饋

### 8.3 上線準備
- 性能優化和錯誤修復
- 用戶反饋整合
- 最終用戶體驗調整
- 正式版發布

## 9. 成功指標

### 9.1 用戶參與度
- **完成率**：完成4步驟流程的用戶比例 > 70%
- **重複使用**：7天內重複使用比例 > 30%
- **分享率**：生成結果分享比例 > 15%

### 9.2 技術指標
- **載入速度**：首次載入時間 < 3秒
- **生成速度**：圖片生成時間 < 2秒
- **錯誤率**：功能異常率 < 5%

### 9.3 用戶滿意度
- **Net Promoter Score (NPS)**：> 50
- **用戶評分**：應用商店評分 > 4.0
- **完成率**：從步驟1到步驟4的轉換率 > 60%

## 10. 風險評估與緩解

### 10.1 技術風險
**風險**：圖片生成品質不穩定
**緩解**：
- 建立品質檢測機制
- 提供重新生成選項
- 預設多套生成模板

**風險**：搜尋功能不準確
**緩解**：
- 持續優化搜尋演算法
- 擴展別名資料庫
- 提供搜尋建議功能

### 10.2 用戶體驗風險
**風險**：流程過於複雜
**緩解**：
- 簡化每個步驟的操作
- 提供清晰的進度指示
- 增加操作引導

**風險**：圖片上傳失敗率高
**緩解**：
- 優化圖片壓縮演算法
- 提供多種上傳方式
- 增加錯誤提示和重試機制

### 10.3 市場風險
**風險**：用戶採用率低
**緩解**：
- 強化核心價值主張
- 改善首次使用體驗
- 增加社群分享功能

## 11. 未來發展方向

### 11.1 功能擴展
- **真實AI整合**：接入實際的圖像生成AI
- **AR試穿功能**：虛擬試穿體驗
- **社群功能**：用戶穿搭分享平台
- **個人化推薦**：基於歷史行為的智能推薦

### 11.2 商業化發展
- **訂閱制服務**：高級功能付費使用
- **品牌合作**：與時尚品牌聯名推廣
- **電商整合**：直接購買推薦商品
- **廣告系統**：相關品牌廣告植入

### 11.3 市場擴展
- **多語言支援**：英文、日文、韓文版本
- **全球市場**：擴展更多國際目的地
- **移動應用**：iOS和Android原生應用
- **API開放**：提供開發者API服務

---

**文件版本**：v1.0  
**最後更新**：2025年6月  
**負責人**：產品團隊  
**審核狀態**：待審核

## 2024/06/09 更新紀錄

- 完成 Google Map 目的地搜尋與地點照片選擇功能，支援地圖互動與地點照片挑選。
- 修正 SSR/CSR 環境下 Google Maps API 載入問題，確保 Vercel 部署與本地開發皆可正常顯示地圖。
- 解決 Google Maps API 金鑰 Referer 授權問題，確保雲端預覽網址可正常使用。
- 優化地點照片排版，支援一行三張、寬度自動對齊。

## 專案目錄結構

```
AI-Outfit/
├── public/                  # 靜態資源（範例地點照片等）
├── src/
│   ├── app/                 # Next.js App Router 入口
│   │   └── TravelOutfitCore.tsx  # 主流程元件
│   ├── components/
│   │   └── travel-outfit/   # 旅行穿搭相關元件
│   │       ├── ClothesUpload.tsx         # 衣服上傳與預覽
│   │       ├── SelfieUpload.tsx          # 自拍照上傳
│   │       ├── PexelsSearch.tsx          # Pexels 圖片搜尋
│   │       ├── GoogleMapSearch.tsx       # Google 地圖與地點照片搜尋
│   │       ├── LocationPhotoSelector.tsx # 共用地點照片選擇區塊
│   │       ├── GeneratePrepare.tsx       # 生成前確認與 AI 服務選擇
│   │       └── GenerateResult.tsx        # 顯示 AI 生成結果
│   └── ...
├── pages/api/               # API 路由
│   └── search_location_photos/           # Pexels 圖片搜尋 API
├── next.config.js           # Next.js 設定
├── tailwind.config.js       # Tailwind 設定
├── tsconfig.json            # TypeScript 設定
└── README.md                # 產品說明文件
```

## 主要元件說明

- `ClothesUpload.tsx`：衣服上傳與預覽
- `SelfieUpload.tsx`：自拍照上傳
- `PexelsSearch.tsx`：Pexels 圖片搜尋
- `GoogleMapSearch.tsx`：Google 地圖與地點照片搜尋
- `LocationPhotoSelector.tsx`：共用地點照片選擇區塊
- `GeneratePrepare.tsx`：生成前確認與 AI 服務選擇
- `GenerateResult.tsx`：顯示 AI 生成結果
- `TravelOutfitCore.tsx`：主流程元件，整合所有步驟

## 本地開發與部署

1. 安裝依賴：
   ```bash
   npm install
   # 或 yarn
   ```
2. 啟動開發伺服器：
   ```bash
   npm run dev
   # 或 yarn dev
   ```
3. 設定環境變數（如需串接 Pexels、Google Maps、AI 服務等）：
   - `.env.local` 需包含：
     - `PEXELS_API_KEY`
     - `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
     - `GOOGLE_GENAI_API_KEY`（如需 Gemini 生成）

4. 部署到 Vercel 時，請於 Vercel 專案設定環境變數。

## API 文件

### 1. Pexels 圖片搜尋 API
- 路徑：`/api/search_location_photos`
- 方法：`POST`
- 請求參數：
  ```json
  {
    "query": "東京鐵塔"
  }
  ```
- 回應格式（Pexels 原生格式）：
  ```json
  {
    "photos": [
      {
        "id": 123,
        "src": {
          "original": "https://images.pexels.com/xxx.jpg",
          "medium": "https://images.pexels.com/xxx-medium.jpg"
        },
        "alt": "Tokyo Tower"
      },
      ...
    ]
  }
  ```
- 用途：供 PexelsSearch 元件搜尋地點代表照片。

### 2. Google Map 地點搜尋（前端直連 Google API）
- 路徑：Google 官方 API
- 用於 `GoogleMapSearch.tsx`，需設定 `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`。
- 支援地點搜尋、地點照片取得。

---

## 資料流簡介

1. **衣服/自拍上傳**
   使用者上傳圖片，前端用 FileReader 預覽，資料暫存於 state。
2. **目的地搜尋**
   - Pexels tab：呼叫 `/api/search_location_photos`，取得圖片列表。
   - Google tab：前端直連 Google Places API，取得地點資訊與照片。
3. **地點代表照片選擇**
   使用 `LocationPhotoSelector` 元件，選定後將圖片資訊存入 `selectedDestination`。
4. **AI 生成**
   前端組合所有資料，送到 `/api/edit-image` 或 `/api/edit-image-gemini`，取得生成結果。

---

## 如何開啟本地 Server

1. 安裝依賴：
   ```bash
   npm install
   # 或 yarn
   ```
2. 設定環境變數：
   - 在專案根目錄建立 `.env.local`，內容範例：
     ```
     PEXELS_API_KEY=你的Pexels金鑰
     NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=你的Google Maps金鑰
     GOOGLE_GENAI_API_KEY=你的Gemini金鑰（如需AI生成功能）
     ```
3. 啟動開發伺服器：
   ```bash
   npm run dev
   # 或 yarn dev
   ```
   - 預設會在 http://localhost:3000 開啟
4. （選用）啟動 production server：
   ```bash
   npm run build
   npm start
   ```

---

## 成本計算與 API 使用說明

### UX Flow 會用到的 API

| 步驟         | 主要 API                        | 用途說明                       |
|--------------|-------------------------------|-------------------------------|
| 衣服/自拍上傳 | 無（本地處理）                  | 前端 FileReader 預覽           |
| 目的地搜尋   | 1. `/api/search_location_photos`<br>2. Google Places API | 1. Pexels 圖片搜尋<br>2. Google 地點/照片搜尋 |
| AI 生成      | 1. `/api/edit-image`<br>2. `/api/edit-image-gemini` | 1. OpenAI 圖像生成<br>2. Google Gemini 圖像生成 |

#### 每次完整 UX 流程會呼叫的 API 數量
- Pexels tab：1 次 Pexels API + 1 次 AI 生成 API
- Google tab：1~2 次 Google Places API + 1 次 AI 生成 API

### API 成本估算

| 流程         | API 請求數 | 預估成本 (USD)         |
|--------------|-----------|------------------------|
| Pexels + OpenAI | 1 + 1     | $0 (Pexels 免費) + $0.04~0.08 |
| Google + OpenAI | 1~2 + 1   | $0.017 + $0.04~0.08   |
| Pexels + Gemini | 1 + 1     | $0 (Pexels 免費) + $0.01~0.05 |
| Google + Gemini | 1~2 + 1   | $0.017 + $0.01~0.05   |

> Google Maps/Places API 有每月 $200 免費額度，OpenAI/Gemini 圖像生成依實際 API 價格計算。

---

## 數位衣櫥（Digital Wardrobe）功能規劃

- 每位用戶擁有專屬雲端衣櫥，可永久儲存上傳的衣物照片
- 支援自訂分類（上衣、下身、外套、配件、鞋子等）
- 衣物可標記顏色、材質、季節、品牌等屬性
- 提供 CRUD 與分類管理介面
- 可直接將衣櫥內衣物加入穿搭生成流程

### API 規劃
- `GET /api/wardrobe`：取得使用者所有衣物
- `POST /api/wardrobe`：新增衣物
- `PUT /api/wardrobe/:id`：編輯衣物
- `DELETE /api/wardrobe/:id`：刪除衣物
- `GET /api/wardrobe/categories`：取得所有分類

### 資料結構
```typescript
interface WardrobeItem {
  id: string;
  userId: string;
  imageUrl: string;
  name: string;
  category: string; // 上衣、下身、外套、配件、鞋子...
  color?: string;
  material?: string;
  season?: string;
  brand?: string;
  createdAt: string;
  updatedAt: string;
}
```

## 自拍照儲存功能

- 每位用戶可儲存多張自拍照（全身、半身、不同造型等）
- 自拍照可命名、標記（如：正面、側臉、長髮、短髮、淡妝、濃妝等）
- 自拍照與衣物一樣存於雲端 Storage，屬性存於資料庫
- 穿搭流程可直接從自拍庫選擇要用的自拍照

### API 規劃
- `GET /api/selfies`：取得使用者所有自拍照
- `POST /api/selfies`：新增自拍照
- `PUT /api/selfies/:id`：編輯自拍照屬性
- `DELETE /api/selfies/:id`：刪除自拍照

### 資料結構
```typescript
interface SelfieItem {
  id: string;
  userId: string;
  imageUrl: string;
  name: string;
  tags?: string[]; // 例如 ['正面', '長髮', '淡妝']
  createdAt: string;
  updatedAt: string;
}
```

### UX Flow 補充
- 登入 → 進入「自拍庫」頁面 → 上傳/管理自拍照
- 穿搭流程選擇自拍時，可從自拍庫挑選

## 地點收藏與儲存功能

- 每位用戶可儲存多個常用/喜愛的旅遊地點
- 地點可自訂名稱、標籤（如：賞櫻、購物、海邊、親子等）、分類
- 可儲存地點代表照片、地圖連結、地址等資訊
- 穿搭流程可直接從收藏地點快速選擇

### API 規劃
- `GET /api/locations`：取得使用者所有收藏地點
- `POST /api/locations`：新增收藏地點
- `PUT /api/locations/:id`：編輯地點資訊
- `DELETE /api/locations/:id`：刪除收藏地點

### 資料結構
```typescript
interface SavedLocation {
  id: string;
  userId: string;
  name: string;
  address?: string;
  mapUrl?: string;
  imageUrl?: string; // 代表照片
  tags?: string[];   // 例如 ['賞櫻', '購物']
  category?: string; // 例如 '城市', '自然', '景點'
  createdAt: string;
  updatedAt: string;
}
```

### UX Flow 補充
- 登入 → 進入「我的地點」頁面 → 新增/管理收藏地點
- 穿搭流程選擇地點時，可從收藏地點快速挑選