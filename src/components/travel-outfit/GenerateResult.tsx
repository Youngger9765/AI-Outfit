import React from 'react';
import Image from 'next/image';
import { Sparkles, Download, Share2, Play } from 'lucide-react';

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

interface Step4ResultProps {
  generatedContent: GeneratedContent | null;
  selectedDestination: { name: string; address: string; mapUrl: string; image: string } | null;
  handleDownloadImage: () => void;
  generateTravelContent: () => Promise<void>;
  resetAll: () => void;
}

const Step4Result: React.FC<Step4ResultProps> = ({
  generatedContent,
  selectedDestination,
  handleDownloadImage,
  generateTravelContent,
  resetAll
}) => {
  if (!generatedContent) return null;

  return (
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
          onClick={generateTravelContent}
          className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-3 rounded-lg hover:shadow-lg transition-all"
        >
          生成另一套穿搭
        </button>
        <button
          onClick={resetAll}
          className="bg-gray-200 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-300 transition-all"
        >
          重新開始
        </button>
      </div>
    </div>
  );
};

export default Step4Result; 