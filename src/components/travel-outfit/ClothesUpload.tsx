import React, { useRef, useState } from 'react';
import { Camera, Check } from 'lucide-react';
import imageCompression from 'browser-image-compression';

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

// 圖片壓縮選項
const compressionOptions = {
  maxSizeMB: 1, // 最大檔案大小
  maxWidthOrHeight: 1920, // 最大寬度或高度
  useWebWorker: true, // 使用 Web Worker 進行壓縮
};

const Step1ClothesUpload: React.FC<Step1ClothesUploadProps> = ({
  uploadedClothes,
  setUploadedClothes
}) => {
  const clothesInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // 拖曳事件
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    for (const file of files) {
      if (file.type.startsWith('image/')) {
        try {
          const compressedFile = await imageCompression(file, compressionOptions);
          const reader = new FileReader();
          reader.onload = (e) => {
            setUploadedClothes(prev => [
              ...prev,
              {
                id: Date.now() + Math.random(),
                file: compressedFile,
                preview: e.target?.result || null,
                name: file.name
              }
            ]);
          };
          reader.readAsDataURL(compressedFile);
        } catch (error) {
          console.error('圖片壓縮失敗:', error);
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
        }
      }
    }
  };

  // 點擊 input 上傳
  const handleClothesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    for (const file of files) {
      if (file.type.startsWith('image/')) {
        try {
          const compressedFile = await imageCompression(file, compressionOptions);
          const reader = new FileReader();
          reader.onload = (e) => {
            setUploadedClothes(prev => [
              ...prev,
              {
                id: Date.now() + Math.random(),
                file: compressedFile,
                preview: e.target?.result || null,
                name: file.name
              }
            ]);
          };
          reader.readAsDataURL(compressedFile);
        } catch (error) {
          console.error('圖片壓縮失敗:', error);
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
        }
      }
    }
  };

  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">上傳你的衣服</h2>
        <p className="text-gray-600">請上傳背景單一、光線充足的衣物照片</p>
      </div>

      {/* Upload Area */}
      <div 
        className={`
          w-full p-8 mb-6 rounded-xl
          border-3 border-dashed
          transition-all duration-300 ease-in-out
          ${isDragging 
            ? 'border-purple-500 bg-purple-50' 
            : 'border-pink-300 hover:border-pink-500 bg-gradient-to-br from-purple-50/30 via-pink-50/30 to-white hover:from-purple-50/50 hover:via-pink-50/50 hover:to-white'
          }
          cursor-pointer
          flex flex-col items-center justify-center
          min-h-[200px]
          relative
        `}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => clothesInputRef.current?.click()}
      >
        <input
          ref={clothesInputRef}
          type="file"
          className="hidden"
          accept="image/*"
          multiple
          onChange={handleClothesUpload}
        />
        
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-pink-500/10 to-purple-500/10 rounded-full flex items-center justify-center">
            <svg 
              className={`w-8 h-8 ${isDragging ? 'text-purple-600' : 'text-pink-500'} transition-colors duration-300`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
              />
            </svg>
          </div>
          <p className={`text-lg font-medium mb-2 ${isDragging ? 'text-purple-600' : 'text-pink-600'} transition-colors duration-300`}>
            {isDragging ? '放開以上傳圖片' : '點擊或拖曳圖片至此'}
          </p>
          <p className="text-sm text-gray-500">
            支援 JPG、PNG 格式
          </p>
        </div>
      </div>

      {/* Uploaded Images Preview */}
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