import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';

interface UploadedCloth {
  id: number;
  file: File;
  preview: string | ArrayBuffer | null;
  name: string;
}

interface SelfieImage {
  file: File;
  preview: string | ArrayBuffer | null;
}

interface Step4PrepareProps {
  uploadedClothes: UploadedCloth[];
  selfieImage: SelfieImage | null;
  selectedDestination: { name: string; address: string; mapUrl: string; image: string } | null;
  aiProvider: 'openai' | 'gemini';
  setAiProvider: (provider: 'openai' | 'gemini') => void;
  isGenerating: boolean;
  generateTravelContent: () => Promise<void>;
}

const Step4Prepare: React.FC<Step4PrepareProps> = ({
  uploadedClothes,
  selfieImage,
  selectedDestination,
  aiProvider,
  setAiProvider,
  isGenerating,
  generateTravelContent
}) => {
  const [isDev, setIsDev] = useState(false);

  useEffect(() => {
    setIsDev(window.location.hostname === 'localhost' && window.location.port === '3000');
  }, []);

  // 添加調試日誌
  useEffect(() => {
    console.log('GeneratePrepare - selectedDestination:', selectedDestination);
    if (selectedDestination) {
      console.log('selectedDestination.image:', selectedDestination.image);
      console.log('selectedDestination.name:', selectedDestination.name);
    }
  }, [selectedDestination]);

  return (
    <div className="max-w-md mx-auto text-center">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">準備生成你的旅遊穿搭照片</h2>
      {/* AI 服務商選擇器 */}
      <div className="flex justify-center mb-6 gap-6">
        {isDev && (
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="aiProvider"
              value="gemini"
              checked={aiProvider === 'gemini'}
              onChange={() => setAiProvider('gemini')}
            />
            Google Gemini（開發用）
          </label>
        )}
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
              <div className="text-sm text-gray-500 mb-1">{uploadedClothes.length} 件衣服</div>
              <div className="flex flex-wrap gap-2">
                {uploadedClothes.map((item, idx) => (
                  // FileReader 產生的 data URL 只能用 <img>，加 eslint disable
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={idx} src={item.preview as string} alt={item.name} className="mx-auto w-16 h-16 object-cover rounded-md border" />
                ))}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">{selfieImage ? '1 張自拍照' : '0 張自拍照'}</div>
              {selfieImage && (
                // FileReader 產生的 data URL 只能用 <img>，加 eslint disable
                // eslint-disable-next-line @next/next/no-img-element
                <img src={selfieImage.preview as string} alt="自拍照" className="mx-auto w-16 h-16 object-cover rounded-md border" />
              )}
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">地點代表照片</div>
              {selectedDestination?.image ? (
                <div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={selectedDestination.image} alt="地點代表照片" className="mx-auto w-16 h-16 object-cover rounded-md border mb-1" />
                  <div className="text-xs text-gray-400 mt-1">{selectedDestination.name}</div>
                </div>
              ) : (
                <div className="text-xs text-gray-400">無地點照片</div>
              )}
            </div>
          </div>
        </div>
        {/* 生成按鈕與 loading 狀態 */}
        {!isGenerating && (
          <button
            onClick={generateTravelContent}
            className="w-full md:w-auto bg-gradient-to-r from-pink-500 to-purple-600 text-white px-12 py-4 rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-3 mx-auto text-lg font-medium cursor-pointer"
          >
            <Sparkles size={24} />
            揭曉我的旅行穿搭
          </button>
        )}
        {isGenerating && (
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-6">
              <div className="w-24 h-24 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">AI 正在為您量身打造專屬穿搭，預計約1分鐘完成...</h2>
            <div className="space-y-2 text-gray-600">
              <p>✨ 分析您的衣服、身形和目的地風格</p>
              <p>🎨 繪製完美符合場景的穿搭照片</p>
              <p>🌟 打造獨一無二的旅程風格</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Step4Prepare; 