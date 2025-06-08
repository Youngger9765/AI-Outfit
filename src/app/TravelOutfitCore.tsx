'use client';
import React, { useState, useRef } from 'react';
import { 
  Camera, 
  MapPin, 
  Upload, 
  Sparkles, 
  User,
  Play,
  Download,
  Share2,
  Check
} from 'lucide-react';
import Image from 'next/image';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';

type UploadedCloth = {
  id: number;
  file: File;
  preview: string | ArrayBuffer | null;
  name: string;
};

interface SelfieImage {
  file: File;
  preview: string | ArrayBuffer | null;
}

interface GeneratedContent {
  type: string;
  url: string;
  description: string;
  coachMessage: string;
  outfitDetails: {
    climate: string;
    style: string;
    clothesUsed: number;
    recommendation: string;
  };
}

// 工具函式：fetch public file as File
async function fetchPublicFileAsFile(url: string, name: string, type?: string) {
  const res = await fetch(url);
  const blob = await res.blob();
  return new File([blob], name, { type: type || blob.type });
}

const TravelOutfitCore = () => {
  const [uploadedClothes, setUploadedClothes] = useState<UploadedCloth[]>([]);
  const [selfieImage, setSelfieImage] = useState<SelfieImage | null>(null);
  const [selectedDestination, setSelectedDestination] = useState<
    { name: string; address: string; mapUrl: string; image: string } | null
  >(null);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiProvider, setAiProvider] = useState<'openai' | 'gemini'>('gemini');
  
  const clothesInputRef = useRef<HTMLInputElement>(null);
  const selfieInputRef = useRef<HTMLInputElement>(null);
  const clothesRef = useRef<HTMLDivElement | null>(null);
  const selfieRef = useRef<HTMLDivElement | null>(null);
  const destinationRef = useRef<HTMLDivElement | null>(null);
  const generateRef = useRef<HTMLDivElement | null>(null);

  // 新增 Step3 相關 state
  const [destinationResult, setDestinationResult] = useState<
    { name: string; address: string; map_url: string; images: string[] } | null
  >(null);
  const [selectedPhoto, setSelectedPhoto] = useState<string>('');

  // 新增 destinationTab 狀態
  const [destinationTab, setDestinationTab] = useState<'pexels' | 'google'>('pexels');
  const [googleSearchInput, setGoogleSearchInput] = useState('');
  const [googleSearchLoading, setGoogleSearchLoading] = useState(false);
  const [googleSearchError, setGoogleSearchError] = useState('');
  const [googlePlacePhotos, setGooglePlacePhotos] = useState<string[]>([]);
  const [googleSelectedPhoto, setGoogleSelectedPhoto] = useState('');
  const [googlePlaceInfo, setGooglePlaceInfo] = useState<{ name: string; address: string; url: string } | null>(null);
  const [googleMapCenter, setGoogleMapCenter] = useState({ lat: 35.6895, lng: 139.6917 });
  const [googleMarkerPos, setGoogleMarkerPos] = useState({ lat: 35.6895, lng: 139.6917 });
  const [googleMapZoom, setGoogleMapZoom] = useState(14);
  const [googleModalPhoto, setGoogleModalPhoto] = useState<string | null>(null);

  // Google Map 狀態
  const mapCenter = { lat: 35.6895, lng: 139.6917 }; // 東京
  const mapZoom = 14;

  // 載入 Google Maps JS API
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries: ['places']
  });

  const handleClothesUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;
    const files = Array.from(event.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedClothes(prev => [
          ...prev,
          {
            id: Date.now() + Math.random(),
            file: file,
            preview: e.target?.result || null,
            name: file.name
          }
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSelfieUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelfieImage({
          file: file,
          preview: e.target ? e.target.result : null
        });
      };
      reader.readAsDataURL(typeof file === 'string' ? file : file);
    }
  };

  const generateTravelContent = async () => {
    setIsGenerating(true);

    // 組合 prompt，強調真實風格
    const clothesList = uploadedClothes.map(c => c.name).join('、') || '時尚服飾';
    const destName = selectedDestination?.name || '旅行地點';
    const prompt = `
    Combine the provided face and outfit onto a realistic human figure and place them naturally at the given location. 
    Make sure the composition shows the full body (head to feet) clearly, centered in the frame, with natural proportions and lighting that matches the background. 
    The final image should look like an authentic scene at this location.
    ${clothesList ? `The outfit includes: ${clothesList}.` : ""}
    Location: ${destName}.
    `;
    
    let imageUrl = '';
    try {
      const formData = new FormData();
      formData.append('prompt', prompt);
      uploadedClothes.forEach((cloth, idx) => {
        formData.append('images', cloth.file, `cloth${idx}.jpg`);
      });
      if (selfieImage) {
        formData.append('images', selfieImage.file, 'selfie.jpg');
      }
      if (selectedDestination?.image) {
        const res = await fetch(selectedDestination.image);
        const blob = await res.blob();
        formData.append('images', blob, 'location.jpg');
      }
      // 根據用戶選擇的 AI 服務商決定 endpoint
      const endpoint = aiProvider === 'openai' ? '/api/edit-image' : '/api/edit-image-gemini';
      const res = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.imageBase64) {
        imageUrl = `data:image/png;base64,${data.imageBase64}`;
      } else {
        imageUrl = '';
        alert(data.error ? JSON.stringify(data.error) : 'AI 生成失敗');
      }
    } catch (e) {
      imageUrl = '';
      alert('AI 生成失敗: ' + String(e));
    }

    const coachMessages = [
      `太棒了！這套穿搭完美展現了你的個人魅力✨`,
      `在${selectedDestination?.name || '旅行地點'}穿這套一定超亮眼！色彩搭配很有品味👏`,
      `這個搭配充滿了你的風格精髓，你穿起來一定很棒`,
      `完美！這套穿搭既實用又時尚，很適合旅途中的你💫`,
      `你的穿搭品味真不錯！這套在${selectedDestination?.name || '旅行地點'}絕對是焦點🔥`
    ];
    const randomMessage = coachMessages[Math.floor(Math.random() * coachMessages.length)];

    setGeneratedContent({
      type: 'image',
      url: imageUrl,
      description: `為你在${selectedDestination?.name || '旅行地點'}的旅行生成的專屬穿搭照片`,
      coachMessage: randomMessage,
      outfitDetails: {
        climate: '',
        style: '',
        clothesUsed: uploadedClothes.length,
        recommendation: `這套搭配運用了你上傳的${uploadedClothes.length}件衣物中的精選單品，並結合你選擇的旅遊地點特色。`
      }
    });

    setIsGenerating(false);
  };

  const handleDownloadImage = () => {
    if (generatedContent?.url) {
      // 創建一個臨時的 a 標籤來下載
      const link = document.createElement('a');
      link.href = generatedContent.url;
      link.download = `travel-outfit-${selectedDestination?.name || 'photo'}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const Step1ClothesUpload = () => (
    <div className="mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">上傳你的衣服</h2>
        <p className="text-gray-600">拍照或選擇你想要搭配的衣服照片</p>
      </div>
      {/* 一鍵帶入範例衣服 */}
      <div className="flex justify-center mb-4">
        <button
          className="bg-gray-200 px-4 py-2 rounded-lg"
          onClick={async () => {
            const files = await Promise.all([
              fetchPublicFileAsFile('/hat.jpeg', 'hat.jpeg'),
              fetchPublicFileAsFile('/clothes.jpeg', 'clothes.jpeg'),
              fetchPublicFileAsFile('/necklance.webp', 'necklance.webp'),
              fetchPublicFileAsFile('/pants.jpg', 'pants.jpg'),
            ]);
            files.forEach(file => {
              const reader = new FileReader();
              reader.onload = (e) => {
                setUploadedClothes(prev => [
                  ...prev,
                  {
                    id: Date.now() + Math.random(),
                    file,
                    preview: e.target?.result || null,
                    name: file.name
                  }
                ]);
              };
              reader.readAsDataURL(file);
            });
          }}
        >
          一鍵帶入範例衣服
        </button>
      </div>
      <div 
        className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-purple-400 transition-colors cursor-pointer"
        onClick={() => { if (clothesInputRef.current) clothesInputRef.current.click(); }}
      >
        <Camera className="mx-auto mb-4 text-gray-400" size={48} />
        <h3 className="text-lg font-medium text-gray-700 mb-2">點擊上傳衣服照片</h3>
        <p className="text-sm text-gray-500">支援 JPG, PNG 格式，可一次選擇多張</p>
        <input
          ref={clothesInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleClothesUpload}
          className="hidden"
        />
      </div>

      {uploadedClothes.length > 0 && (
        <div className="mt-8 mx-auto">
          <h3 className="flex items-center justify-center text-lg font-medium text-gray-800 mb-4">已上傳的衣服 ({uploadedClothes.length})</h3>
          <div className="flex flex-wrap justify-center gap-4">
            {uploadedClothes.map(item => (
              <div key={item.id} className="relative">
                {/* FileReader 產生的 data URL 只能用 <img>，加 eslint disable */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.preview as string}
                  alt={item.name}
                  className="mx-auto w-32 h-40 object-contain rounded-lg shadow-lg bg-white"
                />
                <button
                  type="button"
                  onClick={() => setUploadedClothes(prev => prev.filter(c => c.id !== item.id))}
                  className="absolute top-1 right-1 bg-white bg-opacity-80 rounded-full p-1 shadow hover:bg-red-500 hover:text-white transition-colors z-10"
                  style={{ lineHeight: 1 }}
                  aria-label="刪除單品"
                >
                  ×
                </button>
                <div className="absolute inset-0 bg-opacity-0 hover:bg-opacity-20 transition-all rounded-lg flex items-center justify-center">
                  <Check className="text-white opacity-0 hover:opacity-100" size={24} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const Step2SelfieUpload = () => (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">上傳你的自拍照</h2>
        <p className="text-gray-600">讓 AI 了解你的身形和風格偏好</p>
      </div>
      {/* 一鍵帶入範例自拍 */}
      <div className="flex justify-center mb-4">
        <button
          className="bg-gray-200 px-4 py-2 rounded-lg"
          onClick={async () => {
            const file = await fetchPublicFileAsFile('/sample-girl.jpeg', 'sample-girl.jpeg');
            const reader = new FileReader();
            reader.onload = (e) => {
              setSelfieImage({
                file,
                preview: e.target ? e.target.result : null
              });
            };
            reader.readAsDataURL(file);
          }}
        >
          一鍵帶入範例自拍
        </button>
      </div>
      <div 
        className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-purple-400 transition-colors cursor-pointer"
        onClick={() => { if (selfieInputRef.current) selfieInputRef.current.click(); }}
      >
        {selfieImage ? (
          <div className="relative">
            {/* FileReader 產生的 data URL 只能用 <img>，加 eslint disable */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={selfieImage.preview as string} 
              alt="自拍照預覽"
              className="mx-auto w-48 h-64 object-cover rounded-lg shadow-lg"
            />
            <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1">
              <Check size={16} />
            </div>
          </div>
        ) : (
          <>
            <User className="mx-auto mb-4 text-gray-400" size={48} />
            <h3 className="text-lg font-medium text-gray-700 mb-2">點擊上傳自拍照</h3>
            <p className="text-sm text-gray-500">建議全身照或半身照，光線充足</p>
          </>
        )}
        <input
          ref={selfieInputRef}
          type="file"
          accept="image/*"
          onChange={handleSelfieUpload}
          className="hidden"
        />
      </div>
    </div>
  );

  // Step 3: 目的地規劃 UX Flow（只選擇，不儲存）
  const Step3DestinationPlanner = ({
    result,
    setResult,
    selectedPhoto,
    setSelectedPhoto,
    setSelectedDestination
  } : {
    result: { name: string; address: string; map_url: string; images: string[] } | null,
    setResult: React.Dispatch<React.SetStateAction<{ name: string; address: string; map_url: string; images: string[] } | null>>,
    selectedPhoto: string,
    setSelectedPhoto: React.Dispatch<React.SetStateAction<string>>,
    setSelectedDestination: React.Dispatch<React.SetStateAction<{ name: string; address: string; mapUrl: string; image: string } | null>>
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

  // Step4 準備區塊
  const Step4Prepare = () => (
    <div className="max-w-md mx-auto text-center">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">準備生成你的旅遊穿搭照片</h2>
      {/* AI 服務商選擇器 */}
      <div className="flex justify-center mb-6 gap-6">
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="aiProvider"
            value="gemini"
            checked={aiProvider === 'gemini'}
            onChange={() => setAiProvider('gemini')}
          />
          Google Gemini
        </label>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="aiProvider"
            value="openai"
            checked={aiProvider === 'openai'}
            onChange={() => setAiProvider('openai')}
          />
          OpenAI
        </label>
      </div>
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="mb-6">
          <h3 className="font-bold text-gray-700 mb-2">你已選擇的照片</h3>
          <div className="grid grid-cols-3 gap-4 items-start">
            <div>
              <div className="text-sm text-gray-500 mb-1">衣服照片</div>
              <div className="flex flex-wrap gap-2">
                {uploadedClothes.map((item, idx) => (
                  // FileReader 產生的 data URL 只能用 <img>，加 eslint disable
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={idx} src={item.preview as string} alt={item.name} className="w-16 h-16 object-cover rounded-md border" />
                ))}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">自拍照</div>
              {selfieImage && (
                // FileReader 產生的 data URL 只能用 <img>，加 eslint disable
                // eslint-disable-next-line @next/next/no-img-element
                <img src={selfieImage.preview as string} alt="自拍照" className="w-16 h-16 object-cover rounded-md border" />
              )}
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">地點代表照片</div>
              {selectedDestination?.image && (
                <div>
                  <Image src={selectedDestination.image} alt="地點代表照片" width={64} height={64} className="w-16 h-16 object-cover rounded-md border mb-1" unoptimized />
                  <div className="text-xs text-gray-600 truncate max-w-[64px]">{selectedDestination.name}</div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Upload className="text-purple-600" size={24} />
            </div>
            <p className="text-sm text-gray-600">
              {uploadedClothes.length} 件衣服
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <User className="text-pink-600" size={24} />
            </div>
            <p className="text-sm text-gray-600">
              1 張自拍照
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <MapPin className="text-blue-600" size={24} />
            </div>
            <p className="text-sm text-gray-600">
              {selectedDestination && selectedDestination.name}
            </p>
          </div>
        </div>
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4">
          <h3 className="font-bold text-gray-800 mb-2">即將為你生成：</h3>
          <p className="text-gray-600">
            適合在{selectedDestination && selectedDestination.name}穿著的旅遊穿搭照片
          </p>
        </div>
      </div>
      {/* 生成按鈕與 loading 狀態 */}
      {!isGenerating && !generatedContent && (
        <button
          onClick={generateTravelContent}
          className="w-full md:w-auto bg-gradient-to-r from-pink-500 to-purple-600 text-white px-12 py-4 rounded-lg hover:shadow-lg transition-all flex items-center gap-3 mx-auto text-lg font-medium"
        >
          <Sparkles size={24} />
          開始 AI 生成
        </button>
      )}
      {isGenerating && (
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6">
            <div className="w-24 h-24 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">AI 正在生成你的旅遊穿搭照片...</h2>
          <p className="text-gray-600 mb-4">分析你的衣服、身形和目的地風格</p>
        </div>
      )}
    </div>
  );

  // Step4 生成結果區塊
  const Step4Result = () => (
    <>
      {generatedContent && (
        <div className="max-w-md mx-auto text-center mt-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">你的專屬旅遊穿搭照片 ✨</h2>
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            {generatedContent?.url ? (
              <Image src={generatedContent.url} alt="AI生成穿搭" width={400} height={400} style={{ maxWidth: 400 }} unoptimized />
            ) : null}
            {/* AI 教練評語 */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="text-purple-600" size={18} />
                <span className="font-medium text-purple-800">AI 穿搭教練</span>
              </div>
              <p className="text-gray-700">{generatedContent.coachMessage}</p>
            </div>
            {/* 穿搭詳情 */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <h4 className="font-bold text-gray-800 mb-3">穿搭分析報告</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">目的地：</span>
                  <span className="font-medium">{selectedDestination?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">當地地址：</span>
                  <span className="font-medium">{selectedDestination?.address}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">使用衣物：</span>
                  <span className="font-medium">{generatedContent.outfitDetails.clothesUsed} 件精選單品</span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-600">{generatedContent.outfitDetails.recommendation}</p>
              </div>
            </div>
            <div className="flex justify-center gap-4 flex-wrap">
              <button 
                onClick={handleDownloadImage}
                className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
              >
                <Download size={20} />
                下載照片
              </button>
              <button className="bg-gradient-to-r from-green-500 to-teal-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all flex items-center gap-2">
                <Share2 size={20} />
                分享到社群
              </button>
              <button className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all flex items-center gap-2">
                <Play size={20} />
                生成影片版本
              </button>
            </div>
          </div>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => {
                generateTravelContent();
              }}
              className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-3 rounded-lg hover:shadow-lg transition-all"
            >
              生成另一套穿搭
            </button>
            <button
              onClick={() => {
                setUploadedClothes([]);
                setSelfieImage(null);
                setSelectedDestination(null);
                setGeneratedContent(null);
              }}
              className="bg-gray-200 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-300 transition-all"
            >
              重新開始
            </button>
          </div>
        </div>
      )}
    </>
  );

  const scrollToRef = (ref: React.RefObject<HTMLDivElement | null>) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="mx-auto px-4 py-6">
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Sparkles className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">旅行穿搭助手</h1>
                <p className="text-sm text-gray-500">4步生成專屬旅遊穿搭照片</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content 一頁式流程 */}
      <main className="mx-auto px-4 py-8 max-w-2xl">
        {/* 步驟1：衣服上傳 */}
        <div ref={clothesRef} className="mb-16">
          <Step1ClothesUpload />
          <div className="flex justify-center mt-8">
            <button
              onClick={() => scrollToRef(selfieRef)}
              className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-3 rounded-lg hover:shadow-lg transition-all"
              disabled={uploadedClothes.length === 0}
            >
              下一步：上傳自拍照
            </button>
          </div>
        </div>
        {/* 步驟2：自拍上傳 */}
        <div ref={selfieRef} className="mb-16">
          <Step2SelfieUpload />
          <div className="flex justify-center mt-8">
            <button
              onClick={() => scrollToRef(destinationRef)}
              className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-3 rounded-lg hover:shadow-lg transition-all"
              disabled={!selfieImage}
            >
              下一步：選擇目的地
            </button>
          </div>
        </div>
        {/* 步驟3：目的地選擇 */}
        <div ref={destinationRef} className="mb-16">
          {/* 共用標題區塊 */}
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">目的地規劃</h2>
            <p className="text-gray-600">輸入目的地，搜尋並選擇代表照片</p>
          </div>
          <div className="flex mb-6 border-b">
            <button
              className={`px-6 py-2 font-bold ${destinationTab === 'pexels' ? 'border-b-2 border-purple-500 text-purple-700' : 'text-gray-500'}`}
              onClick={() => setDestinationTab('pexels')}
            >
              Pexels 圖片搜尋
            </button>
            <button
              className={`px-6 py-2 font-bold ${destinationTab === 'google' ? 'border-b-2 border-blue-500 text-blue-700' : 'text-gray-500'}`}
              onClick={() => setDestinationTab('google')}
            >
              Google Map（敬請期待）
            </button>
          </div>
          {destinationTab === 'pexels' && (
            <Step3DestinationPlanner
              result={destinationResult}
              setResult={setDestinationResult}
              selectedPhoto={selectedPhoto}
              setSelectedPhoto={setSelectedPhoto}
              setSelectedDestination={setSelectedDestination}
            />
          )}
          {destinationTab === 'google' && (
            <GoogleMapSearch
              googleSearchInput={googleSearchInput}
              setGoogleSearchInput={setGoogleSearchInput}
              googleSearchLoading={googleSearchLoading}
              setGoogleSearchLoading={setGoogleSearchLoading}
              googleSearchError={googleSearchError}
              setGoogleSearchError={setGoogleSearchError}
              googlePlacePhotos={googlePlacePhotos}
              setGooglePlacePhotos={setGooglePlacePhotos}
              googleSelectedPhoto={googleSelectedPhoto}
              setGoogleSelectedPhoto={setGoogleSelectedPhoto}
              googlePlaceInfo={googlePlaceInfo}
              setGooglePlaceInfo={setGooglePlaceInfo}
              googleMapCenter={googleMapCenter}
              setGoogleMapCenter={setGoogleMapCenter}
              googleMarkerPos={googleMarkerPos}
              setGoogleMarkerPos={setGoogleMarkerPos}
              googleMapZoom={googleMapZoom}
              setGoogleMapZoom={setGoogleMapZoom}
              googleModalPhoto={googleModalPhoto}
              setGoogleModalPhoto={setGoogleModalPhoto}
              setSelectedDestination={setSelectedDestination}
            />
          )}
          <div className="flex justify-center mt-8">
            <button
              onClick={() => {
                scrollToRef(generateRef);
              }}
              className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-3 rounded-lg hover:shadow-lg transition-all"
              disabled={!selectedDestination}
            >
              下一步：生成穿搭照片
            </button>
          </div>
        </div>
        {/* 步驟4：生成結果 */}
        <div ref={generateRef} className="mb-16">
          <Step4Prepare />
          <Step4Result />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="w-full max-w-lg mx-auto px-4 py-6 text-center">
          <p className="text-gray-500 text-sm">
            由 AI 驅動的智能穿搭助手 • 讓每次旅行都完美搭配
          </p>
        </div>
      </footer>
    </div>
  );
};

// GoogleMapSearch 元件
interface GoogleMapSearchProps {
  googleSearchInput: string;
  setGoogleSearchInput: React.Dispatch<React.SetStateAction<string>>;
  googleSearchLoading: boolean;
  setGoogleSearchLoading: React.Dispatch<React.SetStateAction<boolean>>;
  googleSearchError: string;
  setGoogleSearchError: React.Dispatch<React.SetStateAction<string>>;
  googlePlacePhotos: string[];
  setGooglePlacePhotos: React.Dispatch<React.SetStateAction<string[]>>;
  googleSelectedPhoto: string;
  setGoogleSelectedPhoto: React.Dispatch<React.SetStateAction<string>>;
  googlePlaceInfo: { name: string; address: string; url: string } | null;
  setGooglePlaceInfo: React.Dispatch<React.SetStateAction<{ name: string; address: string; url: string } | null>>;
  googleMapCenter: { lat: number; lng: number };
  setGoogleMapCenter: React.Dispatch<React.SetStateAction<{ lat: number; lng: number }>>;
  googleMarkerPos: { lat: number; lng: number };
  setGoogleMarkerPos: React.Dispatch<React.SetStateAction<{ lat: number; lng: number }>>;
  googleMapZoom: number;
  setGoogleMapZoom: React.Dispatch<React.SetStateAction<number>>;
  googleModalPhoto: string | null;
  setGoogleModalPhoto: React.Dispatch<React.SetStateAction<string | null>>;
  setSelectedDestination: React.Dispatch<React.SetStateAction<{ name: string; address: string; mapUrl: string; image: string } | null>>;
}

const GoogleMapSearch = ({
  googleSearchInput,
  setGoogleSearchInput,
  googleSearchLoading,
  setGoogleSearchLoading,
  googleSearchError,
  setGoogleSearchError,
  googlePlacePhotos,
  setGooglePlacePhotos,
  googleSelectedPhoto,
  setGoogleSelectedPhoto,
  googlePlaceInfo,
  setGooglePlaceInfo,
  googleMapCenter,
  setGoogleMapCenter,
  googleMarkerPos,
  setGoogleMarkerPos,
  googleMapZoom,
  setGoogleMapZoom,
  googleModalPhoto,
  setGoogleModalPhoto,
  setSelectedDestination
}: GoogleMapSearchProps) => {
  const mapRef = useRef<google.maps.Map | null>(null);

  const handleSearchLocation = async () => {
    if (!googleSearchInput.trim()) return;
    setGoogleSearchLoading(true);
    setGoogleSearchError('');
    setGooglePlacePhotos([]);
    setGoogleSelectedPhoto('');
    setGooglePlaceInfo(null);
    try {
      const res = await fetch(
        `https://places.googleapis.com/v1/places:searchText?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-FieldMask': '*'
          },
          body: JSON.stringify({
            textQuery: googleSearchInput,
            languageCode: 'zh-TW',
            regionCode: 'JP'
          })
        }
      );
      const data = await res.json();
      if (data.places && data.places[0] && data.places[0].location) {
        const loc = data.places[0].location;
        setGoogleMarkerPos({ lat: loc.latitude, lng: loc.longitude });
        setGoogleMapCenter({ lat: loc.latitude, lng: loc.longitude });
        setGoogleMapZoom(16);
        // 地點資訊
        setGooglePlaceInfo({
          name: data.places[0].displayName?.text || '',
          address: data.places[0].formattedAddress || '',
          url: data.places[0].googleMapsUri || ''
        });
        // 取得地點照片
        if (data.places[0].photos && data.places[0].photos.length > 0) {
          const photos = data.places[0].photos;
          const photoUrls = photos.map((photo: any) =>
            `https://places.googleapis.com/v1/${photo.name}/media?maxWidthPx=600&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
          );
          setGooglePlacePhotos(photoUrls);
        } else {
          setGooglePlacePhotos([]);
        }
      } else {
        setGoogleSearchError('查無此地點，請嘗試其他關鍵字');
      }
    } catch {
      setGoogleSearchError('搜尋失敗，請稍後再試');
    }
    setGoogleSearchLoading(false);
  };

  const handleMapClick = async (e: google.maps.MapMouseEvent) => {
    const placeId = (e as any).placeId;
    if (placeId) {
      (e as any).stop && (e as any).stop();
      setGoogleSearchInput('');
      setGoogleSearchError('');
      setGooglePlacePhotos([]);
      setGoogleSelectedPhoto('');
      setGooglePlaceInfo(null);
      try {
        const res = await fetch(
          `https://places.googleapis.com/v1/places/${placeId}?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`,
          {
            headers: { 'X-Goog-FieldMask': '*' }
          }
        );
        const data = await res.json();
        if (data.location) {
          setGoogleMarkerPos({ lat: data.location.latitude, lng: data.location.longitude });
          setGoogleMapCenter({ lat: data.location.latitude, lng: data.location.longitude });
          setGoogleMapZoom(16);
        }
        setGooglePlaceInfo({
          name: data.displayName?.text || '',
          address: data.formattedAddress || '',
          url: data.googleMapsUri || ''
        });
        if (data.photos && data.photos.length > 0) {
          const photoUrls = data.photos.map((photo: any) =>
            `https://places.googleapis.com/v1/${photo.name}/media?maxWidthPx=600&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
          );
          setGooglePlacePhotos(photoUrls);
        } else {
          setGooglePlacePhotos([]);
        }
      } catch {
        setGoogleSearchError('取得地點資訊失敗，請稍後再試');
      }
    }
  };

  return (
    <>
      <div className="w-full max-w-md mb-4 flex gap-2">
        <input
          type="text"
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2"
          placeholder="搜尋地點，例如：東京塔"
          value={googleSearchInput}
          onChange={e => setGoogleSearchInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleSearchLocation();
            }
          }}
          autoComplete="off"
          disabled={googleSearchLoading}
        />
        <button
          onClick={handleSearchLocation}
          disabled={googleSearchLoading || !googleSearchInput.trim()}
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all"
        >
          {googleSearchLoading ? '搜尋中...' : '搜尋'}
        </button>
      </div>
      {googleSearchError && <div className="text-red-600 mb-4">{googleSearchError}</div>}
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '400px' }}
        center={googleMapCenter}
        zoom={googleMapZoom}
        options={{
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true
        }}
        onLoad={map => { mapRef.current = map; }}
        onClick={handleMapClick}
      >
        <Marker position={googleMarkerPos} />
      </GoogleMap>
      <div className="mt-4 text-gray-600 text-sm">目前座標：{googleMarkerPos.lat.toFixed(5)}, {googleMarkerPos.lng.toFixed(5)}</div>
      {/* 地點資訊卡片 */}
      {googlePlaceInfo && (
        <div className="w-full max-w-2xl bg-gray-50 rounded-lg shadow p-4 mb-4">
          <div className="font-bold text-lg mb-1">{googlePlaceInfo.name}</div>
          <div className="text-gray-700 mb-1">{googlePlaceInfo.address}</div>
          {googlePlaceInfo.url && (
            <a href={googlePlaceInfo.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-sm">在 Google Maps 上查看</a>
          )}
        </div>
      )}
      {/* 地點照片選擇區塊 */}
      <div className="w-full max-w-2xl mt-2">
        <div className="font-semibold mb-2">地點照片：</div>
        {googlePlacePhotos.length > 0 ? (
          <div className="flex flex-wrap gap-4 pb-2">
            {googlePlacePhotos.map((url, idx) => (
              <div key={url} className="relative group">
                <img
                  src={url}
                  alt={`地點照片${idx + 1}`}
                  className={`w-40 h-40 object-contain bg-white rounded-lg border-2 transition-all cursor-pointer duration-200 hover:shadow-xl ${googleSelectedPhoto === url ? 'border-blue-500 ring-2 ring-blue-400' : 'border-gray-200'}`}
                  onClick={() => setGoogleModalPhoto(url)}
                  onDoubleClick={() => {
                    setGoogleSelectedPhoto(url);
                    if (googlePlaceInfo) {
                      setSelectedDestination({
                        name: googlePlaceInfo.name,
                        address: googlePlaceInfo.address,
                        mapUrl: googlePlaceInfo.url,
                        image: url
                      });
                    }
                  }}
                  title="點擊放大，雙擊選擇代表照"
                />
                <button
                  className={`absolute top-1 right-1 px-2 py-0.5 text-xs rounded bg-white/80 border ${googleSelectedPhoto === url ? 'border-blue-500 text-blue-600 font-bold' : 'border-gray-300 text-gray-600'} shadow`}
                  onClick={e => {
                    e.stopPropagation();
                    setGoogleSelectedPhoto(url);
                    if (googlePlaceInfo) {
                      setSelectedDestination({
                        name: googlePlaceInfo.name,
                        address: googlePlaceInfo.address,
                        mapUrl: googlePlaceInfo.url,
                        image: url
                      });
                    }
                  }}
                >{googleSelectedPhoto === url ? '已選擇' : '選擇'}</button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-400">查無地點照片</div>
        )}
        {/* Modal 放大圖 */}
        {googleModalPhoto && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setGoogleModalPhoto(null)}>
            <img src={googleModalPhoto} alt="放大地點照片" className="max-w-3xl max-h-[80vh] rounded-lg shadow-2xl border-4 border-white" />
          </div>
        )}
        {/* 代表照大圖 */}
        {googleSelectedPhoto && (
          <div className="mt-6 flex flex-col items-center">
            <div className="font-semibold mb-2 text-blue-700">已選擇代表照片</div>
            <img src={googleSelectedPhoto} alt="代表照片" className="max-w-md max-h-96 rounded-xl border-4 border-blue-400 shadow-lg" />
          </div>
        )}
      </div>
    </>
  );
};

export default TravelOutfitCore;