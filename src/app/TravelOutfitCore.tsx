'use client';
import React, { useState, useRef } from 'react';
import { Sparkles } from 'lucide-react';
import ClothesUpload from '@/components/travel-outfit/ClothesUpload';
import SelfieUpload from '@/components/travel-outfit/SelfieUpload';
import DestinationPlanner from '@/components/travel-outfit/DestinationPlanner';
import GeneratePrepare from '@/components/travel-outfit/GeneratePrepare';
import GenerateResult from '@/components/travel-outfit/GenerateResult';
import GoogleMapSearch from '@/components/travel-outfit/GoogleMapSearch';
import PexelsSearch from '@/components/travel-outfit/PexelsSearch';

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

const TravelOutfitCore = () => {
  const [uploadedClothes, setUploadedClothes] = useState<UploadedCloth[]>([]);
  const [selfieImage, setSelfieImage] = useState<SelfieImage | null>(null);
  const [selectedDestination, setSelectedDestination] = useState<
    { name: string; address: string; mapUrl: string; image: string } | null
  >(null);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiProvider, setAiProvider] = useState<'openai' | 'gemini'>('gemini');
  
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

  const scrollToRef = (ref: React.RefObject<HTMLDivElement | null>) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const resetAll = () => {
    setUploadedClothes([]);
    setSelfieImage(null);
    setSelectedDestination(null);
    setGeneratedContent(null);
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

      {/* Main Content */}
      <main className="mx-auto px-4 py-8 max-w-2xl">
        {/* 步驟1：衣服上傳 */}
        <div ref={clothesRef} className="mb-16">
          <ClothesUpload
            uploadedClothes={uploadedClothes}
            setUploadedClothes={setUploadedClothes}
          />
          <div className="flex justify-center mt-8">
            <button
              onClick={() => scrollToRef(selfieRef)}
              className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-3 rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={uploadedClothes.length === 0}
            >
              下一步：上傳自拍照
            </button>
          </div>
        </div>

        {/* 步驟2：自拍上傳 */}
        <div ref={selfieRef} className="mb-16">
          <SelfieUpload
            selfieImage={selfieImage}
            setSelfieImage={setSelfieImage}
          />
          <div className="flex justify-center mt-8">
            <button
              onClick={() => scrollToRef(destinationRef)}
              className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-3 rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!selfieImage}
            >
              下一步：選擇目的地
            </button>
          </div>
        </div>

        {/* 步驟3：目的地選擇 */}
        <div ref={destinationRef} className="mb-16">
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
              Google Map
            </button>
          </div>
          {destinationTab === 'pexels' && (
            <PexelsSearch
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
              onClick={() => scrollToRef(generateRef)}
              className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-3 rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!selectedDestination}
            >
              下一步：生成穿搭照片
            </button>
          </div>
        </div>

        {/* 步驟4：生成結果 */}
        <div ref={generateRef} className="mb-16">
          <GeneratePrepare
            uploadedClothes={uploadedClothes}
            selfieImage={selfieImage}
            selectedDestination={selectedDestination}
            aiProvider={aiProvider}
            setAiProvider={setAiProvider}
            isGenerating={isGenerating}
            generateTravelContent={generateTravelContent}
          />
          <GenerateResult
            generatedContent={generatedContent}
            selectedDestination={selectedDestination}
            handleDownloadImage={handleDownloadImage}
            generateTravelContent={generateTravelContent}
            resetAll={resetAll}
          />
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

export default TravelOutfitCore;