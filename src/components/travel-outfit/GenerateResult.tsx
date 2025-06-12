import React, { useState } from 'react';
import { Sparkles, Download, Share2, Facebook, Maximize2 } from 'lucide-react';

interface GeneratedContent {
  type: string;
  url: string;
  description: string;
  coachMessage: string;
  fashionTip: string;
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

interface SocialShareProps {
  imageUrl: string;
  destinationName: string;
}

const SocialShare: React.FC<SocialShareProps> = ({ imageUrl, destinationName }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showCopiedMessage, setShowCopiedMessage] = useState(false);
  
  const shareText = encodeURIComponent(`我在 AI 穿搭教練生成了我的${destinationName}專屬旅行穿搭！快來看看！ #AI穿搭 #旅行時尚 #我的穿搭`);
  
  const handleShare = (platform: string) => {
    let shareUrl = '';
    
    switch (platform) {
      case 'line':
        shareUrl = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(imageUrl)}&text=${shareText}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(imageUrl)}&quote=${shareText}`;
        break;
      case 'instagram':
        // 複製分享文字到剪貼簿
        navigator.clipboard.writeText(decodeURIComponent(shareText)).then(() => {
          setShowCopiedMessage(true);
          setTimeout(() => setShowCopiedMessage(false), 2000);
        });
        return;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=600');
    }
    setShowMenu(false);
  };

  // 點擊外部關閉選單
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.share-menu') && !target.closest('.share-button')) {
        setShowMenu(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="bg-gradient-to-r from-green-500 to-teal-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer share-button"
      >
        <Share2 size={20} />
        分享到社群
      </button>

      {/* 社群選單 */}
      {showMenu && (
        <div className="absolute z-50 top-full left-1/2 -translate-x-1/2 mt-2 bg-white rounded-lg shadow-xl border border-gray-100 py-2 w-48 share-menu">
          {/* Line */}
          <button
            onClick={() => handleShare('line')}
            className="w-full px-4 py-2 flex items-center gap-3 hover:bg-gray-50 transition-colors"
          >
            <div className="w-5 h-5 text-[#00B900]">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
              </svg>
            </div>
            <span className="text-gray-700">分享到 Line</span>
          </button>

          {/* Facebook */}
          <button
            onClick={() => handleShare('facebook')}
            className="w-full px-4 py-2 flex items-center gap-3 hover:bg-gray-50 transition-colors"
          >
            <Facebook size={20} className="text-[#1877F2]" />
            <span className="text-gray-700">分享到 Facebook</span>
          </button>

          {/* Instagram */}
          <button
            onClick={() => handleShare('instagram')}
            className="w-full px-4 py-2 flex items-center gap-3 hover:bg-gray-50 transition-colors relative"
          >
            <div className="w-5 h-5">
              <svg viewBox="0 0 24 24" className="text-[#E4405F]" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </div>
            <span className="text-gray-700">下載並分享到 IG</span>
          </button>
        </div>
      )}
      
      {showCopiedMessage && (
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-3 py-1 rounded text-sm whitespace-nowrap">
          已複製分享文字！
        </div>
      )}
    </div>
  );
};

const Step4Result: React.FC<Step4ResultProps> = ({
  generatedContent,
  selectedDestination,
  handleDownloadImage,
  generateTravelContent,
  resetAll
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!generatedContent) return null;

  // 假設生成的圖片 URL 是 base64 格式，我們需要將其轉換為可分享的 URL
  // 這裡僅作示範，實際應用中可能需要將圖片上傳到 CDN 或其他存儲服務
  const shareableImageUrl = generatedContent.url.startsWith('data:') 
    ? window.location.origin + '/api/share-image?id=' + encodeURIComponent(generatedContent.url.split(',')[1].substring(0, 20))
    : generatedContent.url;

  return (
    <div className="max-w-md mx-auto text-center mt-12">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">你的專屬旅遊穿搭照片 ✨</h2>
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        {/* 生成的圖片區塊 - 添加hover效果和cursor指示 */}
        <div className="relative group cursor-pointer mb-8" onClick={() => setIsFullscreen(true)}>
          <img
            src={generatedContent.url}
            alt="AI生成的穿搭照片"
            className="w-full max-w-2xl mx-auto rounded-xl shadow-lg transition-transform duration-200 group-hover:opacity-95"
          />
          {/* Hover時顯示的放大icon提示 */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="bg-black/50 p-3 rounded-full">
              <Maximize2 className="text-white w-6 h-6" />
            </div>
          </div>
        </div>

        {/* 全螢幕Modal */}
        {isFullscreen && (
          <div 
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center cursor-zoom-out"
            onClick={() => setIsFullscreen(false)}
          >
            <img
              src={generatedContent.url}
              alt="AI生成的穿搭照片"
              className="max-h-[90vh] max-w-[90vw] object-contain"
            />
          </div>
        )}

        {/* AI 教練評語 */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="text-purple-600" size={18} />
            <span className="font-medium text-purple-800">AI 穿搭教練</span>
          </div>
          <p className="text-gray-700 mb-3">{generatedContent.coachMessage}</p>
          {generatedContent.fashionTip && (
            <p className="text-gray-600 text-sm border-t border-purple-100 pt-3">{generatedContent.fashionTip}</p>
          )}
        </div>

        <div className="flex justify-center gap-4 flex-wrap">
          <button 
            onClick={handleDownloadImage}
            className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
          >
            <Download size={20} />
            下載照片
          </button>
          
          <SocialShare 
            imageUrl={shareableImageUrl}
            destinationName={selectedDestination?.name || ''}
          />
        </div>
      </div>
      <div className="flex justify-center gap-4">
        <button
          onClick={generateTravelContent}
          className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-3 rounded-lg hover:shadow-lg transition-all cursor-pointer"
        >
          生成另一套穿搭
        </button>
        <button
          onClick={resetAll}
          className="bg-gray-200 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-300 transition-all cursor-pointer"
        >
          重新開始
        </button>
      </div>
    </div>
  );
};

export default Step4Result; 