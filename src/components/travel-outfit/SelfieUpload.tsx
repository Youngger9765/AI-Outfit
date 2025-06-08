import React, { useRef } from 'react';
import { User, Check } from 'lucide-react';

interface SelfieImage {
  file: File;
  preview: string | ArrayBuffer | null;
}

interface Step2SelfieUploadProps {
  selfieImage: SelfieImage | null;
  setSelfieImage: React.Dispatch<React.SetStateAction<SelfieImage | null>>;
}

// 工具函式：fetch public file as File
async function fetchPublicFileAsFile(url: string, name: string, type?: string) {
  const res = await fetch(url);
  const blob = await res.blob();
  return new File([blob], name, { type: type || blob.type });
}

const Step2SelfieUpload: React.FC<Step2SelfieUploadProps> = ({
  selfieImage,
  setSelfieImage
}) => {
  const selfieInputRef = useRef<HTMLInputElement>(null);

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

  return (
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
};

export default Step2SelfieUpload; 