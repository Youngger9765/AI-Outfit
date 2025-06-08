'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import { Search, Check } from 'lucide-react';

interface PexelsSearchProps {
  result: any;
  setResult: (result: any) => void;
  selectedPhoto: string | null;
  setSelectedPhoto: (photo: string | null) => void;
  setSelectedDestination: (destination: any) => void;
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

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/search_location_photos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: inputValue }),
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

  const handlePhotoClick = (photo: any) => {
    setSelectedPhoto(photo.src.original);
    setSelectedDestination({
      name: inputValue,
      address: '',
      image: photo.src.original,
    });
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
          className="text-sm text-purple-600 hover:text-purple-700"
        >
          快速填入範例：東京鐵塔
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
          <h3 className="text-lg font-semibold text-gray-800">搜尋結果</h3>
          <div className="grid grid-cols-2 gap-4">
            {result.photos.map((photo: any) => (
              <div
                key={photo.id}
                className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group"
                onClick={() => handlePhotoClick(photo)}
              >
                <Image
                  src={photo.src.medium}
                  alt={photo.alt || '目的地照片'}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                />
                {selectedPhoto === photo.src.original && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <Check className="text-white" size={32} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PexelsSearch;