import React, { useRef, useState } from 'react';
import { User } from 'lucide-react';

interface SelfieUploadProps {
  selfieImage: { file: File; preview: string | ArrayBuffer | null } | null;
  setSelfieImage: React.Dispatch<React.SetStateAction<{ file: File; preview: string | ArrayBuffer | null } | null>>;
}

const SelfieUpload: React.FC<SelfieUploadProps> = ({ selfieImage, setSelfieImage }) => {
  const selfieInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

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

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files[0] && files[0].type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelfieImage({
          file: files[0],
          preview: e.target?.result || null
        });
      };
      reader.readAsDataURL(files[0]);
    }
  };

  const handleSelfieUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelfieImage({
          file,
          preview: e.target?.result || null
        });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">上傳個人照片</h2>
        <p className="text-gray-600">請上傳背景簡潔、清晰的個人照。</p>
      </div>

      {!selfieImage ? (
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
          onClick={() => selfieInputRef.current?.click()}
        >
          <input
            type="file"
            ref={selfieInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleSelfieUpload}
          />
          
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-pink-500/10 to-purple-500/10 rounded-full flex items-center justify-center">
              <User className={`w-8 h-8 ${isDragging ? 'text-purple-600' : 'text-pink-500'} transition-colors duration-300`} />
            </div>
            <p className={`text-lg font-medium mb-2 ${isDragging ? 'text-purple-600' : 'text-pink-600'} transition-colors duration-300`}>
              {isDragging ? '放開以上傳照片' : '點擊或拖曳照片至此'}
            </p>
            <p className="text-sm text-gray-500">
              支援 JPG、PNG 格式
            </p>
          </div>
        </div>
      ) : (
        <div className="relative w-full max-w-md mx-auto">
          <img
            src={selfieImage.preview as string}
            alt="已上傳的個人照片"
            className="w-full h-auto rounded-xl shadow-lg"
          />
          <button
            onClick={() => setSelfieImage(null)}
            className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default SelfieUpload; 