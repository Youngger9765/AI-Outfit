import React from 'react';
import Image from 'next/image';
import { Check } from 'lucide-react';

interface LocationPhotoSelectorProps {
  photos: { url: string; alt?: string; id?: string | number }[];
  selectedPhoto: string | null;
  onSelect: (url: string) => void;
  className?: string;
}

const LocationPhotoSelector: React.FC<LocationPhotoSelectorProps> = ({
  photos,
  selectedPhoto,
  onSelect,
  className = '',
}) => {
  // 根據照片數量決定網格布局
  const getGridClass = (photoCount: number) => {
    if (photoCount === 1) return 'grid-cols-1';
    if (photoCount === 2) return 'grid-cols-2';
    if (photoCount <= 4) return 'grid-cols-2';
    return 'grid-cols-3';
  };

  return (
    <div className={`grid gap-4 ${getGridClass(photos.length)} ${className}`}>
      {photos.map((photo, idx) => (
        <div
          key={photo.id || photo.url || idx}
          className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group"
          onClick={() => onSelect(photo.url)}
        >
          {/* next/image 只支援已設定 domain，否則 fallback 用 <img> */}
          {photo.url.match(/^https:\/\/images\.pexels\.com\//) ? (
            <Image
              src={photo.url}
              alt={photo.alt || '地點照片'}
              fill
              className="object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photo.url}
              alt={photo.alt || '地點照片'}
              className="w-full h-full object-cover absolute inset-0"
            />
          )}
          {selectedPhoto === photo.url && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <Check className="text-white" size={32} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default LocationPhotoSelector; 