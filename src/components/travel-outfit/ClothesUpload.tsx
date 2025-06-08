import React, { useRef } from 'react';
import { Camera, Check } from 'lucide-react';

type UploadedCloth = {
  id: number;
  file: File;
  preview: string | ArrayBuffer | null;
  name: string;
};

interface Step1ClothesUploadProps {
  uploadedClothes: UploadedCloth[];
  setUploadedClothes: React.Dispatch<React.SetStateAction<UploadedCloth[]>>;
}

// 工具函式：fetch public file as File
async function fetchPublicFileAsFile(url: string, name: string, type?: string) {
  const res = await fetch(url);
  const blob = await res.blob();
  return new File([blob], name, { type: type || blob.type });
}

const Step1ClothesUpload: React.FC<Step1ClothesUploadProps> = ({
  uploadedClothes,
  setUploadedClothes
}) => {
  const clothesInputRef = useRef<HTMLInputElement>(null);

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

  return (
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
};

export default Step1ClothesUpload; 