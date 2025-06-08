import React, { useState } from 'react';
import Image from 'next/image';
import { Check } from 'lucide-react';

interface Step3DestinationPlannerProps {
  result: { name: string; address: string; map_url: string; images: string[] } | null;
  setResult: React.Dispatch<React.SetStateAction<{ name: string; address: string; map_url: string; images: string[] } | null>>;
  selectedPhoto: string;
  setSelectedPhoto: React.Dispatch<React.SetStateAction<string>>;
  setSelectedDestination: React.Dispatch<React.SetStateAction<{ name: string; address: string; mapUrl: string; image: string } | null>>;
}

const Step3DestinationPlanner: React.FC<Step3DestinationPlannerProps> = ({
  result,
  setResult,
  selectedPhoto,
  setSelectedPhoto,
  setSelectedDestination
}) => {
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 搜尋地點
  const handleSearch = async () => {
    if (!inputValue.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    setSelectedPhoto('');
    try {
      const res = await fetch('/api/search_location_photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ location_name: inputValue })
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setResult(data);
      }
    } catch {
      setError('搜尋失敗，請稍後再試');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* 一鍵帶入範例地點 */}
      <div className="flex justify-center mb-4">
        <button
          className="bg-gray-200 px-4 py-2 rounded-lg"
          onClick={() => {
            const example = {
              name: '東京鐵塔',
              address: '日本東京都港區芝公園4-2-8',
              map_url: 'https://goo.gl/maps/2m1Qw1Qw1Qw1Qw1Q8',
              images: [
                '/tokyo.jpeg',
                '/tokyo-1.jpeg',
                '/tokyo-2.jpeg'
              ]
            };
            setResult(example);
            setSelectedPhoto(example.images[0]);
            setSelectedDestination({
              name: example.name,
              address: example.address,
              mapUrl: example.map_url,
              image: example.images[0]
            });
          }}
        >
          一鍵帶入範例地點
        </button>
      </div>
      {/* 只保留 Pexels 搜尋 input、搜尋結果等 UI */}
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2"
          placeholder="輸入目的地，例如：東京鐵塔"
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleSearch();
            }
          }}
          autoComplete="off"
          disabled={loading}
        />
        <button
          onClick={handleSearch}
          disabled={loading || !inputValue.trim()}
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all"
        >
          {loading ? '搜尋中...' : '搜尋地點'}
        </button>
      </div>
      {error && <div className="text-red-600 mb-4">{error}</div>}
      {result && (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="mb-2">
            <span className="font-bold">地點：</span>{result.name}
          </div>
          <div className="mb-2">
            <span className="font-bold">地址：</span>{result.address}
          </div>
          <div className="mb-4">
            <a href={result.map_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">點擊查看 Google 地圖</a>
          </div>
          <div className="mb-4 grid grid-cols-2 md:grid-cols-3 gap-3">
            {result.images && result.images.map((url: string, idx: number) => (
              <div key={idx} className="relative group">
                <Image
                  src={url}
                  alt={`代表照片${idx+1}`}
                  width={200}
                  height={120}
                  className={`rounded-lg cursor-pointer border-4 transition-all duration-200 ${selectedPhoto === url ? 'border-purple-500' : 'border-transparent'}`}
                  onClick={() => {
                    setSelectedPhoto(url);
                    setSelectedDestination({
                      name: result.name,
                      address: result.address,
                      mapUrl: result.map_url,
                      image: url
                    });
                  }}
                  unoptimized
                />
                {selectedPhoto === url && (
                  <div className="absolute inset-0 bg-purple-500/30 flex items-center justify-center rounded-lg pointer-events-none">
                    <Check className="text-white" size={48} />
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

export default Step3DestinationPlanner; 