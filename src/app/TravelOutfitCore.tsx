'use client';
import React, { useState, useRef, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import ClothesUpload from '@/components/travel-outfit/ClothesUpload';
import SelfieUpload from '@/components/travel-outfit/SelfieUpload';
import GeneratePrepare from '@/components/travel-outfit/GeneratePrepare';
import GenerateResult from '@/components/travel-outfit/GenerateResult';
import GoogleMapSearch from '@/components/travel-outfit/GoogleMapSearch';
import StepNavigator from '@/components/travel-outfit/StepNavigator';
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
  // 工具函式：fetch public file as File
  async function fetchPublicFileAsFile(url: string, name: string, type?: string) {
    const res = await fetch(url);
    const blob = await res.blob();
    return new File([blob], name, { type: type || blob.type });
  }

  const [uploadedClothes, setUploadedClothes] = useState<UploadedCloth[]>([]);
  const [selfieImage, setSelfieImage] = useState<SelfieImage | null>(null);
  const [selectedDestination, setSelectedDestination] = useState<
    { name: string; address: string; mapUrl: string; image: string } | null
  >(null);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiProvider, setAiProvider] = useState<'openai' | 'gemini'>('gemini');
  
  // 新增 Step3 相關 state
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

  // Add currentStep state
  const [currentStep, setCurrentStep] = useState(1);

  // Define steps
  const steps = [
    { number: 1, title: '上傳衣服' },
    { number: 2, title: '上傳個人照片' },
    { number: 3, title: '選擇地點' },
    { number: 4, title: '生成穿搭圖片' },
  ];

  // Step refs for content sections
  const stepRefs = {
    clothes: useRef<HTMLDivElement>(null),
    selfie: useRef<HTMLDivElement>(null),
    destination: useRef<HTMLDivElement>(null),
    generate: useRef<HTMLDivElement>(null)
  };

  // Add useEffect to track step progress
  useEffect(() => {
    // Step 1 -> 2: When clothes are uploaded
    if (uploadedClothes.length > 0 && currentStep === 1) {
      setCurrentStep(2);
    }
    // Step 2 -> 3: When selfie is uploaded
    if (selfieImage && currentStep === 2) {
      setCurrentStep(3);
    }
    // Step 3 -> 4: When destination is selected
    if (selectedDestination && currentStep === 3) {
      setCurrentStep(4);
    }
    // Handle going backwards
    if (!uploadedClothes.length) {
      setCurrentStep(1);
    } else if (!selfieImage && currentStep > 2) {
      setCurrentStep(2);
    } else if (!selectedDestination && currentStep > 3) {
      setCurrentStep(3);
    }
  }, [uploadedClothes, selfieImage, selectedDestination, currentStep]);

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

  const resetAll = () => {
    setUploadedClothes([]);
    setSelfieImage(null);
    setSelectedDestination(null);
    setGeneratedContent(null);
    setCurrentStep(1); // Reset step to 1
  };

  // Handle step navigation and scrolling
  const handleNextStep = (nextStep: number) => {
    setCurrentStep(nextStep);
    
    // Use requestAnimationFrame to ensure the DOM has updated
    requestAnimationFrame(() => {
      // Get the corresponding ref based on the next step
      const targetRef = (() => {
        switch (nextStep) {
          case 2:
            return stepRefs.selfie;
          case 3:
            return stepRefs.destination;
          case 4:
            return stepRefs.generate;
          default:
            return stepRefs.clothes;
        }
      })();

      // Calculate offset to account for sticky header
      const headerOffset = 120; // Updated to match our scroll-mt-30 (120px)
      const elementPosition = targetRef.current?.getBoundingClientRect().top;
      const offsetPosition = elementPosition ? elementPosition + window.pageYOffset - headerOffset : 0;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    });
  };

  const [pexelsResult, setPexelsResult] = useState<{ photos: { src: { original: string; medium: string }; alt?: string; id?: string | number }[] } | null>(null);

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
                <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                  AI 旅遊穿搭規劃
                </h1>
                <p className="text-gray-600">上傳衣服照片，讓 AI 為你規劃完美旅遊穿搭</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4">
        {/* Step Navigator */}
        <StepNavigator currentStep={currentStep} steps={steps} />

        {/* Content wrapper with proper top spacing */}
        <div className="pt-8">
          {/* Step 1: Upload Clothes */}
          <div 
            ref={stepRefs.clothes}
            className="relative pb-16 mb-16 border-b-2 border-gray-200 before:absolute before:bottom-0 before:left-1/2 before:-translate-x-1/2 before:w-32 before:h-1 before:bg-gradient-to-r before:from-pink-200 before:via-purple-200 before:to-pink-200 before:rounded-full scroll-mt-30"
          >
            <ClothesUpload
              uploadedClothes={uploadedClothes}
              setUploadedClothes={setUploadedClothes}
            />
            {uploadedClothes.length === 0 && (
              <div className="flex justify-center gap-4 mt-4 mb-8">
                <button
                  className="bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 transition-all cursor-pointer text-sm"
                  onClick={async () => {
                    // 清空現有的衣服
                    setUploadedClothes([]);
                    
                    // 加載範例衣服照片
                    const exampleClothes = [
                      { url: '/clothes.jpeg', name: '範例衣服1' },
                      { url: '/pants.jpg', name: '範例褲子' },
                      { url: '/hat.jpeg', name: '範例帽子' },
                      { url: '/necklance.webp', name: '範例配飾' }
                    ];

                    // 依序載入每張範例照片
                    for (const cloth of exampleClothes) {
                      const file = await fetchPublicFileAsFile(cloth.url, cloth.name, 'image/jpeg');
                      const reader = new FileReader();
                      reader.onload = (e) => {
                        setUploadedClothes(prev => [...prev, {
                          id: Date.now() + Math.random(),
                          file,
                          preview: e.target?.result || null,
                          name: cloth.name
                        }]);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                >
                  使用範例衣服
                </button>
              </div>
            )}
            <div className="flex justify-center mt-8">
              <button
                onClick={() => handleNextStep(2)}
                className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-3 rounded-lg hover:shadow-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                disabled={uploadedClothes.length === 0}
              >
                確認
              </button>
            </div>
          </div>

          {/* Step 2: Upload Selfie */}
          <div 
            ref={stepRefs.selfie}
            className="relative pb-16 mb-16 border-b-2 border-gray-200 before:absolute before:bottom-0 before:left-1/2 before:-translate-x-1/2 before:w-32 before:h-1 before:bg-gradient-to-r before:from-pink-200 before:via-purple-200 before:to-pink-200 before:rounded-full scroll-mt-30"
          >
            <SelfieUpload
              selfieImage={selfieImage}
              setSelfieImage={setSelfieImage}
            />
            {!selfieImage && (
              <div className="flex justify-center gap-4 mt-4 mb-8">
                <button
                  className="bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 transition-all cursor-pointer text-sm"
                  onClick={async () => {
                    // 清空現有的自拍照
                    setSelfieImage(null);
                    
                    // 加載範例自拍照
                    const file = await fetchPublicFileAsFile('/sample-girl.jpeg', '範例自拍照.jpg', 'image/jpeg');
                    const reader = new FileReader();
                    reader.onload = (e) => {
                      setSelfieImage({
                        file,
                        preview: e.target?.result || null
                      });
                    };
                    reader.readAsDataURL(file);
                  }}
                >
                  使用範例個人照
                </button>
              </div>
            )}
            <div className="flex justify-center mt-8">
              <button
                onClick={() => handleNextStep(3)}
                className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-3 rounded-lg hover:shadow-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                disabled={!selfieImage}
              >
                確認
              </button>
            </div>
          </div>

          {/* Step 3: Destination Selection */}
          <div 
            ref={stepRefs.destination}
            className="relative pb-16 mb-16 border-b-2 border-gray-200 before:absolute before:bottom-0 before:left-1/2 before:-translate-x-1/2 before:w-32 before:h-1 before:bg-gradient-to-r before:from-pink-200 before:via-purple-200 before:to-pink-200 before:rounded-full scroll-mt-30"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">目的地規劃</h2>
              <p className="text-gray-600">輸入目的地，搜尋並選擇代表照片</p>
            </div>
            <div className="flex mb-6 border-b">
              <button
                className={`px-6 py-2 font-bold cursor-pointer ${destinationTab === 'pexels' ? 'border-b-2 border-purple-500 text-purple-700 hover:text-purple-900' : 'text-gray-500 hover:text-gray-700'} transition-all`}
                onClick={() => setDestinationTab('pexels')}
              >
                圖庫搜尋
              </button>
              <button
                className={`px-6 py-2 font-bold cursor-pointer ${destinationTab === 'google' ? 'border-b-2 border-blue-500 text-blue-700 hover:text-blue-900' : 'text-gray-500 hover:text-gray-700'} transition-all`}
                onClick={() => setDestinationTab('google')}
              >
                Google Map
              </button>
            </div>
            {destinationTab === 'pexels' && (
              <PexelsSearch
                result={pexelsResult}
                setResult={setPexelsResult}
                selectedPhoto={selectedPhoto}
                setSelectedPhoto={(photo) => setSelectedPhoto(photo ?? '')}
                setSelectedDestination={(destination) => setSelectedDestination(destination ? { ...destination, mapUrl: destination.mapUrl ?? '' } : null)}
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
                onClick={() => handleNextStep(4)}
                className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-3 rounded-lg hover:shadow-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                disabled={!selectedDestination}
              >
                確認
              </button>
            </div>
          </div>

          {/* Step 4: Generate Result - No bottom border for the last step */}
          <div ref={stepRefs.generate} className="mb-16 scroll-mt-30">
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