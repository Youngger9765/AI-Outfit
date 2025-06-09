'use client';
import React, { useState } from 'react';
import LocationPhotoSelector from './LocationPhotoSelector';

interface Photo {
  src: { original: string; medium: string };
  alt?: string;
  id?: string | number;
}

interface PexelsSearchProps {
  result: { photos: Photo[] } | null;
  setResult: (result: { photos: Photo[] } | null) => void;
  selectedPhoto: string | null;
  setSelectedPhoto: (photo: string | null) => void;
  setSelectedDestination: (destination: { name: string; address: string; image: string; mapUrl?: string } | null) => void;
}

const PexelsSearch: React.FC<PexelsSearchProps> = ({
  result,
  setResult,
  selectedPhoto,
  setSelectedPhoto,
  setSelectedDestination,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!inputValue.trim()) return;

    // 檢查是否為台灣地點
    const taiwanKeywords = ['台灣', '臺灣', 'taiwan', '台北', '臺北', 'taipei', '新北', '基隆', '桃園', '新竹', '苗栗', '台中', '臺中', '彰化', '南投', '雲林', '嘉義', '台南', '臺南', '高雄', '屏東', '宜蘭', '花蓮', '台東', '臺東', '澎湖', '金門', '馬祖'];
    
    // 檢查是否為日本地點
    const japanKeywords = ['日本', 'japan', '東京', 'tokyo', '大阪', 'osaka', '京都', 'kyoto', '札幌', 'sapporo', '福岡', 'fukuoka', '名古屋', 'nagoya'];
    
    // 檢查輸入是否包含台灣或日本地名
    const isTaiwanLocation = taiwanKeywords.some(keyword => 
      inputValue.toLowerCase().includes(keyword.toLowerCase())
    );
    
    const isJapanLocation = japanKeywords.some(keyword => 
      inputValue.toLowerCase().includes(keyword.toLowerCase())
    );

    // 優化搜尋關鍵字
    let searchQuery = inputValue;
    if (isTaiwanLocation) {
      // 如果是台灣地點，加入台灣相關關鍵字
      searchQuery = `Taiwan ${inputValue} 台灣 景點 tourist attraction`;
    } else if (isJapanLocation) {
      // 如果是日本地點，加入日本相關關鍵字
      if (inputValue.includes('東京鐵塔') || inputValue.toLowerCase().includes('tokyo tower')) {
        searchQuery = 'Tokyo Tower Japan 東京鐵塔 日本 landmark';
      } else {
        searchQuery = `Japan ${inputValue} 日本 landmark tourist attraction`;
      }
    } else {
      // 一般地點搜尋
      searchQuery = `${inputValue} landmark tourist attraction scenic spot`;
    }

    // 特殊地點處理
    if (inputValue.includes('北投')) {
      searchQuery = 'Beitou Hot Spring Taiwan 北投溫泉 台灣';
    } else if (inputValue.includes('地熱谷')) {
      searchQuery = 'Beitou Thermal Valley Taiwan 北投地熱谷 台灣';
    }
    
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/search_location_photos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: searchQuery }),
      });

      if (!response.ok) {
        throw new Error('搜尋失敗');
      }

      const data = await response.json();
      console.log('API Response:', data);

      if (!data || !data.photos || !Array.isArray(data.photos)) {
        console.error('Invalid data format:', data);
        throw new Error('無效的搜尋結果');
      }
      
      // 如果沒有找到照片，嘗試更廣泛的搜尋
      if (data.photos.length === 0) {
        // 對於台灣地點，使用不同的備用搜尋策略
        const broadQuery = isTaiwanLocation 
          ? `Taiwan ${inputValue.split(' ')[0]} 台灣`
          : inputValue.split(' ')[0] + ' scenery landscape';

        const broadResponse = await fetch('/api/search_location_photos', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query: broadQuery }),
        });
        
        if (broadResponse.ok) {
          const broadData = await broadResponse.json();
          if (broadData && broadData.photos && Array.isArray(broadData.photos)) {
            data.photos = broadData.photos;
          }
        }
      }
      
      setResult(data);
      setSelectedPhoto(null);
      setSelectedDestination(null);
    } catch (err) {
      console.error('Search error:', err);
      setError(err instanceof Error ? err.message : '搜尋時發生錯誤');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 搜尋輸入框 */}
      <div className="flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="輸入目的地（例如：東京鐵塔）"
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button
          onClick={handleSearch}
          disabled={loading || !inputValue.trim()}
          className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? '搜尋中...' : '搜尋'}
        </button>
      </div>

      {/* 快速填入範例 */}
      <div className="flex justify-center">
        <button
          onClick={() => {
            setInputValue('東京鐵塔');
            handleSearch();
          }}
          className="bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 transition-all cursor-pointer text-sm"
        >
          使用範例：東京鐵塔
        </button>
      </div>

      {/* 錯誤訊息 */}
      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg">
          {error}
        </div>
      )}

      {/* 搜尋結果 */}
      {result && result.photos && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">地點照片：</h3>
          <LocationPhotoSelector
            photos={result.photos.map((photo) => ({ url: photo.src.original, alt: photo.alt, id: photo.id }))}
            selectedPhoto={selectedPhoto}
            onSelect={(url) => {
              setSelectedPhoto(url);
              const photo = result.photos.find((p) => p.src.original === url);
              setSelectedDestination({
                name: inputValue,
                address: '',
                image: url,
                ...(photo ? { alt: photo.alt } : {}),
                mapUrl: '',
              });
            }}
          />
        </div>
      )}
    </div>
  );
};

export default PexelsSearch;